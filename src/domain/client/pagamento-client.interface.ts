import { CriarPagamentoModel } from "../model/criar-pagamento.model";

export interface IPagamentoClient {
  createPagamento(pagamentoModel: CriarPagamentoModel): Promise<string>
}

export const IPagamentoClient = Symbol('IPagamentoClient');