import { IOrderRepository } from '../pgRepository/OrderRepository';
import { Order, OrderStatus, OrderPosition } from '../models/OrderModel';
import { orderCreateDTO, orderUpdatePositions, orderUpdateStatus, returnOrderDTO } from '../dto/OrderDTO';
import { NotFoundError } from '../errors/requestErrors';

export interface IOrderService {
    create(order: Order): Promise<returnOrderDTO>;
    findById(orderId: string): Promise<returnOrderDTO>;
    findByUserId(userid: string): Promise<returnOrderDTO[]>;
    updateOrderStatus(order: orderUpdateStatus): Promise<returnOrderDTO>;
    deleteOrder(id: string): Promise<boolean>;
}

export class OrderService implements IOrderService {
    constructor(private orderRepository: IOrderRepository) {}

    async create(order: Order): Promise<returnOrderDTO> {
        const orderCreated = await this.orderRepository.create(order);
        return Promise.resolve(orderCreated.toDTO());
    }

    async findById(orderId: string): Promise<returnOrderDTO> {
        const orderGetted = await this.orderRepository.getById(orderId);
        if (orderGetted == null){
            throw new NotFoundError("not found in db by id");
        }
        return Promise.resolve(orderGetted.toDTO());
    }

    async findByUserId(userid: string): Promise<returnOrderDTO[]> {
        const ordersGetted = await this.orderRepository.getByUserId(userid);
        if (ordersGetted.length == 0){
            throw new NotFoundError("not found in db by id");
        }
        const ordersToReturn: returnOrderDTO[] = [];
        for (let order of ordersGetted){
            ordersToReturn.push(order.toDTO());
        }
        return Promise.resolve(ordersToReturn);
    }

    async updateOrderStatus(order: orderUpdateStatus): Promise<returnOrderDTO> {
        const checkOrder = await this.orderRepository.getById(order.id);
        if (checkOrder == null){
            throw new NotFoundError("not found in db by id");
        }
        checkOrder.status = order.status;
        const orderUpdated = await this.orderRepository.updateStatus(checkOrder);

        return Promise.resolve(orderUpdated.toDTO());
    }

    async deleteOrder(id: string): Promise<boolean>{
        const checkOrder = await this.orderRepository.getById(id);
        if (checkOrder == null){
            throw new NotFoundError("not found in db by id");
        }

        await this.orderRepository.delete(checkOrder);
        return Promise.resolve(true);
    }
}

export { OrderPosition, Order, OrderStatus };
