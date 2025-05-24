import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

type ItemType = 'space' | 'node' | 'budget';
export default function generateId(type: ItemType) {
  let uuid = '';

  switch (type) {
    case 'space':
      uuid = 'sp' + nanoid(16);
      break;
    case 'node':
      uuid = uuidv4();
      break;
    case 'budget':
      uuid = 'db-' + nanoid();
      break;
  }

  return uuid;
}
