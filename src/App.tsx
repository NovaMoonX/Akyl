import '@xyflow/react/dist/base.css';
import './App.css';
import { FlowBoard } from './components';
import { useInitSpace, usePersistCloud, usePersistLocally } from './hooks';
import { decryptData, encryptData, generateEncryptionKey } from './lib';
import { useEffect } from 'react';

const test = async () => {
  const key = await generateEncryptionKey();
  console.log('key', key); // REMOVE
  const original = { message: 'Hello, world!', timestamp: Date.now() };

  const { iv, encryptedData } = await encryptData(original, key);
  const decrypted = await decryptData(encryptedData, key, iv);

  console.log('Original:', original);
  console.log('Encrypted', encryptedData); // REMOVE
  console.log('Decrypted:', decrypted);
};

export default function App() {
  useInitSpace();
  usePersistLocally();
  usePersistCloud();

  useEffect(() => {
    test();
  }, []);

  return <FlowBoard />;
}
