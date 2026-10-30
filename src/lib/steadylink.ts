import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const functions = getFunctions(app)
const start = httpsCallable<{restaurantId:string,size:number,contentType:string},{sessionId:string,uploadUrl:string}>(functions,'beginSteadyImageUpload')
const finish = httpsCallable<{sessionId:string},{status:string,url?:string}>(functions,'finishSteadyImageUpload')
const sleep = (ms:number) => new Promise<void>(r => setTimeout(r,ms))

export async function uploadSteadyImage(file:File, restaurantId:string):Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('ارفع صورة JPG أو PNG أو WebP')
  if (file.size > 8 * 1024 * 1024) throw new Error('حجم الصورة لازم يكون أقل من 8 ميجا')
  const { data } = await start({restaurantId,size:file.size,contentType:file.type})
  const response = await fetch(data.uploadUrl,{method:'PUT',headers:{'Content-Type':'application/octet-stream'},body:file})
  if(!response.ok) throw new Error('فشل نقل الصورة لمساحة التخزين')
  for(let i=0;i<16;i++){
    const result = (await finish({sessionId:data.sessionId})).data
    if(result.status === 'ready' && result.url) return result.url
    if(['blocked','failed','cancelled'].includes(result.status)) throw new Error('لم يتم قبول الصورة في التخزين')
    await sleep(1200 + i*350)
  }
  throw new Error('الصورة لسه قيد الفحص؛ حاول تاني بعد شوية')
}
