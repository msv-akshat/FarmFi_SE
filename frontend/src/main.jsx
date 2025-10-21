import './index.css';  // Keep this
// Remove or comment out the bootstrap line if you want to use Tailwind only
// import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);