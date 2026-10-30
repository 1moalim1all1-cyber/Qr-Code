// SteadyLink upload flow. This module must ONLY run on a trusted Firebase Functions server.
// Configure STEADYLINK_API_KEY as a Firebase Secret, and STEADYLINK_BUCKET_ID on server.
// No keys or bucket management operations may be exposed to the browser.
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { defineSecret } = require('firebase-functions/params');
const crypto = require('node:crypto');
const key = defineSecret('STEADYLINK_API_KEY');
const LIMIT = 8 * 1024 * 1024;
const API = 'https://api.steadylink.io';

async function authorized(uid, restaurantId) {
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(restaurantId || '')) throw new HttpsError('invalid-argument','Invalid restaurant');
  const db = getFirestore();
  const [profile, restaurant] = await Promise.all([
    db.collection('users').doc(uid).get(),
    db.collection('restaurants').doc(restaurantId).get()
  ]);
  if (!restaurant.exists) throw new HttpsError('not-found','Restaurant not found');
  const admin = profile.data()?.role === 'super_admin';
  const owner = restaurant.data()?.owner_id === uid;
  if (!admin && !owner) throw new HttpsError('permission-denied','Not authorized for this restaurant');
  return db;
}
async function steady(path, method, body) {
  const response = await fetch(API + path, {
    method, headers: { 'X-API-Key': key.value(), 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const raw = await response.text();
  let json; try { json = JSON.parse(raw); } catch { json = {}; }
  if (!response.ok) throw new HttpsError(response.status === 413 ? 'resource-exhausted' : 'failed-precondition',
    response.status === 413 ? 'Storage quota or file size exceeded' : 'Image service request failed');
  return json;
}
exports.beginSteadyImageUpload = onCall({ secrets: [key], maxInstances: 5 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first');
  const { restaurantId, size, contentType } = request.data || {};
  const db = await authorized(request.auth.uid, restaurantId);
  if (!['image/jpeg','image/png','image/webp'].includes(contentType) || !Number.isInteger(size) || size < 1 || size > LIMIT)
    throw new HttpsError('invalid-argument','Only JPEG, PNG or WebP images up to 8 MB');
  const bucketId = process.env.STEADYLINK_BUCKET_ID;
  if (!bucketId) throw new HttpsError('failed-precondition','Image storage is not configured');
  // Reserve a unique name to avoid replacing a different customer's image.
  const name = crypto.randomUUID() + (contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg');
  const result = await steady('/api/upload-batches', 'POST', { bucketId, files: [{ filename: name, path: 'restaurants/' + restaurantId + '/products/', contentType, size }] });
  const file = result.files?.[0];
  if (!file?.uploadUrl || !file?.id || !result.id) throw new HttpsError('internal','Unexpected upload response');
  await db.collection('pending_image_uploads').doc(file.id).set({
    uid: request.auth.uid, restaurantId, batchId: result.id, size, contentType,
    createdAt: FieldValue.serverTimestamp()
  });
  return { sessionId: file.id, uploadUrl: file.uploadUrl };
});
exports.finishSteadyImageUpload = onCall({ secrets: [key], maxInstances: 5 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated','Sign in first');
  const sessionId = request.data?.sessionId;
  if (typeof sessionId !== 'string' || sessionId.length > 128) throw new HttpsError('invalid-argument','Invalid session');
  const db = getFirestore();
  const ref = db.collection('pending_image_uploads').doc(sessionId);
  const record = await ref.get();
  if (!record.exists || record.data().uid !== request.auth.uid) throw new HttpsError('permission-denied','Unauthorized upload');
  await authorized(request.auth.uid, record.data().restaurantId);
  await steady('/api/upload-sessions/' + encodeURIComponent(sessionId) + '/complete', 'POST', {});
  const batch = await steady('/api/upload-batches/' + encodeURIComponent(record.data().batchId), 'GET');
  const file = batch.files?.find(f => f.id === sessionId);
  if (file?.status !== 'ready') return { status: file?.status || 'processing' };
  if (!file.url || !/^https:\/\/cdn\.steadylink\.io\/a\/[a-z0-9-]+$/i.test(file.url))
    throw new HttpsError('internal','Invalid published image URL');
  await ref.delete();
  return { status: 'ready', url: file.url };
});
