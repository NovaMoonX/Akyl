import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useReactFlow,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { Header, TableView } from '../components';
import { useInitSpace, useKeyboardShortcuts, usePersistCloud, usePersistLocally, useSpaceFlow } from '../hooks';
import { NO_BACKGROUND_VARIANT, URL_PARAM_FORM } from '../lib';
import { useSpace } from '../store';
import { useURL } from '../hooks';
import BottomBar from './BottomBar';
import { AnimatedInflowEdge, AnimatedOutflowEdge } from './edges';
import { HiddenNodeEdge } from './edges/HiddenNodeEdge';
import BudgetNode from './nodes/BudgetNode';
import CoreNode from './nodes/CoreNode';
import L1Node from './nodes/L1Node';
import FlowKeyboardShortcuts, { applyFitViewToChrome } from './FlowKeyboardShortcuts';
import FlowCaptureThumbnail from './FlowCaptureThumbnail';
import FlowHiddenCapture from './FlowHiddenCapture';

const nodeTypes = {
  core: CoreNode,
  L1: L1Node,
  budget: BudgetNode,
};

const edgeTypes = {
  inflow: AnimatedInflowEdge,
  outflow: AnimatedOutflowEdge,
  hidden: HiddenNodeEdge,
};

const DEFAULT_BACKGROUND = BackgroundVariant.Cross;
const BackgroundVariantGaps = {
  [BackgroundVariant.Cross]: 40,
  [BackgroundVariant.Dots]: 30,
  [BackgroundVariant.Lines]: 30,
} as const;
const BackgroundVariantSizes = {
  [BackgroundVariant.Cross]: 6,
  [BackgroundVariant.Dots]: 4,
  [BackgroundVariant.Lines]: undefined,
} as const;
const BackgroundVariantClasses = {
  [BackgroundVariant.Cross]: 'opacity-60 dark:opacity-70',
  [BackgroundVariant.Dots]: 'opacity-50 dark:opacity-70',
  [BackgroundVariant.Lines]: 'opacity-40 dark:opacity-30',
};

const VIEWPORT_KEY_PREFIX = 'akyl_vp_';

function readSavedViewport(spaceId: string): Viewport | null {
  try {
    const raw = localStorage.getItem(`${VIEWPORT_KEY_PREFIX}${spaceId}`);
    if (!raw) return null;
    const vp = JSON.parse(raw) as Viewport;
    if (typeof vp?.x === 'number' && typeof vp?.y === 'number' && typeof vp?.zoom === 'number') {
      return vp;
    }
  } catch { /* ignore */ }
  return null;
}

/** Inner component (inside ReactFlow) that owns the Controls + its fit-to-chrome handler. */
function FlowControls() {
  const rf = useReactFlow();
  const viewMode = useSpace(useShallow((s) => s.viewMode));

  const handleFitView = useCallback(() => {
    applyFitViewToChrome(rf);
  }, [rf]);

  if (viewMode !== 'flowchart') return null;

  return (
    <Controls
      position='bottom-right'
      showInteractive={false}
      onFitView={handleFitView}
    />
  );
}

export default function Flow() {
  useInitSpace();
  usePersistLocally();
  usePersistCloud();

  const { spaceId } = useURL();

  // Per-space viewport persistence
  const [savedViewport] = useState<Viewport | null>(() =>
    spaceId ? readSavedViewport(spaceId) : null,
  );
  const vpSaveTimerRef = useRef<number | null>(null);
  const handleViewportChange = useCallback(
    (viewport: Viewport) => {
      if (!spaceId) return;
      if (vpSaveTimerRef.current !== null) clearTimeout(vpSaveTimerRef.current);
      vpSaveTimerRef.current = window.setTimeout(() => {
        localStorage.setItem(`${VIEWPORT_KEY_PREFIX}${spaceId}`, JSON.stringify(viewport));
      }, 500);
    },
    [spaceId],
  );

  const backgroundPattern = useSpace(
    useShallow((state) => state?.space?.config?.backgroundPattern),
  );
  const [viewMode, setViewMode, updateConfig, updateSheet] = useSpace(
    useShallow((state) => [
      state.viewMode,
      state.setViewMode,
      state.updateConfig,
      state.updateSheet,
    ]),
  );
  const [hideSources, hideCategories, listExpenses, activeSheet, sheets] = useSpace(
    useShallow((state) => [
      state?.space?.config?.hideSources,
      state?.space?.config?.hideCategories,
      state?.space?.config?.listExpenses,
      state?.space?.config?.activeSheet || 'all',
      state?.space?.sheets,
    ]),
  );
  const { nodes, edges, onNodesChange, onEdgesChange } = useSpaceFlow();
  const [, setSearchParams] = useSearchParams();

  // Get current sheet's settings or fall back to global
  const activeSheetObj = activeSheet !== 'all' && sheets
    ? sheets.find((s) => s.id === activeSheet)
    : null;

  const currentHideSources = activeSheetObj?.hideSources ?? hideSources;
  const currentHideCategories = activeSheetObj?.hideCategories ?? hideCategories;
  const currentListExpenses = activeSheetObj?.listExpenses ?? listExpenses;

  // Auto-switch to table view on mobile devices
  useEffect(() => {
    if (window.innerWidth < 640) {
      setViewMode('table');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut handlers
  const handleToggleSources = useCallback(() => {
    const nowHidden = !currentHideSources;
    if (activeSheet === 'all') {
      updateConfig({ hideSources: nowHidden });
    } else {
      updateSheet(activeSheet, { hideSources: nowHidden });
    }
  }, [currentHideSources, activeSheet, updateConfig, updateSheet]);

  const handleToggleCategories = useCallback(() => {
    const nowHidden = !currentHideCategories;
    if (activeSheet === 'all') {
      updateConfig({ hideCategories: nowHidden });
      if (nowHidden) {
        updateConfig({ listExpenses: false });
      }
    } else {
      updateSheet(activeSheet, { hideCategories: nowHidden });
      if (nowHidden) {
        updateSheet(activeSheet, { listExpenses: false });
      }
    }
  }, [currentHideCategories, activeSheet, updateConfig, updateSheet]);

  const handleToggleListExpenses = useCallback(() => {
    if (currentHideCategories) return; // Can't toggle when categories are hidden
    const nowList = !currentListExpenses;
    if (activeSheet === 'all') {
      updateConfig({ listExpenses: nowList });
    } else {
      updateSheet(activeSheet, { listExpenses: nowList });
    }
  }, [currentListExpenses, currentHideCategories, activeSheet, updateConfig, updateSheet]);

  const handleToggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'flowchart' ? 'table' : 'flowchart');
  }, [viewMode, setViewMode]);

  const handleOpenCalculator = useCallback(() => {
    // This will be handled in BottomBar, just trigger the event
    const event = new CustomEvent('open-calculator');
    window.dispatchEvent(event);
  }, []);

  const handleOpenHelpTips = useCallback(() => {
    // This will be handled in HeaderMenu, just trigger the event
    const event = new CustomEvent('open-help-tips');
    window.dispatchEvent(event);
  }, []);

  const handleAddIncome = useCallback(() => {
    setSearchParams({ [URL_PARAM_FORM]: 'income' });
  }, [setSearchParams]);

  const handleAddExpense = useCallback(() => {
    setSearchParams({ [URL_PARAM_FORM]: 'expense' });
  }, [setSearchParams]);

  const handleNextSheet = useCallback(() => {
    if (!sheets || sheets.length === 0) return;
    const { setActiveSheet } = useSpace.getState();
    
    if (activeSheet === 'all') {
      setActiveSheet(sheets[0].id);
    } else {
      const currentIndex = sheets.findIndex((s) => s.id === activeSheet);
      const nextIndex = (currentIndex + 1) % sheets.length;
      if (nextIndex === 0) {
        setActiveSheet('all');
      } else {
        setActiveSheet(sheets[nextIndex].id);
      }
    }
  }, [sheets, activeSheet]);

  const handlePreviousSheet = useCallback(() => {
    if (!sheets || sheets.length === 0) return;
    const { setActiveSheet } = useSpace.getState();
    
    if (activeSheet === 'all') {
      setActiveSheet(sheets[sheets.length - 1].id);
    } else {
      const currentIndex = sheets.findIndex((s) => s.id === activeSheet);
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        setActiveSheet('all');
      } else {
        setActiveSheet(sheets[prevIndex].id);
      }
    }
  }, [sheets, activeSheet]);

  // Define keyboard shortcuts (non-view control shortcuts)
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      handler: handleToggleSources,
      description: 'Toggle sources visibility',
    },
    {
      key: 'c',
      ctrl: true,
      handler: handleToggleCategories,
      description: 'Toggle categories visibility',
    },
    {
      key: 'l',
      ctrl: true,
      handler: handleToggleListExpenses,
      description: 'Toggle list expenses',
    },
    {
      key: 'i',
      ctrl: true,
      handler: handleAddIncome,
      description: 'Add new income',
    },
    {
      key: 'e',
      ctrl: true,
      handler: handleAddExpense,
      description: 'Add new expense',
    },
    {
      key: 't',
      ctrl: true,
      handler: handleToggleViewMode,
      description: 'Toggle table/grid view',
    },
    {
      key: 'k',
      ctrl: true,
      handler: handleOpenCalculator,
      description: 'Open calculator',
    },
    {
      key: 's',
      ctrl: true,
      shift: true,
      handler: handleOpenHelpTips,
      description: 'Open help shortcuts',
    },
    {
      key: 'ArrowRight',
      ctrl: true,
      shift: true,
      handler: handleNextSheet,
      description: 'Next sheet',
    },
    {
      key: 'ArrowLeft',
      ctrl: true,
      shift: true,
      handler: handlePreviousSheet,
      description: 'Previous sheet',
    },
  ], true);

  return (
    <div id='app' className='relative h-dvh w-dvw bg-background-light dark:bg-background-dark'>
      {/* Hidden off-screen ReactFlow instances for dual-theme thumbnail capture */}
      <FlowHiddenCapture nodes={nodes} edges={edges} />

      {/* all viewport props: https://reactflow.dev/api-reference/react-flow#viewport-props */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={savedViewport === null}
        defaultViewport={savedViewport ?? { x: 0, y: 0, zoom: 1 }}
        fitViewOptions={{ padding: 2 }}
        onViewportChange={handleViewportChange}
        panOnScroll={true}
        selectionOnDrag={true}
        panOnScrollSpeed={1}
        maxZoom={1.5} // default is 2
        minZoom={0.15} // default is 0.5
      >
        {/* Keyboard shortcuts that require ReactFlow instance */}
        <FlowKeyboardShortcuts enabled={true} />
        <FlowCaptureThumbnail />

        <Header />
        <h1 className='font-brand bg-background-light/50 dark:bg-background-dark/50 text-brand absolute bottom-0 left-0 z-10 rounded-tr-xl p-2 text-xl font-black sm:p-3 sm:text-4xl'>
          Akyl
        </h1>

        <BottomBar />
        {viewMode === 'table' && <TableView />}
        <FlowControls />
        {backgroundPattern !== NO_BACKGROUND_VARIANT && (
          <Background
            color='#047857'
            gap={BackgroundVariantGaps[backgroundPattern ?? DEFAULT_BACKGROUND]}
            variant={backgroundPattern ?? DEFAULT_BACKGROUND}
            size={
              BackgroundVariantSizes[backgroundPattern ?? DEFAULT_BACKGROUND]
            }
            className={
              BackgroundVariantClasses[backgroundPattern ?? DEFAULT_BACKGROUND]
            }
          />
        )}
      </ReactFlow>
    </div>
  );
}
