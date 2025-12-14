/**
 * Checks if the current hostname is a Firebase preview/channel deployment
 * Returns true if NOT on the main production domain (akyl.moondreams.dev)
 */
export default function isFirebaseChannel(): boolean {
  const hostname = window.location.hostname;
  
  // Return true if on a Firebase channel (anything except the main domain)
  // This includes:
  // - Firebase preview URLs (e.g., project-name--channel-id.web.app)
  // - localhost for development testing
  return hostname !== 'akyl.moondreams.dev';
}
