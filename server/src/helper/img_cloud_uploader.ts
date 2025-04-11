import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
dotenv.config();

const credentialPath = '';
console.log('Credential Path:', credentialPath);
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || credentialPath, // path to your JSON key file
});

const BUCKET_NAME = process.env.BUCKET_NAME || ''; // replace with your bucket

export async function uploadScreenshotToGCS(localPath: string, objectName: string): Promise<string> {
  console.log('Uploading to GCS:', localPath, objectName);
  console.log('Bucket Name:', BUCKET_NAME);
  await storage.bucket(BUCKET_NAME).upload(localPath, {
    destination: objectName,
    metadata: {
      contentType: 'image/jpeg',
    },
  });

  // Return the public URL
  return `https://storage.googleapis.com/${BUCKET_NAME}/${objectName}`;
}