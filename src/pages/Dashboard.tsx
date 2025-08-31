import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { DashboardMetrics, Orcamento, Produto, Item } from '@/types';
import { orcamentoStorage, produtoStorage, itemStorage } from '@/lib/storage';

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalFaturado: 0,
    aFaturar: 0,
    orcamentosEmAberto: 0,
    produtosMaisVendidos: [],
    itensEstoqueBaixo: [],
    vendaRecente: [],
    totalGastos: 0,
    lucroTotal: 0,
  });

  useEffect(() => {
    calculateMetrics();
  }, []);

  const calculateMetrics = () => {
    const orcamentos = orcamentoStorage.getAll();
    const produtos = produtoStorage.getAll();
    const itens = itemStorage.getAll();

    // Calcular métricas básicas
    const totalFaturado = orcamentos
      .filter(o => o.status === 'pago')
      .reduce((sum, o) => sum + o.valorTotal, 0);

    const aFaturar = orcamentos
      .filter(o => o.status === 'em_andamento')
      .reduce((sum, o) => sum + o.valorTotal, 0);

    const orcamentosEmAberto = orcamentos
      .filter(o => o.status === 'orcamento').length;

    // Produtos mais vendidos
    const produtoVendas = new Map<string, { quantidade: number; valor: number }>();
    
    orcamentos
      .filter(o => o.status === 'pago' || o.status === 'em_andamento')
      .forEach(o => {
        // Verificar se o orçamento tem a nova estrutura com itens
        if (o.itens && Array.isArray(o.itens)) {
          o.itens.forEach(item => {
            const current = produtoVendas.get(item.produtoId) || { quantidade: 0, valor: 0 };
            produtoVendas.set(item.produtoId, {
              quantidade: current.quantidade + item.quantidade,
              valor: current.valor + item.valorTotal,
            });
          });
        }
      });

    const produtosMaisVendidos = Array.from(produtoVendas.entries())
      .map(([produtoId, data]) => {
        const produto = produtos.find(p => p.id === produtoId);
        return produto ? {
          produto,
          quantidadeVendida: data.quantidade,
          totalFaturado: data.valor,
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.quantidadeVendida - a!.quantidadeVendida)
      .slice(0, 5) as DashboardMetrics['produtosMaisVendidos'];

    // Itens com estoque baixo
    const itensEstoqueBaixo = itens
      .filter(item => item.estoque <= item.estoqueMinimo && item.estoqueMinimo > 0)
      .map(item => ({
        item,
        percentualEstoque: item.estoqueMinimo > 0 
          ? (item.estoque / item.estoqueMinimo) * 100 
          : 0,
      }))
      .sort((a, b) => a.percentualEstoque - b.percentualEstoque);

    // Vendas recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const vendaRecente = orcamentos
      .filter(o => 
        (o.status === 'pago' || o.status === 'em_andamento') &&
        new Date(o.createdAt) > thirtyDaysAgo
      )
      .map(o => ({
        data: o.createdAt.split('T')[0],
        valor: o.valorTotal,
      }))
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    // Calcular gastos com itens
    let totalGastos = 0;
    orcamentos
      .filter(o => o.status === 'pago' || o.status === 'em_andamento')
      .forEach(o => {
        // Verificar se o orçamento tem a nova estrutura com itens
        if (o.itens && Array.isArray(o.itens)) {
          o.itens.forEach(orcamentoItem => {
            const produto = produtos.find(p => p.id === orcamentoItem.produtoId);
            if (produto) {
              produto.itensComposicao.forEach(composicao => {
                const item = itens.find(i => i.id === composicao.itemId);
                if (item) {
                  totalGastos += (item.custo || 0) * composicao.quantidade * orcamentoItem.quantidade;
                }
              });
            }
          });
        }
      });

    const lucroTotal = totalFaturado - totalGastos;

    setMetrics({
      totalFaturado,
      aFaturar,
      orcamentosEmAberto,
      produtosMaisVendidos,
      itensEstoqueBaixo,
      vendaRecente,
      totalGastos,
      lucroTotal,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-success text-success-foreground';
      case 'em_andamento': return 'bg-warning text-warning-foreground';
      case 'orcamento': return 'bg-secondary text-secondary-foreground';
      case 'cancelado': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={calculateMetrics} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(metrics.totalFaturado)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Faturar</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(metrics.aFaturar)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(metrics.totalGastos)}
            </div>
            <p className="text-xs text-muted-foreground">
              Custos com materiais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.lucroTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Faturado - Gastos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.orcamentosEmAberto}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando decisão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.itensEstoqueBaixo.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens abaixo do mínimo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.produtosMaisVendidos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma venda registrada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {metrics.produtosMaisVendidos.map((item, index) => (
                  <div key={item.produto.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.produto.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantidadeVendida} vendidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-success">
                        {formatCurrency(item.totalFaturado)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.itensEstoqueBaixo.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Todos os estoques estão adequados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.itensEstoqueBaixo.slice(0, 5).map((alert) => (
                  <div key={alert.item.id} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div>
                      <p className="font-medium">{alert.item.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {alert.item.estoque} {alert.item.unidade}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mínimo: {alert.item.estoqueMinimo} {alert.item.unidade}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {alert.percentualEstoque.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;