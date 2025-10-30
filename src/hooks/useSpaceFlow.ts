import { useEdgesState, useNodesState } from '@xyflow/react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  generateExpenseNodesAndEdges,
  generateIncomeNodesAndEdges,
  NODE_CORE_ID,
  type Edge,
  type Node,
} from '../lib';
import { useSpace } from '../store';
import useBudget from './useBudget';
import useInitSpace from './useInitSpace';

const coreNode: Node = {
  id: NODE_CORE_ID,
  type: 'core',
  position: { x: 0, y: 0 },
  data: {},
  draggable: false,
};

export default function useSpaceFlow() {
  const { showLoadScreen } = useInitSpace();
  const [, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const {
    incomeBySource,
    expenseByCategory,
    incomesSourceHiddenMap,
    expensesCategoryHiddenMap,
  } = useBudget();
  const [hideSources, hideCategories, listExpenses, activeSheet, sheets] = useSpace(
    useShallow((state) => [
      state?.space?.config?.hideSources,
      state?.space?.config?.hideCategories,
      state?.space?.config?.listExpenses,
      state?.space?.config?.activeSheet || 'all',
      state?.space?.sheets || [],
    ]),
  );

  // Get current sheet's display options or fall back to global
  const activeSheetObj = activeSheet !== 'all' 
    ? sheets.find((s) => s.id === activeSheet)
    : null;

  const currentHideSources = activeSheetObj?.hideSources ?? hideSources;
  const currentHideCategories = activeSheetObj?.hideCategories ?? hideCategories;
  const currentListExpenses = activeSheetObj?.listExpenses ?? listExpenses;

  const coreNodes = useMemo(() => {
    if (showLoadScreen) {
      return [];
    }
    return [coreNode];
  }, [showLoadScreen]);

  const { incomeNodes, incomeEdges } = useMemo(() => {
    if (showLoadScreen) {
      return {
        incomeNodes: [],
        incomeEdges: [],
      };
    }
    return generateIncomeNodesAndEdges(
      incomeBySource,
      incomesSourceHiddenMap,
      currentHideSources,
    );
  }, [incomeBySource, incomesSourceHiddenMap, showLoadScreen, currentHideSources]);

  const { expenseNodes, expenseEdges } = useMemo(() => {
    if (showLoadScreen) {
      return {
        expenseNodes: [],
        expenseEdges: [],
      };
    }
    return generateExpenseNodesAndEdges(
      expenseByCategory,
      expensesCategoryHiddenMap,
      currentHideCategories,
      currentHideSources,
      currentListExpenses,
    );
  }, [
    expenseByCategory,
    expensesCategoryHiddenMap,
    showLoadScreen,
    currentHideCategories,
    currentHideSources,
    currentListExpenses,
  ]);

  return {
    nodes: [...coreNodes, ...incomeNodes, ...expenseNodes],
    edges: [...incomeEdges, ...expenseEdges],
    onNodesChange,
    onEdgesChange,
    setEdges,
    setNodes,
  };
}
