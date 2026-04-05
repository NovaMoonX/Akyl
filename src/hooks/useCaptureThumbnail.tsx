import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { uploadThumbnail } from '../firebase';
import { useSpace } from '../store';

const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 300;
const THUMBNAIL_PADDING = 0.08;
// Delay after space loads before capturing (ms)
const CAPTURE_DELAY = 2500;

export const THUMBNAIL_KEY = (spaceId: string) => `${spaceId}_thumbnail`;

export default function useCaptureThumbnail() {
  const { getNodes } = useReactFlow();
  const { theme } = useTheme();
  const { currentUser, cryptoKey } = useAuth();
  const [spaceId] = useSpace(useShallow((state) => [state?.space?.id]));
  const hasCaptured = useRef(false);

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
        0.02,
        2,
        THUMBNAIL_PADDING,
      );

      const dataUrl = await toPng(viewportEl, {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f0fdfa',
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        style: {
          width: `${THUMBNAIL_WIDTH}px`,
          height: `${THUMBNAIL_HEIGHT}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      // Store in localStorage for instant access on homepage
      localStorage.setItem(THUMBNAIL_KEY(spaceId), dataUrl);

      // Upload to Firebase Storage for authenticated users
      if (currentUser?.uid && cryptoKey) {
        uploadThumbnail({
          userId: currentUser.uid,
          spaceId,
          dataUrl,
        }).catch((err) => {
          // Non-fatal: thumbnail still available from localStorage
          console.warn('Failed to upload thumbnail:', err);
        });
      }
    } catch (err) {
      console.warn('Failed to capture thumbnail:', err);
    }
  }, [getNodes, theme, spaceId, currentUser?.uid, cryptoKey]);

  // Capture once after the space finishes rendering
  useEffect(() => {
    if (!spaceId) return;
    hasCaptured.current = false;
  }, [spaceId]);

  useEffect(() => {
    if (!spaceId || hasCaptured.current) return;

    const timer = setTimeout(() => {
      hasCaptured.current = true;
      captureThumbnail();
    }, CAPTURE_DELAY);

    return () => clearTimeout(timer);
  }, [spaceId, captureThumbnail]);
}
