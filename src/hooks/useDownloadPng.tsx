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
) {
  const a = document.createElement('a');

  const formattedTitle = toKebabCase(title || 'Untitled Space');
  const formattedTimeWindow = `${timeWindow.interval}${timeWindow.type}${timeWindow.interval > 1 ? 's' : ''}`;

  a.setAttribute('download', `${formattedTitle}-${formattedTimeWindow}.png`);
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
  const [title, timeWindow] = useSpace(
    useShallow((state) => [
      state?.space?.title,
      state?.space?.config?.timeWindow,
    ]),
  );
  const { theme } = useTheme();

  const download = useCallback(() => {
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
      return;
    }

    toPng(viewportEl, {
      backgroundColor: theme === 'dark' ? '#1f2937' : '#f0fdfa',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((url) => downloadImage(url, title, timeWindow));
  }, [getNodes, theme, title, timeWindow]);

  return {
    download,
  };
}
