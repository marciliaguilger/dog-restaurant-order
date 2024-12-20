import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PedidoStatus } from '../../domain/enum/order-status.enum';
import { IPedidoUseCase } from '../../domain/use-cases/pedido-use-case.interface';
import { CreatePedidoInput } from '../dtos/input/create-pedido.input';
import { UpdatePedidoInput } from '../dtos/input/update-pedido.input';
import { OrderMapper } from '../mapper/pedido.mapper';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pedidos')
@Controller('pedidos')
export class OrderController {
  constructor(
    @Inject(IPedidoUseCase)
    private readonly pedidoUseCase: IPedidoUseCase,
    private readonly orderMapper: OrderMapper,
  ) {}

  @Post()
  async createPedido(@Body() createPedidosInput: CreatePedidoInput) {
    console.log('Criando novo pedido');
    try{
      const combos = await this.orderMapper.mapToComboList(
        createPedidosInput.combos,
      );
  
      return {
        pedidoId: await this.pedidoUseCase.createPedido(
          createPedidosInput.documento,
          combos,
        ),
      };
    }catch (err) {
      console.error('Error creating pedido:', err);
      return {'error': 'Error creating pedido'};
    }
  }

  @Put(':pedidoId/status')
  async updatePedidoStatus(
    @Param('pedidoId') pedidoId: string,
    @Body() updatePedidos: UpdatePedidoInput,
  ) {
    if (!updatePedidos.status) {
      throw new Error('Invalid order status');
    }
    try{
      await this.pedidoUseCase.updatePedidoStatus(pedidoId, updatePedidos.status);
      return { message: 'Pedidos status updated successfully' };
    }
    catch(error){
      return error.message;
    }
  }

  @Put(':pedidoId/checkout')
  async checkoutPedido(@Param('pedidoId') pedidoId: string) {
    const qrCode = await this.pedidoUseCase.payPedido(pedidoId);
    return { qrCode: qrCode };
  }

  @Get()
  async getAllPedidos() {
    const pedidos = await this.pedidoUseCase.getAllPedidos();
    return pedidos.map((order) => this.orderMapper.mapToOrderDto(order));
  }

  @Get(':pedidoId')
  async getPedidoById(@Param('pedidoId') pedidoId: string) {
    const order = await this.pedidoUseCase.getPedidoById(pedidoId);
    return this.orderMapper.mapToOrderDto(order);
  }

  @Get('status/:status')
  async getPedidosByStatus(@Param('status') status: PedidoStatus) {
    try{
      const pedidos = await this.pedidoUseCase.getPedidosByStatus(status);
      return pedidos.map((order) => this.orderMapper.mapToOrderDto(order));
    }catch(error){
      return error.message || error
    }
  }
}
