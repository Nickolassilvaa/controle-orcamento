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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package, Eye } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Produto, Item, ItemComposicao } from '@/types';
import { produtoStorage, itemStorage } from '@/lib/storage';

const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [showComposicaoDialog, setShowComposicaoDialog] = useState(false);
  const [selectedProdutoComposicao, setSelectedProdutoComposicao] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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
    console.log(item)
    return item?.unidade || 'un';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredProdutos = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (produto.categoria && produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo
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
                              {item.nome} {item.unidade}
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
            Lista de Produtos ({filteredProdutos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProdutos.map((produto) => (
              <Card key={produto.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {produto.nome}
                  </CardTitle>
                  {produto.categoria && (
                    <Badge variant="secondary">{produto.categoria}</Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    {produto.descricao && (
                      <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                    )}
                    
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(produto.valor)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Composição:</span>
                      {produto.itensComposicao.length > 0 ? (
                        <div className="flex items-center gap-2">
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
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(produto)}
                      className="hover:bg-blue-50 hover:border-blue-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(produto.id)}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProdutos.length === 0 && produtos.length > 0 && (
            <div className="text-center py-10">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          )}

          {produtos.length === 0 && (
            <div className="text-center py-10">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum produto cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando um novo produto.
              </p>
            </div>
          )}
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