import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Box, AlertTriangle } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Item } from '@/types';
import { itemStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const unidades = ['un', 'kg', 'g', 'L', 'ml', 'm', 'cm', 'mm', 'pç'];

const Itens = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

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
    if (item.estoque <= item.estoqueMinimo) {
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

  const itensComAlerta = itens.filter(item => item.estoque <= item.estoqueMinimo);

  return (
    <div className={cn("p-6 space-y-6", collapsed && "pl-10")}>
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
              Novo Item
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
            Lista de Itens ({itens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Custo Unit.</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum item cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                itens.map((item) => {
                  const statusEstoque = getStatusEstoque(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={item.estoque}
                            onChange={(e) => handleEstoqueUpdate(item.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">{item.unidade}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.estoqueMinimo} {item.unidade}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusEstoque.color} className="flex items-center gap-1 w-fit">
                          {statusEstoque.icon && <statusEstoque.icon className="h-3 w-3" />}
                          {statusEstoque.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(item.custo)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
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