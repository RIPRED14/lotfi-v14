import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import SampleEntryPage from './pages/SampleEntryPage';
import QualityControlPage from './pages/QualityControlPage';

import AnalysisInProgressPage from './pages/AnalysisInProgressPage';
import SampleManagementPage from './pages/SampleManagementPage';
import ReadingResultsPage from './pages/ReadingResultsPage';
import SupabaseTestPage from './pages/SupabaseTestPage';
import NotFound from './pages/NotFound';
import PendingReadingsPage from "./pages/PendingReadingsPage";
import LecturesEnAttentePage from "./pages/LecturesEnAttentePage";
import AdminPage from "./pages/AdminPage";
import BacteriaSettingsPage from "./pages/BacteriaSettingsPage";
import BacteriaExamplePage from "./pages/BacteriaExamplePage";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import QualityControlDashboardPage from "./pages/QualityControlDashboardPage";
import TechnicalInfoPage from "./pages/TechnicalInfoPage";
import FormsHistoryPage from "./pages/FormsHistoryPage";
import DbDiagnosticPage from "./pages/DbDiagnosticPage";
import TestRedirectionPage from "./pages/TestRedirectionPage";
import HistoryPage from "./pages/HistoryPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/sample-entry" element={<SampleEntryPage />} />
              <Route path="/quality-control" element={<QualityControlPage />} />
              <Route path="/quality-control-dashboard" element={<QualityControlDashboardPage />} />
              <Route path="/technical-info" element={<TechnicalInfoPage />} />
              <Route path="/forms-history" element={<FormsHistoryPage />} />

              <Route path="/analyses-en-cours" element={<AnalysisInProgressPage />} />
              <Route path="/gestion-echantillons" element={<SampleManagementPage />} />
              <Route path="/saisie-resultats" element={<ReadingResultsPage />} />
              <Route path="/bacteria-settings" element={<BacteriaSettingsPage />} />
              <Route path="/bacteria-demo" element={<BacteriaExamplePage />} />
              <Route path="/test-supabase" element={<SupabaseTestPage />} />
              <Route path="/db-diagnostic" element={<DbDiagnosticPage />} />
              <Route path="/test-redirection" element={<TestRedirectionPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/pending-readings" element={<PendingReadingsPage />} />
              <Route path="/lectures-en-attente" element={<LecturesEnAttentePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
