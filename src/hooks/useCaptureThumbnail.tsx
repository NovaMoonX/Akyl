import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { uploadThumbnail } from '../firebase';
import type { Theme } from '../lib';
import { useSpace } from '../store';

const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 300;
const THUMBNAIL_PADDING = 0.08;
// Delay after space loads (or theme changes) before capturing (ms)
const CAPTURE_DELAY = 2500;

export const THUMBNAIL_KEY_LIGHT = (spaceId: string) =>
  `${spaceId}_thumbnail_light`;
export const THUMBNAIL_KEY_DARK = (spaceId: string) =>
  `${spaceId}_thumbnail_dark`;
/** Legacy single-theme key kept for backwards-compatible fallback reads. */
export const THUMBNAIL_KEY = (spaceId: string) => `${spaceId}_thumbnail`;

export default function useCaptureThumbnail() {
  const { getNodes } = useReactFlow();
  const { theme } = useTheme();
  const { currentUser, cryptoKey } = useAuth();
  const [spaceId] = useSpace(useShallow((state) => [state?.space?.id]));

  // Tracks which themes have already been captured for the current space.
  const capturedThemes = useRef(new Set<Theme>());

  // Clear captured-set whenever the space changes.
  useEffect(() => {
    capturedThemes.current.clear();
  }, [spaceId]);

  const captureThumbnail = useCallback(
    async (targetTheme: Theme) => {
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
          backgroundColor: targetTheme === 'dark' ? '#1f2937' : '#f0fdfa',
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
          style: {
            width: `${THUMBNAIL_WIDTH}px`,
            height: `${THUMBNAIL_HEIGHT}px`,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          },
        });

        const storageKey =
          targetTheme === 'dark'
            ? THUMBNAIL_KEY_DARK(spaceId)
            : THUMBNAIL_KEY_LIGHT(spaceId);

        // Store in localStorage for instant access on the homepage.
        localStorage.setItem(storageKey, dataUrl);

        // Upload to Firebase Storage for authenticated users.
        if (currentUser?.uid && cryptoKey) {
          uploadThumbnail({
            userId: currentUser.uid,
            spaceId,
            dataUrl,
            theme: targetTheme,
          }).catch((err) => {
            // Non-fatal: thumbnail still available from localStorage.
            console.warn('Failed to upload thumbnail:', err);
          });
        }
      } catch (err) {
        console.warn('Failed to capture thumbnail:', err);
      }
    },
    [getNodes, spaceId, currentUser?.uid, cryptoKey],
  );

  // Schedule a capture whenever the space loads or the active theme changes,
  // but only once per (space, theme) combination.
  useEffect(() => {
    if (!spaceId || capturedThemes.current.has(theme)) return;

    const timer = setTimeout(() => {
      capturedThemes.current.add(theme);
      captureThumbnail(theme);
    }, CAPTURE_DELAY);

    return () => clearTimeout(timer);
  }, [spaceId, theme, captureThumbnail]);
}
