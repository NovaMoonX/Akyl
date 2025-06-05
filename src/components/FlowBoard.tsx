import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { useShallow } from 'zustand/shallow';
import { Header } from '../components';
import { useInitSpace, useSpaceFlow } from '../hooks';
import { NO_BACKGROUND_VARIANT } from '../lib';
import { useSpace } from '../store';
import BottomActions from './BottomActions';
import { AnimatedInflowEdge, AnimatedOutflowEdge } from './edges';
import { HiddenNodeEdge } from './edges/HiddenNodeEdge';
import LoadScreen from './LoadScreen';
import BudgetNode from './nodes/BudgetNode';
import CoreNode from './nodes/CoreNode';
import L1Node from './nodes/L1Node';

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

export default function Flow() {
  const { showLoadScreen } = useInitSpace();
  const backgroundPattern = useSpace(
    useShallow((state) => state?.space?.config?.backgroundPattern),
  );
  const { nodes, edges, onNodesChange, onEdgesChange } = useSpaceFlow();

  return (
    <div id='app' className='relative h-screen w-screen'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={true}
      >
        {showLoadScreen && <LoadScreen />}
        {!showLoadScreen && (
          <>
            <Header />
            <h1 className='font-brand bg-background-light/50 dark:bg-background-dark/50 text-brand absolute bottom-0 left-0 z-50 rounded-tr-xl p-3 text-4xl font-black'>
              Akyl
            </h1>

            <BottomActions />
            <Controls position='bottom-right' showInteractive={false} />
          </>
        )}
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
