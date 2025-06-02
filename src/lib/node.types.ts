export type BudgetType = 'income' | 'expense';
export type NodeType = 'core' | 'L1' | 'L2' | 'budget';
export type EdgeType = 'inflow' | 'outflow' | 'hidden';

export const CoreData = {};
export interface L1Data {
  label: string;
  amount: number;
  type: BudgetType;
  [key: string]: unknown;
}
export interface BudgetData {
  budgetItemId: string;
  hidden?: boolean; // For UI purposes, to hide/show budget items
  [key: string]: unknown;
}

export type NodeData = typeof CoreData | L1Data | BudgetData;

export interface Node {
  id: string;
  type: NodeType;
  data: NodeData;
  position: {
    x: number;
    y: number;
  };
  draggable: false;
}

export interface EdgeData {
  animationTreeLevel: number; // 0-index, from top to bottom
  [key: string]: unknown;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: EdgeType;
  data?: EdgeData;
}
