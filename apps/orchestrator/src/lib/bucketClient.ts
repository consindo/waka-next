import {
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
    this.#s3client = new S3Client({ region })
  }

  async listObjects(prefix: string = '') {
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
      Metadata: metadata,
    })
    const data = await this.#s3client.send(command)
    return data
  }
}
