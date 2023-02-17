import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Game from './Components/Game/Game'
import './index.css' // global css (body, etc.)

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Game/>} />
    </Routes>
  </BrowserRouter>
);
