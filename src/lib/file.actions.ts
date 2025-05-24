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

export async function importFile(): Promise<Space> {
  const handleImport: (file: File) => Promise<Space | null> = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split('\n');
        if (
          lines[0] !== FILE_HEADER_FIRST_LINE ||
          lines[1] !== FILE_HEADER_SECOND_LINE ||
          lines[2] !== FILE_HEADER_THIRD_LINE
        ) {
          reject(new Error('Invalid file format'));
          return;
        }
        const jsonData = lines.slice(3)?.join('\n') || '';
        try {
          const space = JSON.parse(jsonData);
          resolve(space);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };

  const file = await pickFile();
  if (!file) {
    throw new Error('No file selected');
  }
  const fileContent = await handleImport(file);
  if (typeof fileContent === 'object' && fileContent !== null) {
    const fileSpace = fileContent as Space;
    if (fileSpace?.id) {
      localStorage.setItem(fileSpace.id, JSON.stringify(fileSpace));
      setTimeout(() => {
        window.location.href = `/${fileSpace.id}`;
      }, 100);
    }
    throw new Error('Invalid file content - no ID');
  }
  throw new Error('Invalid file content - no object');
}

export function pickFile(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = FILE_EXTENSION;

    input.onchange = () => {
      if (input.files && input.files[0]) {
        resolve(input.files[0]);
      } else {
        reject(new Error('No file selected'));
      }
      document.body.removeChild(input);
    };

    input.onerror = (e) => {
      reject(e);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  });
}
