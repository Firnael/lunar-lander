import ReactDOM from 'react-dom/client';
import App from './Components/App/App';
import './index.css'; // global css (body, etc.)

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
