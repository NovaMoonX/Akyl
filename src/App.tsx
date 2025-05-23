import {
  addEdge,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { useCallback } from 'react';
import './App.css';
import CustomNode from './components/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const initNodes = [
  {
    id: '1',
    type: 'custom',
    data: { name: 'Jane Doe', job: 'CEO', emoji: '😎' },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'custom',
    data: { name: 'Tyler Weary', job: 'Designer', emoji: '🤓' },

    position: { x: -200, y: 200 },
  },
  {
    id: '3',
    type: 'custom',
    data: { name: 'Kristi Price', job: 'Developer', emoji: '🤩' },
    position: { x: 200, y: 200 },
  },
];

const initEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
];

const Flow = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, __setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className='w-screen h-screen'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls position='bottom-right'/>
      </ReactFlow>
    </div>
  );
};

export default Flow;
