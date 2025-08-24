import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Página não encontrada</p>
          <p className="text-sm text-muted-foreground mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Button asChild className="w-full">
            <a href="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;