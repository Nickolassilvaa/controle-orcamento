import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText, Printer, Eye, X, Check, DollarSign, Calendar, User } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Orcamento, OrcamentoItem, StatusOrcamento, Cliente, Produto } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { 
  orcamentoStorage, 
  clienteStorage, 
  produtoStorage, 
  itemStorage 
} from '@/lib/storage';

// Sistema de orçamentos limpo
const statusOptions: { value: StatusOrcamento; label: string; color: string }[] = [
  { value: 'orcamento', label: 'Orçamento', color: 'outline' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'warning' },
  { value: 'pago', label: 'Pago', color: 'success' },
  { value: 'cancelado', label: 'Cancelado', color: 'destructive' },
];

const Orcamentos = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printOrcamento, setPrintOrcamento] = useState<Orcamento | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orcamentoToCancel, setOrcamentoToCancel] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [orcamentoToApprove, setOrcamentoToApprove] = useState<Orcamento | null>(null);
  const [approvalItems, setApprovalItems] = useState<OrcamentoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusOrcamento | 'all'>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    clienteId: '',
    observacoes: '',
    prazoValidade: '',
  });

  const [currentItem, setCurrentItem] = useState({
    produtoId: '',
    quantidade: '1',
  });

  const [itensOrcamento, setItensOrcamento] = useState<OrcamentoItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrcamentos(orcamentoStorage.getAll());
    setClientes(clienteStorage.getAll());
    setProdutos(produtoStorage.getAll());
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      observacoes: '',
      prazoValidade: '',
    });
    setCurrentItem({
      produtoId: '',
      quantidade: '1',
    });
    setItensOrcamento([]);
    setEditingOrcamento(null);
  };

  const getValorUnitario = () => {
    const produto = produtos.find(p => p.id === currentItem.produtoId);
    return produto?.valor || 0;
  };

  const getValorTotal = () => {
    return getValorUnitario() * parseInt(currentItem.quantidade || '1');
  };

  const addItem = () => {
    if (!currentItem.produtoId) {
      toast({
        title: "Erro",
        description: "Produto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const valorUnitario = getValorUnitario();
    const quantidade = parseInt(currentItem.quantidade);
    
    const newItem: OrcamentoItem = {
      id: crypto.randomUUID(),
      produtoId: currentItem.produtoId,
      quantidade,
      valorUnitario,
      valorTotal: valorUnitario * quantidade,
    };

    setItensOrcamento([...itensOrcamento, newItem]);
    setCurrentItem({
      produtoId: '',
      quantidade: '1',
    });
  };

  const removeItem = (itemId: string) => {
    setItensOrcamento(itensOrcamento.filter(item => item.id !== itemId));
  };

  const getTotalOrcamento = () => {
    return itensOrcamento.reduce((total, item) => total + item.valorTotal, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || itensOrcamento.length === 0 || !formData.prazoValidade) {
      toast({
        title: "Erro",
        description: "Cliente, prazo de validade e pelo menos um item são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    const orcamento: Orcamento = {
      id: editingOrcamento?.id || crypto.randomUUID(),
      clienteId: formData.clienteId,
      itens: itensOrcamento,
      valorTotal: getTotalOrcamento(),
      status: editingOrcamento?.status || 'orcamento',
      observacoes: formData.observacoes,
      prazoValidade: formData.prazoValidade,
      createdAt: editingOrcamento?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orcamentoStorage.save(orcamento);
    loadData();
    setShowDialog(false);
    resetForm();

    toast({
      title: editingOrcamento ? "Orçamento atualizado!" : "Orçamento criado!",
      description: `Orçamento foi ${editingOrcamento ? 'atualizado' : 'gerado'} com sucesso.`,
    });
  };

  const handleEdit = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setFormData({
      clienteId: orcamento.clienteId,
      observacoes: orcamento.observacoes || '',
      prazoValidade: orcamento.prazoValidade,
    });
    // Verificar se o orçamento tem itens válidos
    setItensOrcamento(orcamento.itens && Array.isArray(orcamento.itens) ? orcamento.itens : []);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    const orcamento = orcamentos.find(o => o.id === id);
    
    // Verificar se o orçamento é pago - não pode ser excluído
    if (orcamento?.status === 'pago') {
      toast({
        title: "Não é possível excluir",
        description: "Orçamentos pagos não podem ser excluídos.",
        variant: "destructive",
      });
      return;
    }
    
    setOrcamentoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (orcamentoToDelete) {
      const orcamento = orcamentos.find(o => o.id === orcamentoToDelete);
      
      // Se o orçamento está aprovado/em andamento, reverter o estoque
      if (orcamento && orcamento.status === 'em_andamento') {
        // Reverter estoque dos itens aprovados
        if (orcamento.itens && Array.isArray(orcamento.itens)) {
          orcamento.itens.forEach(itemOrcamento => {
            const produto = produtos.find(p => p.id === itemOrcamento.produtoId);
            if (produto && produto.itensComposicao && Array.isArray(produto.itensComposicao) && produto.itensComposicao.length > 0) {
              produto.itensComposicao.forEach(composicao => {
                const item = itemStorage.getById(composicao.itemId);
                if (item) {
                  const quantidadeReverter = itemOrcamento.quantidade * composicao.quantidade;
                  itemStorage.updateEstoque(item.id, item.estoque + quantidadeReverter);
                }
              });
            }
          });
        }
        
        toast({
          title: "Estoque revertido!",
          description: "Os itens foram devolvidos ao estoque.",
        });
      }
      
      orcamentoStorage.delete(orcamentoToDelete);
      loadData();
      toast({
        title: "Orçamento excluído!",
        description: "O orçamento foi removido com sucesso.",
      });
      setOrcamentoToDelete(null);
    }
  };

  const handleApproval = (orcamento: Orcamento) => {
    // Verificar se o orçamento tem itens
    if (!orcamento.itens || orcamento.itens.length === 0) {
      toast({
        title: "Erro",
        description: "Este orçamento não possui itens válidos para aprovação",
        variant: "destructive",
      });
      return;
    }
    
    setOrcamentoToApprove(orcamento);
    setApprovalItems(orcamento.itens.map(item => ({ ...item, aprovado: false, quantidadeAprovada: 0 })));
    setShowApprovalDialog(true);
  };

  const handleApprovalItemChange = (itemId: string, field: 'aprovado' | 'quantidadeAprovada', value: boolean | number) => {
    setApprovalItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const confirmApproval = () => {
    if (!orcamentoToApprove) return;

    const itensAprovados = approvalItems.filter(item => item.aprovado && item.quantidadeAprovada && item.quantidadeAprovada > 0);
    
    if (itensAprovados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um item para aprovação",
        variant: "destructive",
      });
      return;
    }

    // Abater do estoque
    itensAprovados.forEach(itemAprovado => {
      const produto = produtos.find(p => p.id === itemAprovado.produtoId);
      if (produto && produto.itensComposicao && Array.isArray(produto.itensComposicao) && produto.itensComposicao.length > 0) {
        produto.itensComposicao.forEach(composicao => {
          const item = itemStorage.getById(composicao.itemId);
          if (item) {
            const quantidadeUsada = composicao.quantidade * (itemAprovado.quantidadeAprovada || 0);
            const novoEstoque = item.estoque - quantidadeUsada;
            itemStorage.updateEstoque(item.id, Math.max(0, novoEstoque));
          }
        });
      }
    });

    const orcamentoAtualizado: Orcamento = {
      ...orcamentoToApprove,
      status: 'em_andamento',
      itens: itensAprovados.map(item => ({
        ...item,
        quantidade: item.quantidadeAprovada || item.quantidade,
        valorTotal: item.valorUnitario * (item.quantidadeAprovada || item.quantidade)
      })),
      valorTotal: itensAprovados.reduce((total, item) => 
        total + (item.valorUnitario * (item.quantidadeAprovada || item.quantidade)), 0
      ),
      updatedAt: new Date().toISOString(),
    };

    orcamentoStorage.save(orcamentoAtualizado);
    loadData();
    setShowApprovalDialog(false);
    setOrcamentoToApprove(null);
    setApprovalItems([]);
    
    toast({
      title: "Orçamento aprovado!",
      description: "Os itens selecionados foram aprovados e o estoque foi atualizado.",
    });
  };

  const handleStatusChange = (orcamentoId: string, novoStatus: StatusOrcamento, motivoCancelamento?: string) => {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;

    const orcamentoAtualizado: Orcamento = {
      ...orcamento,
      status: novoStatus,
      motivoCancelamento: novoStatus === 'cancelado' ? motivoCancelamento : undefined,
      updatedAt: new Date().toISOString(),
    };

    orcamentoStorage.save(orcamentoAtualizado);
    loadData();
    
    toast({
      title: "Status atualizado!",
      description: `Orçamento marcado como "${statusOptions.find(s => s.value === novoStatus)?.label}".`,
    });
  };

  const handlePrint = (orcamento: Orcamento) => {
    setPrintOrcamento(orcamento);
    setShowPrintDialog(true);
  };

  const generatePrintContent = (orcamento: Orcamento) => {
    const cliente = clientes.find(c => c.id === orcamento.clienteId);
    const nomeEmpresa = user?.empresa || 'OrçaSystem MVP v1.0';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Orçamento ${orcamento.id.substring(0, 8).toUpperCase()}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: white;
            color: #333;
            line-height: 1.4;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 30px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #6366f1;
            padding-bottom: 20px;
          }
          .empresa-name { 
            color: #6366f1; 
            font-size: 2.2em; 
            font-weight: 700;
            margin-bottom: 5px;
          }
          .sistema-name { 
            color: #666; 
            font-size: 1.1em;
            margin-bottom: 15px;
          }
          .orcamento-title { 
            color: #333; 
            font-size: 1.8em; 
            font-weight: 600;
            margin-bottom: 10px;
          }
          .orcamento-info { 
            color: #666; 
            font-size: 1em;
          }
          .section { 
            margin-bottom: 25px; 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 6px;
            border-left: 4px solid #6366f1;
          }
          .section h3 { 
            color: #6366f1; 
            margin-bottom: 10px; 
            font-size: 1.2em;
            font-weight: 600;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 5px 0; 
            padding: 3px 0;
          }
          .info-label { 
            font-weight: 600; 
            color: #555;
            min-width: 120px;
          }
          .info-value { 
            color: #333;
            flex: 1;
            text-align: right;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background: white;
            border-radius: 6px;
            overflow: hidden;
          }
          .items-table th {
            background: #6366f1;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9em;
          }
          .items-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 0.9em;
          }
          .items-table tr:nth-child(even) {
            background: #f9fafb;
          }
          .total-section { 
            background: linear-gradient(135deg, #6366f1, #8b5cf6); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            margin: 20px 0;
          }
          .total-section h3 { 
            color: white; 
            margin-bottom: 8px;
          }
          .total-value { 
            font-size: 1.8em; 
            font-weight: bold;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 1px solid #e5e7eb; 
            color: #666;
            font-size: 0.9em;
          }
          @media print {
            body { background: white; }
            .container { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="empresa-name">${nomeEmpresa}</div>
            <div class="sistema-name">Sistema de Orçamentos</div>
            <div class="orcamento-title">ORÇAMENTO</div>
            <div class="orcamento-info">
              <strong>Nº ${orcamento.id.substring(0, 8).toUpperCase()}</strong> • 
              Data: ${new Date(orcamento.createdAt).toLocaleDateString('pt-BR')} • 
              Válido até: ${new Date(orcamento.prazoValidade).toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div class="section">
            <h3>📋 Informações do Cliente</h3>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Nome:</span>
                <span class="info-value">${cliente?.nome || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${cliente?.email || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Telefone:</span>
                <span class="info-value">${cliente?.telefone || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Endereço:</span>
                <span class="info-value">${cliente?.endereco || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>🎨 Itens do Orçamento</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                ${orcamento.itens.map(item => {
                  const produto = produtos.find(p => p.id === item.produtoId);
                  return `
                    <tr>
                      <td>${produto?.nome || 'N/A'}</td>
                      <td>${item.quantidade}</td>
                      <td>${formatCurrency(item.valorUnitario)}</td>
                      <td><strong>${formatCurrency(item.valorTotal)}</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <h3>💰 Valor Total do Orçamento</h3>
            <div class="total-value">${formatCurrency(orcamento.valorTotal)}</div>
          </div>

          ${orcamento.observacoes ? `
            <div class="section">
              <h3>📝 Observações</h3>
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${orcamento.observacoes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>Este orçamento tem validade até ${new Date(orcamento.prazoValidade).toLocaleDateString('pt-BR')}.</strong></p>
            <p>${nomeEmpresa} - Gerado em ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const printDocument = () => {
    if (!printOrcamento) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintContent(printOrcamento));
      printWindow.document.close();
      printWindow.print();
    }
    setShowPrintDialog(false);
    setPrintOrcamento(null);
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Cliente não encontrado';
  };

  const getProdutoNome = (produtoId: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    return produto?.nome || 'Produto não encontrado';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: StatusOrcamento) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'secondary';
  };

  const filteredOrcamentos = orcamentos.filter(orcamento => {
    const cliente = clientes.find(c => c.id === orcamento.clienteId);
    const matchesSearch = 
      orcamento.id.substring(0, 8).toUpperCase().includes(searchTerm.toUpperCase()) ||
      (cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      new Date(orcamento.prazoValidade).toLocaleDateString('pt-BR').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || orcamento.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex md:grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Select
                    value={formData.clienteId}
                    onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prazoValidade">Prazo de Validade *</Label>
                  <Input
                    id="prazoValidade"
                    type="date"
                    value={formData.prazoValidade}
                    onChange={(e) => setFormData({ ...formData, prazoValidade: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações sobre o orçamento..."
                />
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label>Produto *</Label>
                    <Select
                      value={currentItem.produtoId}
                      onValueChange={(value) => setCurrentItem({ ...currentItem, produtoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id}>
                            {produto.nome} - {formatCurrency(produto.valor)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantidade}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantidade: e.target.value })}
                    />
                  </div>

                  <Button type="button" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {currentItem.produtoId && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Valor unitário:</strong> {formatCurrency(getValorUnitario())} • 
                      <strong> Total:</strong> {formatCurrency(getValorTotal())}
                    </p>
                  </div>
                )}

                {itensOrcamento.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Itens Adicionados:</h4>
                    {itensOrcamento.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{getProdutoNome(item.produtoId)}</p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantidade} × {formatCurrency(item.valorUnitario)} = {formatCurrency(item.valorTotal)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <p className="text-lg font-semibold">
                        Total: {formatCurrency(getTotalOrcamento())}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingOrcamento ? 'Atualizar' : 'Criar'} Orçamento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Orçamentos ({filteredOrcamentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar por número, cliente ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={(value: StatusOrcamento | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrcamentos.map((orcamento) => (
              <Card key={orcamento.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">#{orcamento.id.substring(0, 8).toUpperCase()}</span>
                    <Badge variant={getStatusColor(orcamento.status) as any}>
                      {statusOptions.find(s => s.value === orcamento.status)?.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span className="truncate">{getClienteNome(orcamento.clienteId)}</span>
                    </div>
                    
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(orcamento.valorTotal)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Itens:</span>
                      <Badge variant="outline">
                        {orcamento.itens?.length || 0} {(orcamento.itens?.length || 0) === 1 ? 'item' : 'itens'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Válido até {new Date(orcamento.prazoValidade).toLocaleDateString('pt-BR')}</span>
                    </div>

                    {orcamento.observacoes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {orcamento.observacoes}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      {orcamento.status === 'orcamento' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(orcamento)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(orcamento)}
                        className="hover:bg-gray-50 hover:border-gray-200"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-1">
                      {orcamento.status === 'orcamento' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproval(orcamento)}
                          className="hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {orcamento.status === 'em_andamento' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(orcamento.id, 'pago')}
                          className="hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}

                      {orcamento.status !== 'pago' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(orcamento.id)}
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrcamentos.length === 0 && orcamentos.length > 0 && (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum orçamento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          )}

          {orcamentos.length === 0 && (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum orçamento cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando um novo orçamento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de impressão */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Deseja imprimir o orçamento #{printOrcamento?.id.substring(0, 8).toUpperCase()}?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={printDocument}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de aprovação */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Aprovar Orçamento #{orcamentoToApprove?.id.substring(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <p className="text-sm text-muted-foreground">
              Selecione os itens e quantidades que deseja aprovar:
            </p>
            
            {approvalItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.aprovado}
                      onChange={(e) => handleApprovalItemChange(item.id, 'aprovado', e.target.checked)}
                      className="rounded"
                    />
                    <span className="font-medium">{getProdutoNome(item.produtoId)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.valorUnitario)} cada
                  </span>
                </div>
                
                {item.aprovado && (
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Quantidade:</Label>
                    <Input
                      type="number"
                      min="1"
                      max={item.quantidade}
                      value={item.quantidadeAprovada || ''}
                      onChange={(e) => handleApprovalItemChange(item.id, 'quantidadeAprovada', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      de {item.quantidade} max.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmApproval}>
              <Check className="h-4 w-4 mr-2" />
              Aprovar Selecionados
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Orçamento"
        description="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setOrcamentoToDelete(null)}
        variant="destructive"
        confirmText="Excluir"
      />
    </div>
  );
};

export default Orcamentos;