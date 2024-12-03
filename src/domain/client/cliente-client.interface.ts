import { Cliente } from "../model/cliente.model";

export interface IClienteClient {
  getCliente(clientId: string): Promise<Cliente>;
}

export const IClienteClient = Symbol('IClienteClient');