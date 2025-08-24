import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
import TiposMaterial from "./pages/TiposMaterial";
import TiposArte from "./pages/TiposArte";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b p-4 flex items-center">
            <SidebarTrigger  />
            <h1 className="ml-4 font-semibold">Sistema de Orçamentos</h1>
          </header>
          <div className="flex-1">
            {children}
          </div>
        </main>
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
            <Route path="/materiais" element={
              <ProtectedLayout>
                <Itens />
              </ProtectedLayout>
            } />
            <Route path="/clientes" element={
              <ProtectedLayout>
                <Clientes />
              </ProtectedLayout>
            } />
            <Route path="/tipos-material" element={
              <ProtectedLayout>
                <TiposMaterial />
              </ProtectedLayout>
            } />
            <Route path="/tipos-arte" element={
              <ProtectedLayout>
                <TiposArte />
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