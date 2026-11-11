import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Administration from './pages/Administration';
import AskAtlasPage from './pages/AskAtlasPage';
import DeveloperHub from './pages/DeveloperHub';
import HowAtlasWorks from './pages/HowAtlasWorks';
import { EngineProvider } from './engine/store';
import ExecutiveHub from './pages/ExecutiveHub';
import InvestorHub from './pages/InvestorHub';
import ManagerHub from './pages/ManagerHub';
import Reports from './pages/Reports';
import TreasuryHub from './pages/TreasuryHub';

function App() {
  return (
    <BrowserRouter>
      <EngineProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/executive" replace />} />
          <Route path="executive" element={<ExecutiveHub />} />
          <Route path="investor" element={<InvestorHub />} />
          <Route path="developer" element={<DeveloperHub />} />
          <Route path="manager" element={<ManagerHub />} />
          <Route path="treasury" element={<TreasuryHub />} />
          <Route path="ask-atlas" element={<AskAtlasPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="administration" element={<Administration />} />
          <Route path="how-it-works" element={<HowAtlasWorks />} />
          <Route path="*" element={<Navigate to="/executive" replace />} />
        </Route>
      </Routes>
      </EngineProvider>
    </BrowserRouter>
  );
}

export default App;