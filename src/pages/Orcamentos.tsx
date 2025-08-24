import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText, Printer, Eye } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Orcamento, StatusOrcamento, Cliente, Produto, TipoMaterial, TipoArte } from '@/types';
import { 
  orcamentoStorage, 
  clienteStorage, 
  produtoStorage, 
  tipoMaterialStorage, 
  tipoArteStorage,
  itemStorage 
} from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const statusOptions: { value: StatusOrcamento; label: string; color: string }[] = [
  { value: 'orcamento', label: 'Orçamento', color: 'secondary' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'warning' },
  { value: 'pago', label: 'Pago', color: 'success' },
  { value: 'cancelado', label: 'Cancelado', color: 'destructive' },
];

const Orcamentos = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [tiposMaterial, setTiposMaterial] = useState<TipoMaterial[]>([]);
  const [tiposArte, setTiposArte] = useState<TipoArte[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printOrcamento, setPrintOrcamento] = useState<Orcamento | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orcamentoToCancel, setOrcamentoToCancel] = useState<string | null>(null);
  const { toast } = useToast();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const [formData, setFormData] = useState({
    clienteId: '',
    produtoId: '',
    tipoMaterialId: '',
    tipoArteId: '',
    quantidade: '1',
    observacoes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrcamentos(orcamentoStorage.getAll());
    setClientes(clienteStorage.getAll());
    setProdutos(produtoStorage.getAll());
    setTiposMaterial(tipoMaterialStorage.getAll());
    setTiposArte(tipoArteStorage.getAll());
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      produtoId: '',
      tipoMaterialId: '',
      tipoArteId: '',
      quantidade: '1',
      observacoes: '',
    });
    setEditingOrcamento(null);
  };

  const getValorUnitario = () => {
    const produto = produtos.find(p => p.id === formData.produtoId);
    return produto?.valor || 0;
  };

  const getValorTotal = () => {
    return getValorUnitario() * parseInt(formData.quantidade || '1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.produtoId || !formData.tipoMaterialId || !formData.tipoArteId) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const valorUnitario = getValorUnitario();
    const quantidade = parseInt(formData.quantidade);
    
    const orcamento: Orcamento = {
      id: editingOrcamento?.id || crypto.randomUUID(),
      clienteId: formData.clienteId,
      produtoId: formData.produtoId,
      tipoMaterialId: formData.tipoMaterialId,
      tipoArteId: formData.tipoArteId,
      quantidade,
      valorUnitario,
      valorTotal: valorUnitario * quantidade,
      status: editingOrcamento?.status || 'orcamento',
      observacoes: formData.observacoes,
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
      produtoId: orcamento.produtoId,
      tipoMaterialId: orcamento.tipoMaterialId,
      tipoArteId: orcamento.tipoArteId,
      quantidade: orcamento.quantidade.toString(),
      observacoes: orcamento.observacoes || '',
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setOrcamentoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (orcamentoToDelete) {
      orcamentoStorage.delete(orcamentoToDelete);
      loadData();
      toast({
        title: "Orçamento excluído!",
        description: "O orçamento foi removido com sucesso.",
      });
      setOrcamentoToDelete(null);
    }
  };

  const handleStatusChange = (orcamentoId: string, novoStatus: StatusOrcamento, motivoCancelamento?: string) => {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) return;

    // Se mudou para "em_andamento", abater do estoque
    if (novoStatus === 'em_andamento' && orcamento.status !== 'em_andamento') {
      const produto = produtos.find(p => p.id === orcamento.produtoId);
      if (produto && produto.itensComposicao.length > 0) {
        // Abater itens do estoque
        produto.itensComposicao.forEach(composicao => {
          const item = itemStorage.getById(composicao.itemId);
          if (item) {
            const novoEstoque = item.estoque - (composicao.quantidade * orcamento.quantidade);
            itemStorage.updateEstoque(item.id, Math.max(0, novoEstoque));
          }
        });
      }
    }

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
    const produto = produtos.find(p => p.id === orcamento.produtoId);
    const tipoMaterial = tiposMaterial.find(t => t.id === orcamento.tipoMaterialId);
    const tipoArte = tiposArte.find(t => t.id === orcamento.tipoArteId);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Orçamento ${orcamento.id.substring(0, 8).toUpperCase()}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: #f8f9fa;
            color: #333;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #6366f1; 
            font-size: 2.5em; 
            margin: 0 0 10px 0; 
            font-weight: 700;
          }
          .header p { 
            color: #666; 
            margin: 5px 0; 
            font-size: 1.1em;
          }
          .section { 
            margin-bottom: 30px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 8px;
            border-left: 4px solid #6366f1;
          }
          .section h3 { 
            color: #6366f1; 
            margin: 0 0 15px 0; 
            font-size: 1.3em;
            font-weight: 600;
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0; 
            padding: 5px 0;
          }
          .info-label { 
            font-weight: 600; 
            color: #555;
          }
          .info-value { 
            color: #333;
          }
          .total-section { 
            background: linear-gradient(135deg, #6366f1, #8b5cf6); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center;
            margin: 30px 0;
          }
          .total-section h3 { 
            color: white; 
            margin: 0 0 10px 0;
          }
          .total-value { 
            font-size: 2em; 
            font-weight: bold; 
            margin: 10px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            color: #666;
          }
          @media print {
            body { background: white; padding: 20px; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ORÇAMENTO</h1>
            <p><strong>Nº ${orcamento.id.substring(0, 8).toUpperCase()}</strong></p>
            <p>Data: ${new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="section">
            <h3>📋 Informações do Cliente</h3>
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
          </div>

          <div class="section">
            <h3>🎨 Detalhes do Produto</h3>
            <div class="info-row">
              <span class="info-label">Produto:</span>
              <span class="info-value">${produto?.nome || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tipo de Material:</span>
              <span class="info-value">${tipoMaterial?.nome || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tipo de Arte:</span>
              <span class="info-value">${tipoArte?.nome || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Quantidade:</span>
              <span class="info-value">${orcamento.quantidade} unidade(s)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Valor Unitário:</span>
              <span class="info-value">${formatCurrency(orcamento.valorUnitario)}</span>
            </div>
          </div>

          <div class="total-section">
            <h3>💰 Valor Total</h3>
            <div class="total-value">${formatCurrency(orcamento.valorTotal)}</div>
          </div>

          ${orcamento.observacoes ? `
            <div class="section">
              <h3>📝 Observações</h3>
              <p style="margin: 0; line-height: 1.6;">${orcamento.observacoes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>Este orçamento tem validade de 30 dias a partir da data de emissão.</strong></p>
            <p>Nrdev Consultoria e Soluções Tecnológicas - Gerado em ${new Date().toLocaleString('pt-BR')}</p>
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

  const getStatusInfo = (status: StatusOrcamento) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={cn("p-6 space-y-6", collapsed && "pl-10")}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clienteId">Cliente *</Label>
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
                <Label htmlFor="produtoId">Produto *</Label>
                <Select
                  value={formData.produtoId}
                  onValueChange={(value) => setFormData({ ...formData, produtoId: value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoMaterialId">Tipo de Material *</Label>
                  <Select
                    value={formData.tipoMaterialId}
                    onValueChange={(value) => setFormData({ ...formData, tipoMaterialId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o material" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposMaterial.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipoArteId">Tipo de Arte *</Label>
                  <Select
                    value={formData.tipoArteId}
                    onValueChange={(value) => setFormData({ ...formData, tipoArteId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a arte" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposArte.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações adicionais..."
                    className="min-h-[120px]"
                  />
                </div>

                {formData.produtoId && (
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold mb-3 text-primary">Resumo do Orçamento</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor unitário:</span>
                        <span className="font-medium">{formatCurrency(getValorUnitario())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quantidade:</span>
                        <span className="font-medium">{formData.quantidade}</span>
                      </div>
                      <div className="border-t pt-2 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Valor Total:</span>
                          <span className="text-xl font-bold text-success">{formatCurrency(getValorTotal())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>


              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingOrcamento ? 'Atualizar' : 'Gerar'} Orçamento
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
            Lista de Orçamentos ({orcamentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum orçamento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                orcamentos.map((orcamento) => {
                  const statusInfo = getStatusInfo(orcamento.status);
                  return (
                    <TableRow key={orcamento.id}>
                      <TableCell className="font-medium">
                        {getClienteNome(orcamento.clienteId)}
                      </TableCell>
                      <TableCell>{getProdutoNome(orcamento.produtoId)}</TableCell>
                      <TableCell>{orcamento.quantidade}</TableCell>
                      <TableCell className="font-medium text-success">
                        {formatCurrency(orcamento.valorTotal)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={orcamento.status}
                          onValueChange={(value: StatusOrcamento) => {
                            if (value === 'cancelado') {
                              setOrcamentoToCancel(orcamento.id);
                              setShowCancelDialog(true);
                            } else {
                              handleStatusChange(orcamento.id, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              <Badge variant={statusInfo.color as any}>
                                {statusInfo.label}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrint(orcamento)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(orcamento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(orcamento.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para impressão */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Imprimir Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {printOrcamento && (
              <div dangerouslySetInnerHTML={{ __html: generatePrintContent(printOrcamento) }} />
            )}
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

      {/* Dialog para cancelamento com motivo */}
      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar Orçamento"
        description="Por favor, informe o motivo do cancelamento:"
        onConfirm={(motivo) => {
          if (orcamentoToCancel && motivo) {
            handleStatusChange(orcamentoToCancel, 'cancelado', motivo);
            setOrcamentoToCancel(null);
          }
        }}
        onCancel={() => setOrcamentoToCancel(null)}
        type="prompt"
        inputLabel="Motivo do cancelamento"
        inputPlaceholder="Digite o motivo..."
        variant="destructive"
        confirmText="Cancelar Orçamento"
      />
    </div>
  );
};

export default Orcamentos;