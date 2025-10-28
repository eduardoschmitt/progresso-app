export interface Insignia {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  iconeUrl?: string | null;
  regra?: string | null;
  ativo?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  desbloqueada?: boolean;
  conquistadaEm?: string | null;
}