import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { CustomNode, Header } from '../components';
import { useInitSpace } from '../hooks';
import { useSpace } from '../store';
import LoadScreen from './LoadScreen';
import ThemeToggle2 from './ui/ThemeToggle2';

const nodeTypes = {
  custom: CustomNode,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, __setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div id='app' className='relative h-screen w-screen'>
      {!showLoadScreen && (
        <h1 className='font-brand bg-background-light/50 dark:bg-background-dark/50 text-brand absolute bottom-0 left-0 z-50 rounded-tr-xl p-3 text-4xl font-black'>
          Akyl
        </h1>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView={true}
        fitViewOptions={{ padding: 1 }}
      >
        {showLoadScreen && <ThemeToggle2 />}
        {!showLoadScreen && <Header />}
        {!showLoadScreen && (
          <Controls position='bottom-right' fitViewOptions={{ padding: 1 }} />
        )}
        {showLoadScreen && <LoadScreen />}
        {backgroundPattern !== '' && (
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
