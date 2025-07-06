
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import CashFlow from "./pages/CashFlow";
import CashIn from "./pages/CashIn";
import CashOut from "./pages/CashOut";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";
import Accounts from "./pages/Accounts";
import Reports from "./pages/Reports";
import BukuKasUmum from "./pages/BukuKasUmum";
import LaporanRealisasiAnggaran from "./pages/LaporanRealisasiAnggaran";
import Anggaran from "./pages/Anggaran";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute requiredPath="/">
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/cash-flow" element={
              <ProtectedRoute requiredPath="/cash-flow">
                <CashFlow />
              </ProtectedRoute>
            } />
            <Route path="/cash-in" element={
              <ProtectedRoute requiredPath="/cash-in">
                <CashIn />
              </ProtectedRoute>
            } />
            <Route path="/cash-out" element={
              <ProtectedRoute requiredPath="/cash-out">
                <CashOut />
              </ProtectedRoute>
            } />
            <Route path="/journal" element={
              <ProtectedRoute requiredPath="/journal">
                <Journal />
              </ProtectedRoute>
            } />
            <Route path="/accounts" element={
              <ProtectedRoute requiredPath="/accounts">
                <Accounts />
              </ProtectedRoute>
            } />
            <Route path="/anggaran" element={
              <ProtectedRoute requiredPath="/anggaran">
                <Anggaran />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredPath="/reports">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/buku-kas-umum" element={
              <ProtectedRoute requiredPath="/buku-kas-umum">
                <BukuKasUmum />
              </ProtectedRoute>
            } />
            <Route path="/laporan-realisasi-anggaran" element={
              <ProtectedRoute requiredPath="/laporan-realisasi-anggaran">
                <LaporanRealisasiAnggaran />
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
