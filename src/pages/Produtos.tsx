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
import { Plus, Edit, Trash2, Package, Eye } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Produto, Item, ItemComposicao } from '@/types';
import { produtoStorage, itemStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [showComposicaoDialog, setShowComposicaoDialog] = useState(false);
  const [selectedProdutoComposicao, setSelectedProdutoComposicao] = useState<Produto | null>(null);
  const { toast } = useToast();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
    categoria: '',
    itensComposicao: [] as ItemComposicao[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProdutos(produtoStorage.getAll());
    setItens(itemStorage.getAll());
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      valor: '',
      categoria: '',
      itensComposicao: [],
    });
    setEditingProduto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valor) {
      toast({
        title: "Erro",
        description: "Nome e valor são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const produto: Produto = {
      id: editingProduto?.id || crypto.randomUUID(),
      nome: formData.nome,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria: formData.categoria,
      itensComposicao: formData.itensComposicao,
      createdAt: editingProduto?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    produtoStorage.save(produto);
    loadData();
    setShowDialog(false);
    resetForm();

    toast({
      title: editingProduto ? "Produto atualizado!" : "Produto criado!",
      description: `${produto.nome} foi ${editingProduto ? 'atualizado' : 'cadastrado'} com sucesso.`,
    });
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      valor: produto.valor.toString(),
      categoria: produto.categoria || '',
      itensComposicao: produto.itensComposicao,
    });
    setShowDialog(true);
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      produtoStorage.delete(productToDelete);
      loadData();
      toast({
        title: "Produto excluído!",
        description: "O produto foi removido com sucesso.",
      });
      setProductToDelete(null);
    }
  };

  const addItemComposicao = () => {
    setFormData({
      ...formData,
      itensComposicao: [...formData.itensComposicao, { itemId: '', quantidade: 1 }],
    });
  };

  const updateItemComposicao = (index: number, field: keyof ItemComposicao, value: string | number) => {
    console.log(index, field, value)
    const newComposicao = [...formData.itensComposicao];
    newComposicao[index] = { ...newComposicao[index], [field]: value };
    
    // Calcular automaticamente o valor do produto baseado na composição
    if (field === 'itemId' || field === 'quantidade') {
      const custoTotal = newComposicao.reduce((total, comp) => {
        const item = itens.find(i => i.id === comp.itemId);
        return total + (item ? (item.custo || 0) * comp.quantidade : 0);
      }, 0);
      
      // Aplicar margem de 50% sobre o custo
      const valorSugerido = custoTotal * 1.5;
      setFormData({ 
        ...formData, 
        itensComposicao: newComposicao,
        valor: valorSugerido > 0 ? valorSugerido.toFixed(2) : formData.valor
      });
    } else {
      setFormData({ ...formData, itensComposicao: newComposicao });
    }
  };

  const removeItemComposicao = (index: number) => {
    setFormData({
      ...formData,
      itensComposicao: formData.itensComposicao.filter((_, i) => i !== index),
    });
  };

  const getItemNome = (itemId: string) => {
    const item = itens.find(i => i.id === itemId);
    return item?.nome || 'Item não encontrado';
  };

  const getItemUnidade = (itemId: string) => {
    const item = itens.find(i => i.id === itemId);
    return item?.unidade || '';
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={cn("p-6 space-y-6", collapsed && "pl-10")}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Composição do Produto (Itens Necessários)</Label>
                  <Button type="button" onClick={addItemComposicao} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {formData.itensComposicao.map((composicao, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <Select
                        value={composicao.itemId}
                        onValueChange={(value) => updateItemComposicao(index, 'itemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um item" />
                        </SelectTrigger>
                        <SelectContent>
                          {itens.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nome} ({item.unidade})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Qtd"
                        value={composicao.quantidade}
                        onChange={(e) => updateItemComposicao(index, 'quantidade', parseFloat(e.target.value))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeItemComposicao(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduto ? 'Atualizar' : 'Criar'} Produto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Produtos ({produtos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Composição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        {produto.descricao && (
                          <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {produto.categoria ? (
                        <Badge variant="secondary">{produto.categoria}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-success">
                      {formatCurrency(produto.valor)}
                    </TableCell>
                    <TableCell>
                      {produto.itensComposicao.length > 0 ? (
                        <div>
                          <Badge variant="outline">
                            {produto.itensComposicao.length} {produto.itensComposicao.length === 1 ? 'item' : 'itens'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProdutoComposicao(produto);
                              setShowComposicaoDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sem composição</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(produto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para ver composição */}
      <Dialog open={showComposicaoDialog} onOpenChange={setShowComposicaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Composição: {selectedProdutoComposicao?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedProdutoComposicao?.itensComposicao.map((composicao, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{getItemNome(composicao.itemId)}</span>
                <Badge>{composicao.quantidade} {getItemUnidade(composicao.itemId)}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setProductToDelete(null)}
        variant="destructive"
        confirmText="Excluir"
      />
    </div>
  );
};

export default Produtos;