import '@xyflow/react/dist/base.css';
import './App.css';
import { FlowBoard } from './components';
import { useInitSpace, usePersistCloud, usePersistLocally } from './hooks';


export default function App() {
  useInitSpace();
  usePersistLocally();
  usePersistCloud();

  return <FlowBoard />;
}
