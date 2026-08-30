import fs from 'fs/promises'
import path from 'path'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

export type UploadResult = { key: string; size: number }

export interface StorageAdapter {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult>
  download(key: string): Promise<Buffer>
}

class LocalAdapter implements StorageAdapter {
  basePath: string
  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'storage')
  }
  async ensureBase() {
    await fs.mkdir(this.basePath, { recursive: true })
  }
  async upload(buffer: Buffer, filename: string) {
    await this.ensureBase()
    const key = `${Date.now()}-${uuidv4()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const filepath = path.join(this.basePath, key)
    await fs.writeFile(filepath, buffer)
    return { key, size: buffer.length }
  }
  async download(key: string) {
    const filepath = path.join(this.basePath, key)
    return fs.readFile(filepath)
  }
}

class S3Adapter implements StorageAdapter {
  client: S3Client
  bucket: string
  constructor() {
    this.client = new S3Client({ endpoint: process.env.STORAGE_ENDPOINT, region: process.env.AWS_REGION || 'us-east-1', credentials: { accessKeyId: process.env.STORAGE_ACCESS_KEY || '', secretAccessKey: process.env.STORAGE_SECRET_KEY || '' } })
    this.bucket = process.env.STORAGE_BUCKET || ''
  }
  async upload(buffer: Buffer, filename: string, mimeType: string) {
    const key = `${Date.now()}-${uuidv4()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: mimeType })
    await this.client.send(cmd)
    return { key, size: buffer.length }
  }
  async download(key: string) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    const res = await this.client.send(cmd)
    // res.Body is a stream. Collect it into Buffer
    const stream = res.Body as any
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
    return Buffer.concat(chunks)
  }
}

let adapter: StorageAdapter | null = null
export function getStorageAdapter() {
  if (adapter) return adapter
  if (process.env.STORAGE_ENDPOINT && process.env.STORAGE_BUCKET && process.env.STORAGE_ACCESS_KEY) {
    adapter = new S3Adapter()
  } else {
    adapter = new LocalAdapter()
  }
  return adapter
}
