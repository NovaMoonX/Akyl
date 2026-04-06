import './App.css';
import { Route, Routes } from 'react-router';
import { FlowBoard } from './components';
import LoadScreen from './components/LoadScreen';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<LoadScreen />} />
      <Route path='/:spaceId' element={<FlowBoard />} />
    </Routes>
  );
}
