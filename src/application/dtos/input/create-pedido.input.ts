export class CreatePedidoInput {
  documento: string;
  combos: ComboInput[];
}

export class ComboInput {
  lancheId?: string;
  sobremesaId?: string;
  bebidaId?: string;
  acompanhamentoId?: string;
}
