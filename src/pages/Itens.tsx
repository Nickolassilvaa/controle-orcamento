import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Box, AlertTriangle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Item } from '@/types';
import { itemStorage } from '@/lib/storage';

const unidades = ['un', 'kg', 'g', 'L', 'ml', 'm', 'cm', 'mm', 'pç'];

const Itens = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    estoque: '',
    estoqueMinimo: '',
    unidade: 'un',
    custo: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItens(itemStorage.getAll());
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      estoque: '',
      estoqueMinimo: '',
      unidade: 'un',
      custo: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.estoque || !formData.estoqueMinimo) {
      toast({
        title: "Erro",
        description: "Nome, estoque atual e estoque mínimo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const item: Item = {
      id: editingItem?.id || crypto.randomUUID(),
      nome: formData.nome,
      estoque: parseInt(formData.estoque),
      estoqueMinimo: parseInt(formData.estoqueMinimo),
      unidade: formData.unidade,
      custo: formData.custo ? parseFloat(formData.custo) : undefined,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    itemStorage.save(item);
    loadData();
    setShowDialog(false);
    resetForm();

    toast({
      title: editingItem ? "Item atualizado!" : "Item criado!",
      description: `${item.nome} foi ${editingItem ? 'atualizado' : 'cadastrado'} com sucesso.`,
    });
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      estoque: item.estoque.toString(),
      estoqueMinimo: item.estoqueMinimo.toString(),
      unidade: item.unidade,
      custo: item.custo?.toString() || '',
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      itemStorage.delete(itemToDelete);
      loadData();
      toast({
        title: "Item excluído!",
        description: "O item foi removido com sucesso.",
      });
      setItemToDelete(null);
    }
  };

  const handleEstoqueUpdate = (itemId: string, novoEstoque: number) => {
    itemStorage.updateEstoque(itemId, novoEstoque);
    loadData();
    toast({
      title: "Estoque atualizado!",
      description: "A quantidade em estoque foi atualizada.",
    });
  };

  const getStatusEstoque = (item: Item) => {
    if (item.estoque <= item.estoqueMinimo && item.estoqueMinimo > 0) {
      return { 
        status: 'Baixo', 
        color: 'destructive' as const,
        icon: AlertTriangle
      };
    }
    return { 
      status: 'Normal', 
      color: 'secondary' as const,
      icon: null
    };
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const itensComAlerta = itens.filter(item => item.estoque <= item.estoqueMinimo && item.estoqueMinimo > 0);
  
  const filteredItens = itens.filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Itens/Materiais</h1>
          {itensComAlerta.length > 0 && (
            <p className="text-destructive mt-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {itensComAlerta.length} {itensComAlerta.length === 1 ? 'item com' : 'itens com'} estoque baixo
            </p>
          )}
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estoque">Estoque Atual *</Label>
                  <Input
                    id="estoque"
                    type="number"
                    min="0"
                    value={formData.estoque}
                    onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo *</Label>
                  <Input
                    id="estoqueMinimo"
                    type="number"
                    min="0"
                    value={formData.estoqueMinimo}
                    onChange={(e) => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((unidade) => (
                        <SelectItem key={unidade} value={unidade}>
                          {unidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="custo">Custo Unitário (R$)</Label>
                  <Input
                    id="custo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.custo}
                    onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Atualizar' : 'Criar'} Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Lista de Itens ({filteredItens.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nome do item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItens.map((item) => {
              const statusEstoque = getStatusEstoque(item);
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Box className="h-5 w-5" />
                      {item.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estoque:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Input
                            type="number"
                            min="0"
                            value={item.estoque}
                            onChange={(e) => handleEstoqueUpdate(item.id, parseInt(e.target.value))}
                            className="h-8 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">{item.unidade}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mínimo:</span>
                        <div className="mt-1">
                          <span className="text-sm font-medium">
                            {item.estoqueMinimo} {item.unidade}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground text-sm">Status:</span>
                        <div className="mt-1">
                          <Badge variant={statusEstoque.color} className="flex items-center gap-1 w-fit">
                            {statusEstoque.icon && <statusEstoque.icon className="h-3 w-3" />}
                            {statusEstoque.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground text-sm">Custo:</span>
                        <div className="mt-1 text-sm font-medium">
                          {formatCurrency(item.custo)}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredItens.length === 0 && itens.length > 0 && (
            <div className="text-center py-10">
              <Box className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum item encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros de busca.
              </p>
            </div>
          )}

          {itens.length === 0 && (
            <div className="text-center py-10">
              <Box className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum item cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando um novo item.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação para exclusão */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Item"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
        variant="destructive"
        confirmText="Excluir"
      />
    </div>
  );
};

export default Itens;