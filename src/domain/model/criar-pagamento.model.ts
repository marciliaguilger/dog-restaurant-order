export class CriarPagamentoModel{
    public clienteId: string;
    public pedidoId: string;
    public valor: number;
    public tipoPagamento: string;

    constructor(clienteId: string, pedidoId: string, valor: number, tipoPagamento: string) {
      this.clienteId = clienteId
      this.pedidoId = pedidoId
      this.valor = valor
      this.tipoPagamento = tipoPagamento
    }
  }