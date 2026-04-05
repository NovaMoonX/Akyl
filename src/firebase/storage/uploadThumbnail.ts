import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from '../config';

/**
 * Uploads a thumbnail data URL to Firebase Storage.
 * Required Firebase Storage security rules:
 *   match /thumbnails/{userId}/{spaceId} {
 *     allow read, write: if request.auth != null && request.auth.uid == userId;
 *   }
 *
 * @returns The public download URL of the uploaded thumbnail.
 */
export default async function uploadThumbnail({
  userId,
  spaceId,
  dataUrl,
}: {
  userId: string;
  spaceId: string;
  dataUrl: string;
}): Promise<string> {
  const thumbnailRef = ref(storage, `thumbnails/${userId}/${spaceId}`);
  await uploadString(thumbnailRef, dataUrl, 'data_url');
  const downloadUrl = await getDownloadURL(thumbnailRef);
  return downloadUrl;
}
