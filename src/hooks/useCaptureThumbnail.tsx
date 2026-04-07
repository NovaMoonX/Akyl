import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../contexts/AuthContext';
import { uploadThumbnail } from '../firebase';
import { useSpace } from '../store';

const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 300;
const THUMBNAIL_PADDING = 0.08;
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 2;
// Delay after space changes before capturing (ms)
const CAPTURE_DELAY = 2500;

export const THUMBNAIL_KEY = (spaceId: string) => `${spaceId}_thumbnail`;

export default function useCaptureThumbnail() {
  const { getNodes } = useReactFlow();
  const { currentUser, cryptoKey } = useAuth();
  const [spaceId, updatedAt] = useSpace(
    useShallow((state) => [state?.space?.id, state?.space?.metadata?.updatedAt]),
  );

  // Track the last updatedAt for which we captured the thumbnail so we only
  // capture once per save, not on every re-render.
  const lastCapturedAt = useRef<number | undefined>(undefined);

  /**
   * Capture a single transparent-background thumbnail.
   * Because the background is transparent the same image works on both
   * light and dark homepage cards without any theme toggling.
   */
  const captureThumbnail = useCallback(async () => {
    if (!spaceId) return;

    const nodes = getNodes();
    if (!nodes.length) return;

    const viewportEl = document.querySelector(
      '.react-flow__viewport',
    ) as HTMLElement;
    if (!viewportEl) return;

    try {
      const nodesBounds = getNodesBounds(nodes);
      const viewport = getViewportForBounds(
        nodesBounds,
        THUMBNAIL_WIDTH,
        THUMBNAIL_HEIGHT,
        MIN_ZOOM,
        MAX_ZOOM,
        THUMBNAIL_PADDING,
      );

      const dataUrl = await toPng(viewportEl, {
        backgroundColor: 'transparent',
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        style: {
          width: `${THUMBNAIL_WIDTH}px`,
          height: `${THUMBNAIL_HEIGHT}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      // Store in localStorage for instant access on the homepage.
      localStorage.setItem(THUMBNAIL_KEY(spaceId), dataUrl);

      // Upload to Firebase Storage for authenticated users.
      if (currentUser?.uid && cryptoKey) {
        uploadThumbnail({
          userId: currentUser.uid,
          spaceId,
          dataUrl,
        }).catch((err) => {
          // Non-fatal: thumbnail still available from localStorage.
          console.warn('Failed to upload thumbnail:', err);
        });
      }
    } catch (err) {
      console.warn('Failed to capture thumbnail:', err);
    }
  }, [getNodes, spaceId, currentUser?.uid, cryptoKey]);

  // Schedule a capture whenever the space data changes (updatedAt bumps).
  useEffect(() => {
    if (!spaceId || !updatedAt) return;
    if (lastCapturedAt.current === updatedAt) return;

    const timer = setTimeout(() => {
      lastCapturedAt.current = updatedAt;
      captureThumbnail();
    }, CAPTURE_DELAY);

    return () => clearTimeout(timer);
  }, [spaceId, updatedAt, captureThumbnail]);
}
