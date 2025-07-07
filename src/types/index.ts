export type StatusItem = 'disponivel' | 'em-uso' | 'manutencao' | 'indisponivel';

export interface Localidade {
  id: string;
  nome: string;
  descricao?: string;
  createdAt: Date;
}

export interface Unidade {
  id: string;
  nome: string;
  descricao?: string;
  localidadeId: string;
  createdAt: Date;
}

export interface Item {
  id: string;
  nome: string;
  descricao?: string;
  status: StatusItem;
  unidadeId: string;
  localidadeId: string;
  imagem?: string;
  icone?: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventarioReport {
  totalItens: number;
  itensPorStatus: Record<StatusItem, number>;
  itensPorLocalidade: Record<string, number>;
  itensPorUnidade: Record<string, number>;
}