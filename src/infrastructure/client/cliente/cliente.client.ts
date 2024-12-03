import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { IClienteClient } from 'src/domain/client/cliente-client.interface';
import { Cliente } from 'src/domain/model/cliente.model';

@Injectable()
export class ClienteClient implements IClienteClient {
  constructor(private readonly httpService: HttpService) {}
  async getCliente(clientId: string): Promise<Cliente> {
    const url = `/clientes/${clientId}`;
    try{
      const { data } = await firstValueFrom(
        this.httpService.get<Cliente>(url).pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(error.response.data, error.response.status);
          }),
        ),
      );
      return data;
    }catch(err){
      console.log(err)
      return undefined;
    }
    
  }
}
