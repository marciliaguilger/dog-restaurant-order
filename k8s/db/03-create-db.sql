USE DogOrder

CREATE TABLE PedidosCombos(
    PedidoId varchar(40) NOT NULL,
    ComboId varchar(40) NOT NULL,
    ProdutoId varchar(40) NOT NULL,
    CategoriaId varchar(40) NOT NULL,
    PrecoCentavos DECIMAL NOT NULL,
    CONSTRAINT PK_PedidoCombo PRIMARY KEY (PedidoId, ComboId, ProdutoId),
    CONSTRAINT FK_Pedido_PedidoCombo FOREIGN KEY (PedidoId) REFERENCES Pedidos(PedidoId)
)
