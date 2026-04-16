import './App.css';
import { Route, Routes, useParams } from 'react-router';
import { FlowBoard } from './components';
import LoadScreen from './components/LoadScreen';

function FlowBoardWithKey() {
  const { spaceId } = useParams<{ spaceId: string }>();
  return <FlowBoard key={spaceId} />;
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<LoadScreen />} />
      <Route path='/:spaceId' element={<FlowBoardWithKey />} />
    </Routes>
  );
}
