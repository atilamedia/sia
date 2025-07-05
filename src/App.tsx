
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cash-flow" element={<CashFlow />} />
          <Route path="/cash-in" element={<CashIn />} />
          <Route path="/cash-out" element={<CashOut />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/anggaran" element={<Anggaran />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/buku-kas-umum" element={<BukuKasUmum />} />
          <Route path="/laporan-realisasi-anggaran" element={<LaporanRealisasiAnggaran />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
