import { IOrderRepository } from '../pgRepository/OrderRepository';
import { Order, OrderStatus, OrderPosition } from '../models/OrderModel';
import { orderCreateDTO, orderUpdatePositions, orderUpdateStatus, returnOrderDTO } from '../dto/OrderDTO';
import { NotFoundError } from '../errors/requestErrors';

export interface IOrderService {
    create(order: Order): Promise<Order>;
    findById(orderId: string): Promise<Order>;
    findByUserId(userid: string): Promise<Order[]>;
    updateOrderStatus(order: orderUpdateStatus): Promise<Order>;
    addPositionsToOrder(order: orderUpdatePositions): Promise<returnOrderDTO | Error>;
    removePositionsFromOrder(order: orderUpdatePositions): Promise<returnOrderDTO | Error>;
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

    async addPositionsToOrder(order: orderUpdatePositions): Promise<returnOrderDTO | Error> {
        const checkOrder = await this.orderRepository.getById(order.id);
        if (checkOrder == null){
            return Promise.reject(new Error("not found in db by id"));
        }
        //Чтобы одинаковые позиции не попадали в order
        let filteredPositions = order.positions.filter(function(pos) {
            for (let dbPos of checkOrder.positions){
                if (dbPos.productId == pos.productId && dbPos.productsAmount == pos.productsAmount){
                    return false;
                }
            }
            return true;
        })
        for (let pos of filteredPositions){
            checkOrder.positions.push(new OrderPosition("", "", pos.productId, pos.productsAmount));
        }
        
        const orderUpdated =  await this.orderRepository.update(checkOrder);
        if (orderUpdated == null){
            return Promise.reject(new Error("order found, but error occured"));
        }
        return orderUpdated.toDTO();
    }

    async removePositionsFromOrder(order: orderUpdatePositions): Promise<returnOrderDTO | Error> {
        const checkOrder = await this.orderRepository.getById(order.id);
        if (checkOrder == null){
            return Promise.reject(new Error("not found in db by id"));
        }
        checkOrder.positions = checkOrder.positions.filter(function(pos) {
            for (let delPos of order.positions){
                if (delPos.productId == pos.productId && delPos.productsAmount == pos.productsAmount){
                    return false;
                }
            }
            return true;
        })

        const orderUpdated =  await this.orderRepository.update(checkOrder);
        if (orderUpdated == null){
            return Promise.reject(new Error("order found, but error occured"));
        }
        return orderUpdated.toDTO();
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
