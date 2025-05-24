import {
  FILE_EXTENSION,
  FILE_HEADER_FIRST_LINE,
  FILE_HEADER_SECOND_LINE,
  FILE_HEADER_THIRD_LINE,
  FILE_TYPE,
} from './file.constants';
import type { Space } from './space.types';

export function exportFile(fileName: string, space: Space) {
  const jsonData = JSON.stringify(space, null, 2);
  const fileContent = [
    FILE_HEADER_FIRST_LINE,
    FILE_HEADER_SECOND_LINE,
    FILE_HEADER_THIRD_LINE,
    jsonData,
  ].join('\n');

  const file = new Blob([fileContent], { type: FILE_TYPE });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.trim()}${FILE_EXTENSION}`;
  a.click();
  URL.revokeObjectURL(url);
}
