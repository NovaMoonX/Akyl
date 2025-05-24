import '@xyflow/react/dist/base.css';
import './App.css';
import { FlowBoard } from './components';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <FlowBoard />
    </ThemeProvider>
  );
}
