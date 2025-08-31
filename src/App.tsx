import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppSidebar } from "./components/AppSidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orcamentos from "./pages/Orcamentos";
import Produtos from "./pages/Produtos";
import Itens from "./pages/Itens";
import Clientes from "./pages/Clientes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return // talvez aplicar um skeletom aqui de um card carregando

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="border-b p-4 flex items-center">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold">Sistema de Orçamentos</h1>
          </header>
          <div className="flex-1">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } />
            <Route path="/orcamentos" element={
              <ProtectedLayout>
                <Orcamentos />
              </ProtectedLayout>
            } />
            <Route path="/produtos" element={
              <ProtectedLayout>
                <Produtos />
              </ProtectedLayout>
            } />
            <Route path="/itens" element={
              <ProtectedLayout>
                <Itens />
              </ProtectedLayout>
            } />
            <Route path="/clientes" element={
              <ProtectedLayout>
                <Clientes />
              </ProtectedLayout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;