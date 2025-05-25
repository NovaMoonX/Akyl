import type { BackgroundVariant } from '@xyflow/react';
import type { Expense, Income } from './budget.types';
import {
  CashFlowVerbiagePairs,
  NO_BACKGROUND_VARIANT,
} from './space.constants';

export interface SpaceMetadata {
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  fileName: string;
  fileVersion: string; // version of schema used for file
  appVersion: string; // version of app used for file
  language: string; // e.g. 'en-US', 'fr-FR'
}

export type Theme = 'light' | 'dark';
export type Currency = 'USD' | 'EUR';
export type CashFlowVerbiage = keyof typeof CashFlowVerbiagePairs;

export interface Config {
  theme: Theme;
  backgroundPattern:
    | BackgroundVariant.Cross
    | BackgroundVariant.Dots
    | BackgroundVariant.Lines
    | typeof NO_BACKGROUND_VARIANT;
  accentColor: string;
  currency: Currency;
  cashFlowVerbiage: CashFlowVerbiage;
}

export interface Space {
  id: string;
  title: string;
  description: string;
  metadata: SpaceMetadata;
  config: Config;
  incomes: Income[];
  expenses: Expense[];
}
