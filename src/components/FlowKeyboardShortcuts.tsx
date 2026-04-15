import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useKeyboardShortcuts } from '../hooks';
import { useSpace } from '../store';

interface FlowKeyboardShortcutsProps {
  enabled: boolean;
}

/** Extra padding above the topmost nodes to account for super-text overflow (source/category labels). */
const NODE_OVERFLOW_TOP = 40;
/** Fallback chrome heights when DOM measurement isn't available. */
const CHROME_TOP_FALLBACK = 96;
const CHROME_BOTTOM_FALLBACK = 80;
const CHROME_PAD = 24; // extra breathing room on all sides

/**
 * Measure the actual header and bottom-bar height from the DOM.
 * Falls back to constants when the elements aren't found.
 */
function measureChrome() {
  const headerEl = document.querySelector('header');
  const bottomBarEl = document.querySelector('[data-bottom-bar]');
  const top = headerEl ? headerEl.getBoundingClientRect().height : CHROME_TOP_FALLBACK;
  // The bottom bar is fixed with bottom-4 (16px), so the effective chrome
  // is the bar height plus the gap from the viewport bottom.
  const bottom = bottomBarEl
    ? bottomBarEl.getBoundingClientRect().height + (window.innerHeight - bottomBarEl.getBoundingClientRect().bottom)
    : CHROME_BOTTOM_FALLBACK;
  return { top, bottom };
}

/**
 * Compute and apply a viewport transform that fits all non-hidden nodes within
 * the safe zone (viewport minus header/bottom chrome), then animates to it.
 */
export function applyFitViewToChrome(rf: ReturnType<typeof useReactFlow>) {
  const nodes = rf.getNodes().filter((n) => !n.hidden);
  if (!nodes.length) {
    rf.fitView({ padding: 0.15, duration: 300 });
    return;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { top: chromeTop, bottom: chromeBottom } = measureChrome();

  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const node of nodes) {
    const w = node.measured?.width ?? 200;
    const h = node.measured?.height ?? 100;
    x0 = Math.min(x0, node.position.x);
    y0 = Math.min(y0, node.position.y);
    x1 = Math.max(x1, node.position.x + w);
    y1 = Math.max(y1, node.position.y + h);
  }

  // Expand bounding box to account for super-text labels above the topmost nodes
  y0 -= NODE_OVERFLOW_TOP;

  const cw = x1 - x0;
  const ch = y1 - y0;

  const safeW = Math.max(vw - CHROME_PAD * 2, 1);
  const safeH = Math.max(vh - chromeTop - chromeBottom - CHROME_PAD * 2, 1);

  const zoom = Math.max(Math.min(safeW / cw, safeH / ch, 1.5), 0.15);

  // Center of the safe zone in screen coordinates
  const safeCx = CHROME_PAD + safeW / 2;
  const safeCy = chromeTop + CHROME_PAD + safeH / 2;

  // Viewport transform: screenPt = flowPt * zoom + (x, y)
  const x = safeCx - (x0 + cw / 2) * zoom;
  const y = safeCy - (y0 + ch / 2) * zoom;

  rf.setViewport({ x, y, zoom }, { duration: 300 });
}

/**
 * Component that handles keyboard shortcuts requiring ReactFlow instance access.
 * Must be rendered inside ReactFlow component to access the flow instance.
 */
export default function FlowKeyboardShortcuts({ enabled }: FlowKeyboardShortcutsProps) {
  const reactFlowInstance = useReactFlow();
  const viewMode = useSpace(useShallow((state) => state.viewMode));

  // View control handlers
  const handleFitView = useCallback(() => {
    if (viewMode === 'flowchart') {
      applyFitViewToChrome(reactFlowInstance);
    }
  }, [viewMode, reactFlowInstance]);

  const handleZoomIn = useCallback(() => {
    if (viewMode === 'flowchart') {
      reactFlowInstance.zoomIn({ duration: 300 });
    }
  }, [viewMode, reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (viewMode === 'flowchart') {
      reactFlowInstance.zoomOut({ duration: 300 });
    }
  }, [viewMode, reactFlowInstance]);

  // Define view control shortcuts
  useKeyboardShortcuts([
    {
      key: '0',
      ctrl: true,
      handler: handleFitView,
      description: 'Fit view',
    },
    {
      key: '+',
      ctrl: true,
      handler: handleZoomIn,
      description: 'Zoom in',
    },
    {
      key: '=',
      ctrl: true,
      handler: handleZoomIn,
      description: 'Zoom in (alternative)',
    },
    {
      key: '-',
      ctrl: true,
      handler: handleZoomOut,
      description: 'Zoom out',
    },
  ], enabled);

  // This component doesn't render anything
  return null;
}
