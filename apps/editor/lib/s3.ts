import { S3Client } from '@aws-sdk/client-s3'

let _s3: S3Client | null = null

function getS3(): S3Client {
  if (!_s3) {
    if (!process.env.R2_ACCOUNT_ID) {
      console.warn('[S3] Warning: R2_ACCOUNT_ID is not set. S3 connection may fail.')
    }
    const endpoint = `https://${process.env.R2_ACCOUNT_ID || 'missing'}.r2.cloudflarestorage.com`
    _s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })
  }
  return _s3
}

// Lazy proxy — S3Client is only created on first property access
export const s3 = new Proxy({} as S3Client, {
  get(_target, prop, receiver) {
    const instance = getS3()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
