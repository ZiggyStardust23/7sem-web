import { IOrderRepository } from '../pgRepository/OrderRepository';
import { Order, OrderStatus, OrderPosition } from '../models/OrderModel';
import { orderCreateDTO, orderUpdatePositions, orderUpdateStatus, returnOrderDTO } from '../dto/OrderDTO';
import { NotFoundError } from '../errors/requestErrors';

export interface IOrderService {
    create(order: Order): Promise<Order>;
    findById(orderId: string): Promise<Order>;
    findByUserId(userid: string): Promise<Order[]>;
    updateOrderStatus(order: orderUpdateStatus): Promise<Order>;
    deleteOrder(id: string): Promise<boolean>;
}

export class OrderService implements IOrderService {
    constructor(private orderRepository: IOrderRepository) {}

    async create(order: Order): Promise<Order> {
        const orderCreated = await this.orderRepository.create(order);
        return Promise.resolve(orderCreated);
    }

    async findById(orderId: string): Promise<Order> {
        const orderGetted = await this.orderRepository.getById(orderId);
        if (orderGetted == null){
            throw new NotFoundError("not found in db by id");
        }
        return Promise.resolve(orderGetted);
    }

    async findByUserId(userid: string): Promise<Order[]> {
        const ordersGetted = await this.orderRepository.getByUserId(userid);
        if (ordersGetted.length == 0){
            throw new NotFoundError("not found in db by id");
        }
        return Promise.resolve(ordersGetted);
    }

    async updateOrderStatus(order: orderUpdateStatus): Promise<Order> {
        const checkOrder = await this.orderRepository.getById(order.id);
        if (checkOrder == null){
            throw new NotFoundError("not found in db by id");
        }
        checkOrder.status = order.status;
        const orderUpdated = await this.orderRepository.updateStatus(checkOrder);

        return Promise.resolve(orderUpdated);
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
