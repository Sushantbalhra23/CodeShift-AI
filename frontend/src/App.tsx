import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { TranslatePage } from './pages/TranslatePage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { BenchmarksPage } from './pages/BenchmarksPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/translate" element={<TranslatePage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/benchmarks" element={<BenchmarksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
