import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Index from './containers';
import Chat from './containers/Chat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Index />} />
        <Route path='/chat' element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
