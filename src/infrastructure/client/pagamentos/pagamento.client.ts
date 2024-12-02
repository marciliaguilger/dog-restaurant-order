import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { IPagamentoClient } from 'src/domain/client/pagamento-client.interface';
import { CriarPagamentoModel } from 'src/domain/model/criar-pagamento.model';

@Injectable()
export class PagamentoClient implements IPagamentoClient {
  constructor(private readonly httpService: HttpService) {}
  async createPagamento(pagamentoModel: CriarPagamentoModel): Promise<string> {
    const url = `/pagamentos`;
    const { data } = await firstValueFrom(
      this.httpService.post<string>(url, pagamentoModel).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(error.response.data, error.response.status);
        }),
      ),
    );

    return data;
  }
}