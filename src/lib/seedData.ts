// Dados iniciais para demonstração do sistema
import { 
  clienteStorage, 
  tipoMaterialStorage, 
  tipoArteStorage, 
  itemStorage, 
  produtoStorage,
  orcamentoStorage 
} from './storage';

export const seedInitialData = () => {
  // Verificar se já existem dados
  if (clienteStorage.getAll().length > 0) return;

  // Tipos de Material
  const tiposMaterial = [
    {
      id: '1',
      nome: 'Papel Fotográfico',
      descricao: 'Papel de alta qualidade para impressões fotográficas',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Canvas',
      descricao: 'Tecido canvas para impressões artísticas',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Adesivo Vinil',
      descricao: 'Adesivo vinílico para aplicações diversas',
      createdAt: new Date().toISOString(),
    },
  ];

  tiposMaterial.forEach(tipo => tipoMaterialStorage.save(tipo));

  // Tipos de Arte
  const tiposArte = [
    {
      id: '1',
      nome: 'Sublimação',
      descricao: 'Impressão por sublimação térmica',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Impressão Digital',
      descricao: 'Impressão digital em alta resolução',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Corte Ploter',
      descricao: 'Corte em vinil para adesivos',
      createdAt: new Date().toISOString(),
    },
  ];

  tiposArte.forEach(tipo => tipoArteStorage.save(tipo));

  // Itens/Materiais
  const itens = [
    {
      id: '1',
      nome: 'Tinta Sublimática Ciano',
      estoque: 50,
      estoqueMinimo: 10,
      unidade: 'ml',
      custo: 0.15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Tinta Sublimática Magenta',
      estoque: 45,
      estoqueMinimo: 10,
      unidade: 'ml',
      custo: 0.15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Papel Transfer',
      estoque: 100,
      estoqueMinimo: 20,
      unidade: 'un',
      custo: 2.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      nome: 'Vinil Branco',
      estoque: 15,
      estoqueMinimo: 5,
      unidade: 'm',
      custo: 12.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  itens.forEach(item => itemStorage.save(item));

  // Produtos
  const produtos = [
    {
      id: '1',
      nome: 'Caneca Personalizada',
      descricao: 'Caneca branca com impressão sublimática',
      valor: 25.00,
      categoria: 'Brindes',
      itensComposicao: [
        { itemId: '1', quantidade: 5 },
        { itemId: '2', quantidade: 5 },
        { itemId: '3', quantidade: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Adesivo Personalizado A4',
      descricao: 'Adesivo cortado em vinil no tamanho A4',
      valor: 15.00,
      categoria: 'Adesivos',
      itensComposicao: [
        { itemId: '4', quantidade: 0.5 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Banner Personalizado',
      descricao: 'Banner impresso em lona',
      valor: 80.00,
      categoria: 'Comunicação Visual',
      itensComposicao: [
        { itemId: '1', quantidade: 20 },
        { itemId: '2', quantidade: 15 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  produtos.forEach(produto => produtoStorage.save(produto));

  // Clientes
  const clientes = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Empresa XYZ Ltda',
      email: 'contato@empresaxyz.com',
      telefone: '(11) 3333-4444',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      createdAt: new Date().toISOString(),
    },
  ];

  clientes.forEach(cliente => clienteStorage.save(cliente));

  // Orçamentos de exemplo
  const orcamentos = [
    {
      id: '1',
      clienteId: '1',
      produtoId: '1',
      tipoMaterialId: '1',
      tipoArteId: '1',
      quantidade: 2,
      valorUnitario: 25.00,
      valorTotal: 50.00,
      status: 'pago' as const,
      observacoes: 'Canecas com logo da empresa',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      clienteId: '2',
      produtoId: '2',
      tipoMaterialId: '3',
      tipoArteId: '3',
      quantidade: 10,
      valorUnitario: 15.00,
      valorTotal: 150.00,
      status: 'em_andamento' as const,
      observacoes: 'Adesivos para decoração',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      clienteId: '3',
      produtoId: '3',
      tipoMaterialId: '2',
      tipoArteId: '2',
      quantidade: 1,
      valorUnitario: 80.00,
      valorTotal: 80.00,
      status: 'orcamento' as const,
      observacoes: 'Banner para evento corporativo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  orcamentos.forEach(orcamento => orcamentoStorage.save(orcamento));
};