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

  a.setAttribute('download', `${formattedTitle}${sheetSuffix}-${formattedTimeWindow}.png`);
  a.setAttribute('href', dataUrl);
  a.click();
}

const imageWidth = 1024;
const imageHeight = 768;
const minZoom = 0.5;
const maxZoom = 2;
const padding = 1;

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

  const captureAndDownload = useCallback((sheetName?: string) => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      minZoom,
      maxZoom,
      padding,
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
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((url) => downloadImage(url, title, timeWindow, sheetName));
  }, [getNodes, theme, title, timeWindow]);

  const download = useCallback(() => {
    return captureAndDownload();
  }, [captureAndDownload]);

  const downloadSheet = useCallback(async (sheetId: string) => {
    const currentActiveSheet = useSpace.getState()?.space?.config?.activeSheet || 'all';
    
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
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        captureAndDownload(sheetName).then(() => {
          // Restore the original active sheet after download completes
          setTimeout(() => {
            setActiveSheet(currentActiveSheet);
            resolve();
          }, 100);
        });
      }, 500);
    });
  }, [captureAndDownload, sheets, setActiveSheet]);

  return {
    download,
    downloadSheet,
  };
}
