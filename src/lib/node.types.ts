export type NodeType = 'L1' | 'L2' | 'L3' | 'income' | 'expense'; // L1, L2, L3 are for levels of nodes in the flowchart (parent nodes), income and expense are for budget items (leaf nodes)

export const L1Data = {};

export interface BudgetData {
  budgetItemId: string;
  [key: string]: unknown;
}

export type NodeData = typeof L1Data | BudgetData;

export interface Node {
  id: string;
  type: NodeType;
  data: NodeData;
  position: {
    x: number;
    y: number;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}
