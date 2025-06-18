import { env } from '$env/dynamic/private'
import {
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

export class BucketClient {
  bucket: string
  #s3client: S3Client

  constructor(bucket: string, region: string) {
    this.bucket = bucket
    const endpoint = env.AWS_S3_ENDPOINT
    const accessKeyId = env.AWS_ACCESS_KEY_ID
    const secretAccessKey = env.AWS_SECRET_ACCESS_KEY
    this.#s3client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  async listObjects(prefix = '') {
    const command = new ListObjectsCommand({
      Bucket: this.bucket,
      Prefix: prefix,
    })
    const data = await this.#s3client.send(command)
    return data
  }

  async getObjectMetadata(key: string) {
    const command = new HeadObjectCommand({ Bucket: this.bucket, Key: key })
    const data = await this.#s3client.send(command)
    return data
  }

  async putObject(
    key: string,
    body: Uint8Array,
    contentType?: string,
    contentEncoding?: string,
    metadata?: Record<string, string>
  ) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentEncoding: contentEncoding,
      CacheControl: contentEncoding ? 'no-transform' : undefined,
      Metadata: metadata,
    })
    const data = await this.#s3client.send(command)
    return data
  }

  async copyObject(sourceKey: string, targetKey: string) {
    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `/${this.bucket}/${sourceKey}`,
      Key: targetKey,
    })
    const data = await this.#s3client.send(command)
    return data
  }
}
