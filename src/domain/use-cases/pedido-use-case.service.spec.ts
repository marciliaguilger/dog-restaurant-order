import { TestingModule, Test } from '@nestjs/testing';
import { Pedido } from '../entities/pedido.entity';
import { IPedidoRepository } from '../repositories/order-repository.interface';
import { PedidoUseCase } from './pedido-use-case.service';
import { PedidoStatus } from '../enum/order-status.enum';
import { IPagamentoClient } from '../client/pagamento-client.interface';

describe('PedidoUseCase', () => {
  let service: PedidoUseCase;
  let mockPedidoRepository: Partial<IPedidoRepository>;
  let mockPagamentoClient: Partial<IPagamentoClient>;

  beforeEach(async () => {
    mockPedidoRepository = {
      getAllPedidos: jest.fn().mockResolvedValue([
        {
          ...new Pedido('1'),
          status: PedidoStatus.CONFIRMED,
          criado: new Date(),
        },
        {
          ...new Pedido('2'),
          status: PedidoStatus.PREPARING,
          criado: new Date(),
        },
      ]),
      getPedidoById: jest
        .fn()
        .mockImplementation((id: string) => Promise.resolve(new Pedido(id))),
      getPedidosByStatus: jest
        .fn()
        .mockResolvedValue([
          { ...new Pedido('1'), status: PedidoStatus.CONFIRMED },
        ]),
      updatePedido: jest.fn(),
      createPedido: jest
        .fn()
        .mockImplementation((pedido: Pedido) =>
          Promise.resolve(pedido.pedidoId),
        ),
    };

    mockPagamentoClient = {
      createPagamento: jest.fn().mockResolvedValue('pagamento-id'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoUseCase,
        { provide: IPedidoRepository, useValue: mockPedidoRepository },
        { provide: IPagamentoClient, useValue: mockPagamentoClient }
      ],
    }).compile();

    service = module.get<PedidoUseCase>(PedidoUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getAllPedidos should return filtered and sorted array of pedidos', async () => {
    const result = await service.getAllPedidos();
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe(PedidoStatus.PREPARING);
    expect(mockPedidoRepository.getAllPedidos).toHaveBeenCalled();
  });

  it('getPedidoById should throw if pedido does not exist', async () => {
    jest
      .spyOn(mockPedidoRepository, 'getPedidoById')
      .mockResolvedValueOnce(undefined);
    await expect(service.getPedidoById('3')).rejects.toThrow(
      'Pedido with ID 3 not found.',
    );
  });

  it('getPedidoById should return order when exist', async () => {
    const pedido: Pedido = 
      Pedido.buildOrder(
        '1',
        'short1',
        new Date(),
        new Date(),
        new Date(),
        PedidoStatus.CONFIRMED,
        100,
        'customer1',
      );

    jest
      .spyOn(mockPedidoRepository, 'getPedidoById')
      .mockResolvedValueOnce(pedido);

      const result = await service.getPedidoById('1');
      expect(mockPedidoRepository.getPedidoById).toHaveBeenCalled();
  });

  it('createPedido should return pedidoId after creation', async () => {
    const combos = [];
    const result = await service.createPedido('customer1', combos);
    expect(result).toBeDefined();
    expect(mockPedidoRepository.createPedido).toHaveBeenCalled();
  });

  it('getPedidosByStatus should return pedidos filtered by status', async () => {
    const result = await service.getPedidosByStatus(PedidoStatus.CONFIRMED);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(PedidoStatus.CONFIRMED);
    expect(mockPedidoRepository.getPedidosByStatus).toHaveBeenCalledWith(PedidoStatus.CONFIRMED);
  });

  it('updatePedidoStatus should update order status', async () => {
    const pedido: Pedido = 
      Pedido.buildOrder(
        '1',
        'short1',
        new Date(),
        new Date(),
        new Date(),
        PedidoStatus.CONFIRMED,
        100,
        'customer1',
      );

    jest
    .spyOn(mockPedidoRepository, 'getPedidoById')
    .mockResolvedValueOnce(pedido);

    const orderId = '1';
    const newStatus = PedidoStatus.PREPARING;
  
    const order = new Pedido(orderId);
    order.createOrder()
    order.confirmOrder('some-pagamento-id');
  
    await service.updatePedidoStatus(orderId, newStatus);
  
    expect(order.status).toBe(PedidoStatus.CONFIRMED);
    expect(mockPedidoRepository.updatePedido).toHaveBeenCalled();
  });

  it('updatePedidoStatus should update order status to confirm', async () => {
    const pedido: Pedido = 
      Pedido.buildOrder(
        '1',
        'short1',
        new Date(),
        new Date(),
        new Date(),
        PedidoStatus.CREATED,
        100,
        'customer1',
      );

    jest
    .spyOn(mockPedidoRepository, 'getPedidoById')
    .mockResolvedValueOnce(pedido);

    const orderId = '1';
    const newStatus = PedidoStatus.CONFIRMED;
  
    await service.updatePedidoStatus(orderId, newStatus);
      expect(mockPedidoRepository.updatePedido).toHaveBeenCalled();
  });
});
