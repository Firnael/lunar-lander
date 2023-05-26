import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import Home from './Components/Home/Home';
import Display from './Components/Display/Display';
import Monitoring from './Components/Monitoring/Monitoring';
import Training from './Components/Training/Training';
import './index.css'; // global css (body, etc.)

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Home/>} />
        <Route path="display" element={<Display/>} />
        <Route path="monitoring" element={<Monitoring/>} />
        <Route path="training" element={<Training/>} />       
      </Route>
    </Routes>
  </BrowserRouter>
);
