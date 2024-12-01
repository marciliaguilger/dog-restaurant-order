USE DogOrder

CREATE TABLE Pedidos(
    PedidoId varchar(40) NOT NULL,
    ShortId varchar(10) NOT NULL,
    Criado DATETIME NOT NULL,
    PreparacaoIniciada DATETIME NULL,
    PreparacaoConcluida DATETIME NULL,
    Entregue DATETIME NULL,
    Cancelado DATETIME NULL,
    PedidoStatus VARCHAR(25) NOT NULL,
    ClienteId VARCHAR(40) NULL,
    TotalValorCentavos DECIMAL NOT NULL,
    DescontoValorCentavos DECIMAL NULL,
    CONSTRAINT PK_Pedido PRIMARY KEY (PedidoId)
)