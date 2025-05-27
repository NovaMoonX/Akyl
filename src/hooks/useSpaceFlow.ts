import { useEdgesState, useNodesState } from '@xyflow/react';
import { useEffect } from 'react';
import { NODE_CORE_ID, type Edge, type Node } from '../lib';
import useInitSpace from './useInitSpace';

const initNodes: Node[] = [
  {
    id: NODE_CORE_ID,
    type: 'core',
    position: { x: 0, y: 0 },
    data: {},
    draggable: false,
  },
];

const demoNodes: Node[] = [
  {
    id: 'income-bucket-1',
    type: 'L1',
    position: { x: -100, y: -200 },
    data: { label: 'HubSpot', amount: 4000, type: 'income' },
    draggable: false,
  },
  {
    id: 'income-bucket-2',
    type: 'L1',
    position: { x: 100, y: -200 },
    data: { label: 'Side Gig (Photography)', amount: 450.5, type: 'income' },
    draggable: false,
  },
  {
    id: 'income-item-1',
    type: 'budget',
    position: { x: -150, y: -400 },
    data: { budgetItemId: 'income-item-1' },
    draggable: false,
  },
  {
    id: 'income-item-2',
    type: 'budget',
    position: { x: 150, y: -400 },
    data: { budgetItemId: 'income-item-2' },
    draggable: false,
  },
  {
    id: 'expense-bucket-1',
    type: 'L1',
    position: { x: -100, y: 300 },
    data: { label: 'Housing', amount: 1000, type: 'expense' },
    draggable: false,
  },
  {
    id: 'expense-bucket-2',
    type: 'L1',
    position: { x: 100, y: 300 },
    data: { label: 'Groceries', amount: 100, type: 'expense' },
    draggable: false,
  },
  {
    id: 'expense-item-1',
    type: 'budget',
    position: { x: -100, y: 500 },
    data: { budgetItemId: 'expense-item-1' },
    draggable: false,
  },
  {
    id: 'expense-item-2',
    type: 'budget',
    position: { x: 100, y: 500 },
    data: { budgetItemId: 'expense-item-2' },
    draggable: false,
  },
];

const demoEdges: Edge[] = [
  {
    id: 'income-bucket-1-to-core',
    source: 'income-bucket-1',
    target: NODE_CORE_ID,
    type: 'inflow',
  },
  {
    id: 'income-bucket-2-to-core',
    source: 'income-bucket-2',
    target: NODE_CORE_ID,
    type: 'inflow',
  },
  {
    id: 'core-to-expense-bucket-1',
    source: NODE_CORE_ID,
    target: 'expense-bucket-1',
    type: 'outflow',
  },
  {
    id: 'core-to-expense-bucket-2',
    source: NODE_CORE_ID,
    target: 'expense-bucket-2',
    type: 'outflow',
  },
  {
    id: 'income-bucket-1-to-income-item-1',
    source: 'income-item-1',
    target: 'income-bucket-1',
    type: 'inflow',
  },
  {
    id: 'income-bucket-2-to-income-item-2',
    source: 'income-item-2',
    target: 'income-bucket-2',
    type: 'inflow',
  },
  {
    id: 'expense-bucket-1-to-expense-item-1',
    source: 'expense-bucket-1',
    target: 'expense-item-1',
    type: 'outflow',
  },
  {
    id: 'expense-bucket-2-to-expense-item-2',
    source: 'expense-bucket-2',
    target: 'expense-item-2',
    type: 'outflow',
  },
];

export default function useSpaceFlow() {
  const { showLoadScreen } = useInitSpace();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    // TASK: fetch nodes from space (when loading from local storage as well)
    if (showLoadScreen) {
      setNodes([...initNodes, ...demoNodes]);
      setEdges(demoEdges);
    }
  }, [showLoadScreen, setNodes, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setNodes,
  };
}
