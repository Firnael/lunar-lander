import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Display from '../Display/Display';
import Monitoring from '../Monitoring/Monitoring';
import Training from '../Training/Training';
import Home from '../Home/Home';
import HowToPlay from '../HowToPlay/HowToPlay';
import ConfigProvider from '../../Contexts/ConfigContext';

export default function App() {
    return (
        <ConfigProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="display" element={<Display />} />
                        <Route path="monitoring" element={<Monitoring />} />
                        <Route path="training" element={<Training />} />
                        <Route path="how-to-play" element={<HowToPlay />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
}