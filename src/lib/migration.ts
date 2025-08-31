// Função para migrar dados antigos do localStorage para a nova estrutura
import { Orcamento, OrcamentoItem } from '@/types';

interface OldOrcamento {
  id: string;
  clienteId: string;
  produtoId: string;
  tipoMaterialId: string;
  tipoArteId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  status: 'orcamento' | 'em_andamento' | 'pago' | 'cancelado';
  observacoes?: string;
  motivoCancelamento?: string;
  createdAt: string;
  updatedAt: string;
}

export const migrateOrcamentos = (): void => {
  try {
    const storedData = localStorage.getItem('orcamentos');
    if (!storedData) return;

    const data = JSON.parse(storedData);
    let migrated = false;

    const migratedOrcamentos = data.map((orcamento: any) => {
      // Se já tem a nova estrutura, manter como está
      if (orcamento.itens && Array.isArray(orcamento.itens)) {
        return orcamento as Orcamento;
      }

      // Migrar da estrutura antiga para a nova
      if (orcamento.produtoId) {
        migrated = true;
        const oldOrcamento = orcamento as OldOrcamento;
        
        const item: OrcamentoItem = {
          id: crypto.randomUUID(),
          produtoId: oldOrcamento.produtoId,
          quantidade: oldOrcamento.quantidade,
          valorUnitario: oldOrcamento.valorUnitario,
          valorTotal: oldOrcamento.valorTotal,
        };

        const newOrcamento: Orcamento = {
          id: oldOrcamento.id,
          clienteId: oldOrcamento.clienteId,
          itens: [item],
          valorTotal: oldOrcamento.valorTotal,
          status: oldOrcamento.status,
          observacoes: oldOrcamento.observacoes,
          motivoCancelamento: oldOrcamento.motivoCancelamento,
          prazoValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias a partir de hoje
          createdAt: oldOrcamento.createdAt,
          updatedAt: oldOrcamento.updatedAt,
        };

        return newOrcamento;
      }

      return orcamento;
    });

    // Se houve migração, salvar os dados migrados
    if (migrated) {
      localStorage.setItem('orcamentos', JSON.stringify(migratedOrcamentos));
      console.log('Orçamentos migrados com sucesso para a nova estrutura');
    }
  } catch (error) {
    console.error('Erro ao migrar orçamentos:', error);
  }
};