import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PagamentoClient } from './pagamento.client';
import { IPagamentoClient } from 'src/domain/client/pagamento-client.interface';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('TIMEOUT'),
        maxRedirects: configService.get('MAX_REDIRECTS'),
        baseURL: configService.get('PAGAMENTOS_API_URL'),
        headers: {
          'X-Requester-Token': configService.get('REQUESTER_TOKEN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PagamentoClient,
    {
      provide: IPagamentoClient,
      useClass: PagamentoClient,
    },
  ],
  exports: [IPagamentoClient],
})
export class PagamentoModule {}
