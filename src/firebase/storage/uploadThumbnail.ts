import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import type { Theme } from '../../lib';
import { storage } from '../config';

/**
 * Uploads a thumbnail data URL to Firebase Storage.
 * Each space has a separate file per theme variant (light / dark).
 *
 * Path is scoped under /users/{userId}/ to match Firebase Storage security
 * rules that restrict access to the authenticated user.
 *
 * @returns The public download URL of the uploaded thumbnail.
 */
export default async function uploadThumbnail({
  userId,
  spaceId,
  dataUrl,
  theme,
}: {
  userId: string;
  spaceId: string;
  dataUrl: string;
  theme: Theme;
}): Promise<string> {
  const thumbnailRef = ref(
    storage,
    `users/${userId}/thumbnails/${spaceId}_${theme}`,
  );
  await uploadString(thumbnailRef, dataUrl, 'data_url');
  const downloadUrl = await getDownloadURL(thumbnailRef);
  return downloadUrl;
}
