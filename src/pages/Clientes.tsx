import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Cliente } from '@/types';
import { clienteStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClientes(clienteStorage.getAll());
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
    });
    setEditingCliente(null);
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

    const cliente: Cliente = {
      id: editingCliente?.id || crypto.randomUUID(),
      nome: formData.nome,
      email: formData.email || undefined,
      telefone: formData.telefone || undefined,
      endereco: formData.endereco || undefined,
      createdAt: editingCliente?.createdAt || new Date().toISOString(),
    };

    clienteStorage.save(cliente);
    loadData();
    setShowDialog(false);
    resetForm();

    toast({
      title: editingCliente ? "Cliente atualizado!" : "Cliente criado!",
      description: `${cliente.nome} foi ${editingCliente ? 'atualizado' : 'cadastrado'} com sucesso.`,
    });
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || '',
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setClienteToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      clienteStorage.delete(clienteToDelete);
      loadData();
      toast({
        title: "Cliente excluído!",
        description: "O cliente foi removido com sucesso.",
      });
      setClienteToDelete(null);
    }
  };

  return (
    <div className={cn("p-6 space-y-6", collapsed && "pl-10")}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
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

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCliente ? 'Atualizar' : 'Criar'} Cliente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes ({clientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cadastrado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {cliente.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {cliente.email}
                          </div>
                        )}
                        {cliente.telefone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {cliente.telefone}
                          </div>
                        )}
                        {!cliente.email && !cliente.telefone && (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cliente.endereco ? (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-3 w-3 mt-0.5" />
                          <span className="line-clamp-2">{cliente.endereco}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cliente.id)}
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
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setClienteToDelete(null)}
        variant="destructive"
        confirmText="Excluir"
      />
    </div>
  );
};

export default Clientes;