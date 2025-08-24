import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { TipoArte } from '@/types';
import { tipoArteStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const TiposArte = () => {
  const [tipos, setTipos] = useState<TipoArte[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoArte | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTipos(tipoArteStorage.getAll());
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
    });
    setEditingTipo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const tipo: TipoArte = {
      id: editingTipo?.id || crypto.randomUUID(),
      nome: formData.nome,
      descricao: formData.descricao || undefined,
      createdAt: editingTipo?.createdAt || new Date().toISOString(),
    };

    tipoArteStorage.save(tipo);
    loadData();
    setShowDialog(false);
    resetForm();

    toast({
      title: editingTipo ? "Tipo atualizado!" : "Tipo criado!",
      description: `${tipo.nome} foi ${editingTipo ? 'atualizado' : 'cadastrado'} com sucesso.`,
    });
  };

  const handleEdit = (tipo: TipoArte) => {
    setEditingTipo(tipo);
    setFormData({
      nome: tipo.nome,
      descricao: tipo.descricao || '',
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setTipoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (tipoToDelete) {
      tipoArteStorage.delete(tipoToDelete);
      loadData();
      toast({
        title: "Tipo de arte excluído!",
        description: "O tipo foi removido com sucesso.",
      });
      setTipoToDelete(null);
    }
  };

  return (
    <div className={cn("p-6 space-y-6", collapsed && "pl-10")}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tipos de Arte</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTipo ? 'Editar Tipo de Arte' : 'Novo Tipo de Arte'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Sublimação, Impressão Digital, Serigrafia..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Detalhes sobre este tipo de arte..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTipo ? 'Atualizar' : 'Criar'} Tipo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Lista de Tipos de Arte ({tipos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cadastrado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum tipo de arte cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                tipos.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell className="font-medium">{tipo.nome}</TableCell>
                    <TableCell>
                      {tipo.descricao || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(tipo.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tipo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tipo.id)}
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

      {/* Dialog de confirmação para exclusão */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Tipo de Arte"
        description="Tem certeza que deseja excluir este tipo de arte? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setTipoToDelete(null)}
        variant="destructive"
        confirmText="Excluir"
      />
    </div>
  );
};

export default TiposArte;