import { generateId, getTheme, getUserLocale } from '../utils';
import {
  CURRENT_APP_VERSION,
  CURRENT_FILE_VERSION,
  SpaceAccentColors,
} from './space.constants';
import type { Space } from './space.types';

export function createNewSpace() {
  const timestamp = Date.now();
  const theme = getTheme();

  const space: Space = {
    id: generateId('space'),
    title: '',
    description: '',
    metadata: {
      createdBy: '',
      createdAt: timestamp,
      updatedAt: timestamp,
      fileName: '',
      fileVersion: CURRENT_FILE_VERSION,
      appVersion: CURRENT_APP_VERSION,
      language: getUserLocale(),
    },
    incomes: [],
    expenses: [],
    config: {
      theme,
      backgroundPattern: '',
      accentColor: SpaceAccentColors.default,
      currency: 'USD',
      cashFlowVerbiage: 'default',
    },
  };

  console.log('space', space); // REMOVE
  window.location.href = `/${space.id}`; // TODO: remove this line
}
