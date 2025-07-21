import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
// import sharp from 'sharp'; // Temporarily disabled due to build issues

export interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  expiresIn?: number;
}

export interface StoredImage {
  key: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  contentType: string;
  metadata?: Record<string, string>;
}

export class R2Storage {
  private client: S3Client;
  private config: R2StorageConfig;
  
  constructor(config: R2StorageConfig) {
    this.config = config;
    
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }
  
  async uploadImage(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<StoredImage> {
    const key = this.generateKey(options.contentType || 'image/webp');
    const contentType = options.contentType || 'image/webp';
    
    // Upload main image
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: options.metadata
    });
    
    await this.client.send(command);
    
    // Generate and upload thumbnail
    const thumbnailKey = this.getThumbnailKey(key);
    const thumbnailBuffer = await this.generateThumbnail(buffer);
    
    const thumbnailCommand = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/webp'
    });
    
    await this.client.send(thumbnailCommand);
    
    return {
      key,
      url: this.getPublicUrl(key),
      thumbnailUrl: this.getPublicUrl(thumbnailKey),
      size: buffer.length,
      contentType,
      metadata: options.metadata
    };
  }
  
  async uploadFromUrl(
    imageUrl: string,
    options: UploadOptions = {}
  ): Promise<StoredImage> {
    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return this.uploadImage(buffer, {
      ...options,
      contentType
    });
  }
  
  async getSignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key
    });
    
    return getSignedUrl(this.client, command, { expiresIn });
  }
  
  async deleteImage(key: string): Promise<void> {
    // Delete main image
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: key
    });
    
    await this.client.send(deleteCommand);
    
    // Delete thumbnail
    const thumbnailKey = this.getThumbnailKey(key);
    const deleteThumbnailCommand = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: thumbnailKey
    });
    
    try {
      await this.client.send(deleteThumbnailCommand);
    } catch (error) {
      // Thumbnail might not exist, ignore error
    }
  }
  
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      });
      
      await this.client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private generateKey(contentType: string): string {
    const extension = this.getExtension(contentType);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomId = crypto.randomBytes(16).toString('hex');
    
    return `images/${year}/${month}/${day}/${randomId}.${extension}`;
  }
  
  private getThumbnailKey(key: string): string {
    const parts = key.split('.');
    const extension = parts.pop();
    return `${parts.join('.')}_thumb.${extension}`;
  }
  
  private getPublicUrl(key: string): string {
    if (this.config.publicUrl) {
      return `${this.config.publicUrl}/${key}`;
    }
    
    // Default R2 public URL format
    return `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com/${key}`;
  }
  
  private getExtension(contentType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg'
    };
    
    return mimeToExt[contentType] || 'jpg';
  }
  
  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    // Temporarily return original buffer until Sharp is fixed
    // return sharp(buffer)
    //   .resize(400, 300, {
    //     fit: 'cover',
    //     position: 'center'
    //   })
    //   .webp({ quality: 80 })
    //   .toBuffer();
    return buffer;
  }
}