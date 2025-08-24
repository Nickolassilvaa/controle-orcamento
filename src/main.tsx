import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { seedInitialData } from './lib/seedData'

// Carregar dados iniciais para demonstração
//seedInitialData();

createRoot(document.getElementById("root")!).render(<App />);