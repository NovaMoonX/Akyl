import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useTheme } from '../contexts/ThemeContext';
import type { BudgetItemCadence } from '../lib';
import { useSpace } from '../store';
import { toKebabCase } from '../utils';

function downloadImage(
  dataUrl: string,
  title: string,
  timeWindow: BudgetItemCadence,
  sheetName?: string,
) {
  const a = document.createElement('a');

  const formattedTitle = toKebabCase(title || 'Untitled Space');
  const formattedTimeWindow = `${timeWindow.interval}${timeWindow.type}${timeWindow.interval > 1 ? 's' : ''}`;
  const sheetSuffix = sheetName ? `-${toKebabCase(sheetName)}` : '';

  a.setAttribute(
    'download',
    `${formattedTitle}${sheetSuffix}-${formattedTimeWindow}.png`,
  );
  a.setAttribute('href', dataUrl);
  a.click();
}

export function getImageFilename(
  title: string,
  timeWindow: BudgetItemCadence,
  sheetName?: string,
): string {
  const formattedTitle = toKebabCase(title || 'Untitled Space');
  const formattedTimeWindow = `${timeWindow.interval}${timeWindow.type}${timeWindow.interval > 1 ? 's' : ''}`;
  const sheetSuffix = sheetName ? `-${toKebabCase(sheetName)}` : '';
  return `${formattedTitle}${sheetSuffix}-${formattedTimeWindow}.png`;
}

const PADDING_FACTOR = 0.1; // 10% padding
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;

// REF: https://reactflow.dev/examples/misc/download-image
export default function useDownloadPng() {
  const { getNodes } = useReactFlow();
  const [title, timeWindow, sheets, setActiveSheet] = useSpace(
    useShallow((state) => [
      state?.space?.title,
      state?.space?.config?.timeWindow,
      state?.space?.sheets,
      state.setActiveSheet,
    ]),
  );
  const { theme } = useTheme();

  const captureImage = useCallback(() => {
    const nodesBounds = getNodesBounds(getNodes());

    // Calculate dimensions based on node bounds to ensure all nodes fit
    const boundsWidth = nodesBounds.width;
    const boundsHeight = nodesBounds.height;

    // Add padding around the nodes (10% on each side)
    const imageWidth = Math.max(
      MIN_WIDTH,
      boundsWidth * (1 + PADDING_FACTOR * 2),
    );
    const imageHeight = Math.max(
      MIN_HEIGHT,
      boundsHeight * (1 + PADDING_FACTOR * 2),
    );

    // Calculate viewport with much more flexible zoom constraints
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.05, // Allow significant zoom out
      10, // Allow significant zoom in
      PADDING_FACTOR,
    );

    const viewportEl = document.querySelector(
      '.react-flow__viewport',
    ) as HTMLElement;
    if (!viewportEl) {
      console.error('Viewport not found');
      return Promise.reject(new Error('Viewport not found'));
    }

    return toPng(viewportEl, {
      backgroundColor: theme === 'dark' ? '#1f2937' : '#f0fdfa',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom / 1.25})`,
      },
    });
  }, [getNodes, theme]);

  const captureAndDownload = useCallback(
    (sheetName?: string) => {
      return captureImage().then((url) =>
        downloadImage(url, title, timeWindow, sheetName),
      );
    },
    [captureImage, title, timeWindow],
  );

  const download = useCallback(() => {
    return captureAndDownload();
  }, [captureAndDownload]);

  const captureSheetImage = useCallback(
    async (sheetId: string): Promise<{ filename: string; dataUrl: string }> => {
      const currentActiveSheet =
        useSpace.getState()?.space?.config?.activeSheet || 'all';

      // Determine sheet name for filename
      let sheetName: string | undefined;
      if (sheetId === 'all') {
        sheetName = 'All';
      } else {
        const sheet = sheets?.find((s) => s.id === sheetId);
        sheetName = sheet?.name;
      }

      const filename = getImageFilename(title, timeWindow, sheetName);

      // If already on the correct sheet, just capture
      if (currentActiveSheet === sheetId) {
        const dataUrl = await captureImage();
        return { filename, dataUrl };
      }

      // Switch to the sheet, wait for render, then capture
      setActiveSheet(sheetId);

      // Use a promise-based approach to ensure sequential execution
      return new Promise<{ filename: string; dataUrl: string }>(
        (resolve, reject) => {
          // Wait 500ms for React Flow to re-render with the new sheet's filtered items
          setTimeout(() => {
            captureImage()
              .then((dataUrl) => {
                // Wait 100ms before restoring to ensure capture has completed
                setTimeout(() => {
                  setActiveSheet(currentActiveSheet);
                  resolve({ filename, dataUrl });
                }, 100);
              })
              .catch((error) => {
                // Always restore the original sheet even if capture fails
                setActiveSheet(currentActiveSheet);
                console.error('Failed to capture sheet image:', error);
                reject(error);
              });
          }, 500);
        },
      );
    },
    [captureImage, sheets, setActiveSheet, title, timeWindow],
  );

  const downloadSheet = useCallback(
    async (sheetId: string) => {
      const currentActiveSheet =
        useSpace.getState()?.space?.config?.activeSheet || 'all';

      // Determine sheet name for filename
      let sheetName: string | undefined;
      if (sheetId === 'all') {
        sheetName = 'All';
      } else {
        const sheet = sheets?.find((s) => s.id === sheetId);
        sheetName = sheet?.name;
      }

      // If already on the correct sheet, just download
      if (currentActiveSheet === sheetId) {
        return captureAndDownload(sheetName);
      }

      // Switch to the sheet, wait for render, then capture
      setActiveSheet(sheetId);

      // Use a promise-based approach to ensure sequential execution
      return new Promise<void>((resolve, reject) => {
        // Wait 500ms for React Flow to re-render with the new sheet's filtered items
        setTimeout(() => {
          captureAndDownload(sheetName)
            .then(() => {
              // Wait 100ms before restoring to ensure download has initiated
              setTimeout(() => {
                setActiveSheet(currentActiveSheet);
                resolve();
              }, 100);
            })
            .catch((error) => {
              // Always restore the original sheet even if download fails
              setActiveSheet(currentActiveSheet);
              console.error('Failed to download sheet image:', error);
              reject(error);
            });
        }, 500);
      });
    },
    [captureAndDownload, sheets, setActiveSheet],
  );

  return {
    download,
    downloadSheet,
    captureSheetImage,
  };
}
