import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import EvaluatePage from './pages/EvaluatePage';
import ResultsPage from './pages/ResultsPage';
import ChatPage from './pages/ChatPage';
import PanelInsightsPage from './pages/PanelInsightsPage';
import PanelProfilePage from './pages/PanelProfilePage';
function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e1e28',
            color: '#f1f1f5',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/evaluate" element={<EvaluatePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/results/:evaluationId" element={<ResultsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/panels" element={<PanelInsightsPage />} />
        <Route path="/panels/:panelName" element={<PanelProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
