import { Test, TestingModule } from '@nestjs/testing';
import { IPedidoUseCase } from '../../domain/use-cases/pedido-use-case.interface';
import { OrderMapper } from '../mapper/pedido.mapper';
import { ComboInput, CreatePedidoInput } from '../dtos/input/create-pedido.input';
import { UpdatePedidoInput } from '../dtos/input/update-pedido.input';
import { PedidoStatus } from '../../domain/enum/order-status.enum';
import { OrderController } from './pedido.controller';
import { Pedido } from '../../domain/entities/pedido.entity';
import { Combo } from '../../domain/entities/combo.entity';
import { GetPedidoOutput } from '../dtos/output/get-pedido.output';

describe('OrderController', () => {
  let controller: OrderController;
  let pedidoUseCase: jest.Mocked<IPedidoUseCase>;
  let orderMapper: jest.Mocked<OrderMapper>;

  const mockPedidoUseCase = {
    createPedido: jest.fn(),
    updatePedidoStatus: jest.fn(),
    payPedido: jest.fn(),
    getAllPedidos: jest.fn(),
    getPedidoById: jest.fn(),
    getPedidosByStatus: jest.fn(),
  };

  const mockOrderMapper = {
    mapToComboList: jest.fn(),
    mapToOrderDto: jest.fn(),
  };

  const defaultPedido = (status: PedidoStatus) =>
    Pedido.buildOrder('1', 'short1', new Date(), new Date(), new Date(), status, 100, '123');

  const defaultMappedPedido = (status: string) => ({
    pedidoId: '1',
    clienteId: '123',
    clienteNome: 'John Doe',
    criado: new Date('2024-01-01T10:00:00Z'),
    status,
    combos: [
      {
        comboId: 'combo1',
        items: [
          { produtoId: 'prod1', categoria: 'Beverage', preco: 5.0 },
          { produtoId: 'prod2', categoria: 'Snack', preco: 10.0 },
        ],
        comboValor: 15.0,
      },
    ],
    totalValor: 35.0,
    descontoValor: 5.0,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: IPedidoUseCase, useValue: mockPedidoUseCase },
        { provide: OrderMapper, useValue: mockOrderMapper },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    pedidoUseCase = module.get<IPedidoUseCase>(IPedidoUseCase) as jest.Mocked<IPedidoUseCase>;
    orderMapper = module.get<OrderMapper>(OrderMapper) as jest.Mocked<OrderMapper>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPedido', () => {
    it('should create a new pedido', async () => {
      const combo = new Combo('comboId');
      combo.addItem('Lanche', '1', 10);
      const comboInput: ComboInput = { lancheId: '1' };
      const input: CreatePedidoInput = { documento: '123', combos: [comboInput] };
      orderMapper.mapToComboList.mockResolvedValue([combo]);
      pedidoUseCase.createPedido.mockResolvedValue('pedido-id');

      const result = await controller.createPedido(input);

      expect(orderMapper.mapToComboList).toHaveBeenCalledWith(input.combos);
      expect(pedidoUseCase.createPedido).toHaveBeenCalledWith(input.documento, [combo]);
      expect(result).toEqual({ pedidoId: 'pedido-id' });
    });

    it('should handle errors during pedido creation', async () => {
      const input: CreatePedidoInput = { documento: '123', combos: [] };
      orderMapper.mapToComboList.mockRejectedValue(new Error('Mapping error'));

      const result = await controller.createPedido(input);

      expect(result).toEqual({ error: 'Error creating pedido' });
    });
  });

  describe('updatePedidoStatus', () => {
    it('should update pedido status', async () => {
      const input: UpdatePedidoInput = { status: PedidoStatus.DELIVERED };
      const pedidoId = 'pedido-id';

      await controller.updatePedidoStatus(pedidoId, input);

      expect(pedidoUseCase.updatePedidoStatus).toHaveBeenCalledWith(pedidoId, PedidoStatus.DELIVERED);
    });

    it('should throw an error if status is missing', async () => {
      const input: UpdatePedidoInput = { status: null };
      const pedidoId = 'pedido-id';

      await expect(controller.updatePedidoStatus(pedidoId, input)).rejects.toThrow('Invalid order status');
    });
  });

  describe('checkoutPedido', () => {
    it('should generate a QR code for the pedido', async () => {
      const pedidoId = 'pedido-id';
      pedidoUseCase.payPedido.mockResolvedValue('qr-code-data');

      const result = await controller.checkoutPedido(pedidoId);

      expect(pedidoUseCase.payPedido).toHaveBeenCalledWith(pedidoId);
      expect(result).toEqual({ qrCode: 'qr-code-data' });
    });
  });

  describe('getAllPedidos', () => {
    it('should return a list of all pedidos', async () => {
      const pedidos = [defaultPedido(PedidoStatus.CONFIRMED)];
      const mappedPedidos = [
        defaultMappedPedido('CONFIRMED')
      ];

      pedidoUseCase.getAllPedidos.mockResolvedValue(pedidos);
      orderMapper.mapToOrderDto.mockImplementation((pedido) => {
        const mapped = mappedPedidos.find((output) => output.pedidoId === pedido.pedidoId);
        if (!mapped) throw new Error('Pedido not found');
        return mapped;
      });

      const result = await controller.getAllPedidos();

      expect(pedidoUseCase.getAllPedidos).toHaveBeenCalled();
      expect(orderMapper.mapToOrderDto).toHaveBeenCalledTimes(pedidos.length);
      expect(result).toEqual(mappedPedidos);
    });

    it('should handle empty pedidos list', async () => {
      pedidoUseCase.getAllPedidos.mockResolvedValue([]);

      const result = await controller.getAllPedidos();

      expect(result).toEqual([]);
    });
  });

  describe('getPedidoById', () => {
    it('should return a single pedido by ID', async () => {
      const pedido = defaultPedido(PedidoStatus.CONFIRMED);
      const mappedPedido = defaultMappedPedido('DELIVERED');
      
      pedidoUseCase.getPedidoById.mockResolvedValue(pedido);
      orderMapper.mapToOrderDto.mockReturnValue(mappedPedido);

      const result = await controller.getPedidoById('1');

      expect(pedidoUseCase.getPedidoById).toHaveBeenCalledWith('1');
      expect(orderMapper.mapToOrderDto).toHaveBeenCalledWith(pedido);
      expect(result).toEqual(mappedPedido);
    });
  });

  describe('getPedidosByStatus', () => {
    it('should return pedidos filtered by status', async () => {
      const pedidos = [defaultPedido(PedidoStatus.CONFIRMED), defaultPedido(PedidoStatus.PREPARING)];
      const mappedPedidos = [defaultMappedPedido('CONFIRMED')];

      pedidoUseCase.getPedidosByStatus.mockResolvedValue(
        pedidos.filter(pedido => pedido.status === PedidoStatus.CONFIRMED),
      );

      orderMapper.mapToOrderDto.mockImplementation((pedido) => {
        const mapped = mappedPedidos.find((output) => output.pedidoId === pedido.pedidoId);
        if (!mapped) throw new Error('Pedido not found');
        return mapped;
      });

      const result = await controller.getPedidosByStatus(PedidoStatus.CONFIRMED);

      expect(pedidoUseCase.getPedidosByStatus).toHaveBeenCalledWith(PedidoStatus.CONFIRMED);
      expect(result).toEqual([mappedPedidos[0]]);
    });
  });
});
