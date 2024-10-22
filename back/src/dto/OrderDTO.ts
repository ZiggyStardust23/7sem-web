type orderCreateDTO = {
    userid: string,
    address: string,
    positions: orderPositionDTO[],
}

type orderUpdateStatus = {
    id: string,
    status: OrderStatus
}

type orderUpdatePositions = {
    id: string,
    positions: orderPositionDTO[]
}

type orderPositionDTO = {
    productId: string;
    productsAmount: number;
}

type returnOrderPositionDTO = {
    id: string;
    orderId: string;
    productId: string;
    productsAmount: number;    
}

enum OrderStatus {
    PLACED,
    PROCESSING,
    COMPLETED,
    CANCELLED
}

type returnOrderDTO = {
    id: string,
    userid: string,
    status: OrderStatus,
    address: string,
    date: Date,
    positions: returnOrderPositionDTO[],
}

export {orderCreateDTO, orderUpdatePositions, orderUpdateStatus, orderPositionDTO, returnOrderDTO, returnOrderPositionDTO, OrderStatus}