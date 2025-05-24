import '@xyflow/react/dist/base.css';
import './App.css';
import { FlowBoard } from './components';
import { ThemeProvider } from './contexts/ThemeContext';
import { useInitSpace } from './hooks';

export default function App() {
  useInitSpace();
  // TASK: persist spaces locally

  return (
    <ThemeProvider>
      <FlowBoard />
    </ThemeProvider>
  );
}
