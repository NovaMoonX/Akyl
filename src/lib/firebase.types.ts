import type { EncryptionObject } from './crypt.types';

export interface EncryptionObjectWithMetadata extends EncryptionObject {
  metadata: {
    updatedAt: number;
    title: string;
  };
}
