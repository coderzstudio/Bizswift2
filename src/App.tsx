
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Dashboard from "@/components/Dashboard";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import PartiesPage from "@/pages/PartiesPage";
import ProductsPage from "@/pages/ProductsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import PurchaseInvoicesPage from "@/pages/PurchaseInvoicesPage";
import InvoiceFormPage from "@/pages/InvoiceFormPage";
import InvoiceViewPage from "@/pages/InvoiceViewPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import TransactionsPage from "@/pages/TransactionsPage";
import PaymentPage from "@/pages/PaymentPage";
import ReceiptPage from "@/pages/ReceiptPage";
import InventoryPage from "@/pages/InventoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />}>
              <Route index element={<Index />} />
              <Route path="parties" element={<PartiesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="purchase-invoices" element={<PurchaseInvoicesPage />} />
              <Route path="invoices/new" element={<InvoiceFormPage />} />
              <Route path="invoices/edit/:invoiceId" element={<InvoiceFormPage />} />
              <Route path="invoices/:invoiceId" element={<InvoiceViewPage />} />
              <Route path="transactions" element={<TransactionsPage />}>
                <Route index element={<PaymentPage />} />
                <Route path="payment" element={<PaymentPage />} />
                <Route path="receipt" element={<ReceiptPage />} />
              </Route>
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
