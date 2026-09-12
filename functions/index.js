const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')

initializeApp()

exports.deleteClientCompletely = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'لازم تسجل دخول كمسؤول')
  }

  const db = getFirestore()
  const callerRef = db.collection('users').doc(request.auth.uid)
  const callerSnap = await callerRef.get()

  if (!callerSnap.exists || callerSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'الحذف الكامل متاح للسوبر أدمن فقط')
  }

  const uid = typeof request.data?.uid === 'string' ? request.data.uid.trim() : ''
  const restaurantId = typeof request.data?.restaurantId === 'string' ? request.data.restaurantId.trim() : ''

  if (!uid && !restaurantId) {
    throw new HttpsError('invalid-argument', 'مفيش حساب أو نشاط محدد للحذف')
  }

  if (uid && uid === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'مينفعش تحذف حساب السوبر أدمن من لوحة الإدارة')
  }

  const restaurantRefs = new Map()

  if (restaurantId) {
    const ref = db.collection('restaurants').doc(restaurantId)
    restaurantRefs.set(ref.path, ref)
  }

  if (uid) {
    const owned = await db.collection('restaurants').where('owner_id', '==', uid).get()
    for (const doc of owned.docs) restaurantRefs.set(doc.ref.path, doc.ref)
  }

  for (const ref of restaurantRefs.values()) {
    await db.recursiveDelete(ref)
  }

  if (uid) {
    await db.recursiveDelete(db.collection('users').doc(uid))
    try {
      await getAuth().deleteUser(uid)
    } catch (err) {
      if (err?.code !== 'auth/user-not-found') throw err
    }
  }

  return { ok: true }
})
