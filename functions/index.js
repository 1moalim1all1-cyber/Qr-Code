const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')

initializeApp()

function normalizeEgyptPhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '')
  if (digits.startsWith('0020')) digits = digits.slice(4)
  else if (digits.startsWith('20')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!/^1\d{9}$/.test(digits)) {
    throw new HttpsError('invalid-argument', 'اكتب رقم مصري صحيح مثل 01012345678')
  }
  return {
    local: `0${digits}`,
    international: `20${digits}`,
    pseudoEmail: `20${digits}@phone.smartqrmenu.app`,
  }
}

async function assertSuperAdmin(uid) {
  const db = getFirestore()
  const callerSnap = await db.collection('users').doc(uid).get()
  if (!callerSnap.exists || callerSnap.data().role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'العملية دي متاحة للسوبر أدمن فقط')
  }
  return { db, callerSnap }
}

exports.changeMyLoginPhone = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'لازم تسجل دخول كمسؤول')
  }

  const { db } = await assertSuperAdmin(request.auth.uid)
  const phone = normalizeEgyptPhone(request.data?.phone)
  const auth = getAuth()

  try {
    const existing = await auth.getUserByEmail(phone.pseudoEmail)
    if (existing.uid !== request.auth.uid) {
      throw new HttpsError('already-exists', 'الرقم ده مستخدم في حساب تاني بالفعل')
    }
  } catch (err) {
    if (err instanceof HttpsError) throw err
    if (err?.code !== 'auth/user-not-found') throw err
  }

  await auth.updateUser(request.auth.uid, { email: phone.pseudoEmail })
  await db.collection('users').doc(request.auth.uid).set({ phone: phone.local }, { merge: true })

  return {
    ok: true,
    phone: phone.local,
    loginEmail: phone.pseudoEmail,
  }
})

exports.deleteClientCompletely = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'لازم تسجل دخول كمسؤول')
  }

  const { db } = await assertSuperAdmin(request.auth.uid)

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
