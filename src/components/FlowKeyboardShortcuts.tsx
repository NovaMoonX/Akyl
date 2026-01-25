import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useKeyboardShortcuts } from '../hooks';
import { useSpace } from '../store';

interface FlowKeyboardShortcutsProps {
  enabled: boolean;
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
      reactFlowInstance.fitView({ padding: 2, duration: 300 });
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
      key: '-',
      ctrl: true,
      handler: handleZoomOut,
      description: 'Zoom out',
    },
  ], enabled);

  // This component doesn't render anything
  return null;
}
