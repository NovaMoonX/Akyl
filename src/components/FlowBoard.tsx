import {
  addEdge,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { useCallback } from 'react';
import { CustomNode, Header } from '../components';
import { useInitSpace } from '../hooks';
import LoadScreen from './LoadScreen';

const nodeTypes = {
  custom: CustomNode,
};

export default function Flow() {
  const { showLoadScreen } = useInitSpace();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, __setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div id='app' className='relative h-screen w-screen'>
      <h1 className='font-brand bg-background-light/50 dark:bg-background-dark/50 absolute bottom-0 left-0 z-50 rounded-tr-xl p-3 text-4xl font-black text-emerald-700'>
        Akyl
      </h1>
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
        {!showLoadScreen && <Header />}
        {!showLoadScreen && (
          <Controls position='bottom-right' fitViewOptions={{ padding: 1 }} />
        )}
        {showLoadScreen && <LoadScreen />}
      </ReactFlow>
    </div>
  );
}
