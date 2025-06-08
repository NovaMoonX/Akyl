import '@xyflow/react/dist/base.css';
import './App.css';
import { FlowBoard } from './components';
import { useInitSpace, usePersistCloud, usePersistLocally } from './hooks';
import useSyncAllSpaces from './hooks/useSyncAllSpaces';

export default function App() {
  useInitSpace();
  usePersistLocally();
  usePersistCloud();
  useSyncAllSpaces()

  return <FlowBoard />;
}
