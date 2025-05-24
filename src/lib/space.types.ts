import type { BackgroundVariant } from '@xyflow/react';
import type { Expense, Income } from './budget.types';

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

export interface Config {
  theme: Theme;
  backgroundPattern:
    | BackgroundVariant.Cross
    | BackgroundVariant.Dots
    | BackgroundVariant.Lines
    | '';
  accentColor: string;
  currency: Currency;
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
