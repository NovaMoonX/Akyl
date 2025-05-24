import '@xyflow/react/dist/base.css';
import './App.css';
import { FlowBoard } from './components';
import { useInitSpace } from './hooks';
import usePersistLocally from './hooks/usePersistLocally';

export default function App() {
  useInitSpace();
  usePersistLocally();

  return <FlowBoard />;
}
