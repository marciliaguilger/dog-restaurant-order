import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IClienteClient } from 'src/domain/client/cliente-client.interface';
import { ClienteClient } from './cliente.client';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('TIMEOUT'),
        maxRedirects: configService.get('MAX_REDIRECTS'),
        baseURL: configService.get('CLIENTES_API_URL'),
        headers: {
          'X-Requester-Token': configService.get('REQUESTER_TOKEN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    ClienteClient,
    {
      provide: IClienteClient,
      useClass: ClienteClient,
    },
  ],
  exports: [IClienteClient],
})
export class ClienteModule {}
