import { Cliente, Item, Produto, Orcamento } from '@/types';

// Chaves do localStorage
const STORAGE_KEYS = {
  CLIENTES: 'app_clientes',
  ITENS: 'app_itens',
  PRODUTOS: 'app_produtos',
  ORCAMENTOS: 'app_orcamentos',
} as const;

// Funções genéricas para localStorage
export function getFromStorage<T>(key: string, defaultValue: T[] = []): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Clientes
export const clienteStorage = {
  getAll: (): Cliente[] => getFromStorage(STORAGE_KEYS.CLIENTES),
  save: (cliente: Cliente) => {
    const clientes = clienteStorage.getAll();
    const index = clientes.findIndex(c => c.id === cliente.id);
    if (index >= 0) {
      clientes[index] = cliente;
    } else {
      clientes.push(cliente);
    }
    saveToStorage(STORAGE_KEYS.CLIENTES, clientes);
  },
  delete: (id: string) => {
    const clientes = clienteStorage.getAll().filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CLIENTES, clientes);
  },
  getById: (id: string) => clienteStorage.getAll().find(c => c.id === id),
};


// Itens
export const itemStorage = {
  getAll: (): Item[] => getFromStorage(STORAGE_KEYS.ITENS),
  save: (item: Item) => {
    const itens = itemStorage.getAll();
    const index = itens.findIndex(i => i.id === item.id);
    if (index >= 0) {
      itens[index] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      itens.push(item);
    }
    saveToStorage(STORAGE_KEYS.ITENS, itens);
  },
  delete: (id: string) => {
    const itens = itemStorage.getAll().filter(i => i.id !== id);
    saveToStorage(STORAGE_KEYS.ITENS, itens);
  },
  getById: (id: string) => itemStorage.getAll().find(i => i.id === id),
  updateEstoque: (id: string, novoEstoque: number) => {
    const itens = itemStorage.getAll();
    const item = itens.find(i => i.id === id);
    if (item) {
      item.estoque = novoEstoque;
      item.updatedAt = new Date().toISOString();
      saveToStorage(STORAGE_KEYS.ITENS, itens);
    }
  },
};

// Produtos
export const produtoStorage = {
  getAll: (): Produto[] => getFromStorage(STORAGE_KEYS.PRODUTOS),
  save: (produto: Produto) => {
    const produtos = produtoStorage.getAll();
    const index = produtos.findIndex(p => p.id === produto.id);
    if (index >= 0) {
      produtos[index] = { ...produto, updatedAt: new Date().toISOString() };
    } else {
      produtos.push(produto);
    }
    saveToStorage(STORAGE_KEYS.PRODUTOS, produtos);
  },
  delete: (id: string) => {
    const produtos = produtoStorage.getAll().filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUTOS, produtos);
  },
  getById: (id: string) => produtoStorage.getAll().find(p => p.id === id),
};

// Orçamentos
export const orcamentoStorage = {
  getAll: (): Orcamento[] => getFromStorage(STORAGE_KEYS.ORCAMENTOS),
  save: (orcamento: Orcamento) => {
    const orcamentos = orcamentoStorage.getAll();
    const index = orcamentos.findIndex(o => o.id === orcamento.id);
    if (index >= 0) {
      orcamentos[index] = { ...orcamento, updatedAt: new Date().toISOString() };
    } else {
      orcamentos.push(orcamento);
    }
    saveToStorage(STORAGE_KEYS.ORCAMENTOS, orcamentos);
  },
  delete: (id: string) => {
    const orcamentos = orcamentoStorage.getAll().filter(o => o.id !== id);
    saveToStorage(STORAGE_KEYS.ORCAMENTOS, orcamentos);
  },
  getById: (id: string) => orcamentoStorage.getAll().find(o => o.id === id),
};