// Tipos principais do sistema de orçamentos

export interface User {
  id: string;
  email: string;
  password: string;
  empresa: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  createdAt: string;
}


export interface Item {
  id: string;
  nome: string;
  estoque: number;
  estoqueMinimo: number;
  unidade: string; // 'un', 'kg', 'ml', etc.
  custo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemComposicao {
  itemId: string;
  quantidade: number;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  categoria?: string;
  itensComposicao: ItemComposicao[]; // Itens que compõem este produto
  createdAt: string;
  updatedAt: string;
}

export type StatusOrcamento = 'orcamento' | 'em_andamento' | 'pago' | 'cancelado';

export interface OrcamentoItem {
  id: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  aprovado?: boolean; // Para aprovação parcial
  quantidadeAprovada?: number; // Quantidade aprovada quando em aprovação parcial
}

export interface Orcamento {
  id: string;
  clienteId: string;
  itens: OrcamentoItem[];
  valorTotal: number;
  status: StatusOrcamento;
  observacoes?: string;
  motivoCancelamento?: string;
  prazoValidade: string; // Data de validade do orçamento
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalFaturado: number;
  aFaturar: number;
  orcamentosEmAberto: number;
  produtosMaisVendidos: Array<{
    produto: Produto;
    quantidadeVendida: number;
    totalFaturado: number;
  }>;
  itensEstoqueBaixo: Array<{
    item: Item;
    percentualEstoque: number;
  }>;
  vendaRecente: Array<{
    data: string;
    valor: number;
  }>;
  totalGastos: number;
  lucroTotal: number;
}