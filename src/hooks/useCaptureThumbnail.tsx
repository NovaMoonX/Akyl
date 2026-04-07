import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAuth } from '../contexts/AuthContext';
import { uploadThumbnail } from '../firebase';
import type { Theme } from '../lib';
import { useSpace } from '../store';

const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 300;
const THUMBNAIL_PADDING = 0.08;
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 2;
// Delay after space changes before capturing (ms)
const CAPTURE_DELAY = 2500;

export const THUMBNAIL_KEY_LIGHT = (spaceId: string) =>
  `${spaceId}_thumbnail_light`;
export const THUMBNAIL_KEY_DARK = (spaceId: string) =>
  `${spaceId}_thumbnail_dark`;

export default function useCaptureThumbnail() {
  const { getNodes } = useReactFlow();
  const { currentUser, cryptoKey } = useAuth();
  const [spaceId, updatedAt] = useSpace(
    useShallow((state) => [state?.space?.id, state?.space?.metadata?.updatedAt]),
  );

  // Track the last updatedAt for which we captured thumbnails so we only
  // capture once per save, not on every re-render.
  const lastCapturedAt = useRef<number | undefined>(undefined);

  const captureSingleThumbnail = useCallback(
    async (
      viewportEl: HTMLElement,
      nodesBounds: ReturnType<typeof getNodesBounds>,
      targetTheme: Theme,
    ) => {
      if (!spaceId) return;

      const viewport = getViewportForBounds(
        nodesBounds,
        THUMBNAIL_WIDTH,
        THUMBNAIL_HEIGHT,
        MIN_ZOOM,
        MAX_ZOOM,
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
    },
    [spaceId, currentUser?.uid, cryptoKey],
  );

  /**
   * Capture both light and dark thumbnails in sequence.
   * Temporarily toggles the document theme for each capture so the CSS
   * dark-mode variants are applied correctly, then restores the original.
   */
  const captureBothThumbnails = useCallback(async () => {
    if (!spaceId) return;

    const nodes = getNodes();
    if (!nodes.length) return;

    const viewportEl = document.querySelector(
      '.react-flow__viewport',
    ) as HTMLElement;
    if (!viewportEl) return;

    const nodesBounds = getNodesBounds(nodes);
    const wasDark = document.documentElement.classList.contains('dark');

    for (const targetTheme of ['light', 'dark'] as Theme[]) {
      try {
        // Temporarily switch to the target theme so CSS dark: variants apply.
        document.documentElement.classList.toggle(
          'dark',
          targetTheme === 'dark',
        );

        // Wait for the browser to repaint with the new theme.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );

        await captureSingleThumbnail(viewportEl, nodesBounds, targetTheme);
      } catch (err) {
        console.warn(`Failed to capture ${targetTheme} thumbnail:`, err);
      }
    }

    // Restore the original theme.
    document.documentElement.classList.toggle('dark', wasDark);
  }, [getNodes, spaceId, captureSingleThumbnail]);

  // Schedule a capture whenever the space data changes (updatedAt bumps).
  useEffect(() => {
    if (!spaceId || !updatedAt) return;
    if (lastCapturedAt.current === updatedAt) return;

    const timer = setTimeout(() => {
      lastCapturedAt.current = updatedAt;
      captureBothThumbnails();
    }, CAPTURE_DELAY);

    return () => clearTimeout(timer);
  }, [spaceId, updatedAt, captureBothThumbnails]);
}
