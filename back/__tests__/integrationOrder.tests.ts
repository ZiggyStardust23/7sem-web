import { PostgresOrderRepository } from '../src/pgRepository/OrderRepository';
import { OrderService, Order, OrderStatus, OrderPosition } from '../src/services/OrderService';
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env
dotenv.config();

// Создаем экземпляр репозитория
const orderRepository = new PostgresOrderRepository();
const orderService = new OrderService(orderRepository);

describe('Order Repository Tests', () => {
    let testOrderId: string;
    let posId: string;

    test('createOrder - создание заказа', async () => {
        await orderRepository.initialize();
        const newOrder = new Order(
            '',
            '2',
            OrderStatus.PLACED,
            'some_address_here',
            new Date(),
            []
        );
        await orderService.create({
            userid: '2',
            address: 'some_address_here',
            positions: []
        }).then((createdOrder) => {
            if (createdOrder instanceof Error){
                throw(createdOrder);
                }
                expect(createdOrder).toBeDefined();
                expect(createdOrder.id).toBeDefined();
                expect(createdOrder.userid).toBe(newOrder.userid);
                expect(createdOrder.status).toBe(newOrder.status);
                expect(createdOrder.address).toBe(newOrder.address);
                expect(createdOrder.date).toBeDefined(); // Так как дата автоматически генерируется
                expect(createdOrder.positions).toEqual(newOrder.positions);
                testOrderId = createdOrder!.id;
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('findOrderById - получение заказа по ID', async () => {
        await orderService.findById(testOrderId)
        .then((fetchedOrder) => {
            if (fetchedOrder instanceof Error){
                throw(fetchedOrder);
                }
                expect(fetchedOrder).toBeDefined();
                expect(fetchedOrder?.id).toBe(testOrderId);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('findByUserId - получение заказов по ID пользователя', async () => {
        await orderService.findByUserId('2')
        .then((fetchedOrders) => {
            if (fetchedOrders instanceof Error){
                throw(fetchedOrders);
                }
                expect(fetchedOrders).toBeDefined();
                expect(fetchedOrders.length).toBeGreaterThan(0);
                expect(fetchedOrders.every(order => order.userid == '2')).toBeTruthy();
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('updateOrderStatus - обновление статуса заказа', async () => {
        await orderService.updateOrderStatus({
            id: testOrderId,
            status: OrderStatus.COMPLETED
        })
        .then((updatedOrder) => {
            if (updatedOrder instanceof Error){
                throw(updatedOrder);
                }
                expect(updatedOrder).toBeDefined();
                expect(updatedOrder?.id).toBe(testOrderId);
                expect(updatedOrder?.status).toBe(OrderStatus.COMPLETED);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('addPositionsToOrder - добавление позиций в заказ', async () => {
        const position: OrderPosition = new OrderPosition(
            '',
            testOrderId,
            '2',
            2
        );
        await orderService.addPositionsToOrder({
            id: testOrderId,
            positions: [{productId: '2', productsAmount: 2}, {productId: '1', productsAmount: 2}]
        }).then((updatedOrder) => {
            if (updatedOrder instanceof Error){
                throw(updatedOrder);
                }
                posId = updatedOrder.positions[0].id || '';
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('removePositionsFromOrder - удаление позиций из заказа', async () => {
        await orderService.removePositionsFromOrder({
        id: testOrderId,
        positions: [{productId: '1', productsAmount: 2}]})
        .then((updatedOrder) => {
            if (updatedOrder instanceof Error){
                throw(updatedOrder);
                }
                console.log(posId);
                console.log(updatedOrder);
                expect(updatedOrder).toBeDefined();
                expect(updatedOrder?.id).toBe(testOrderId);
                expect(updatedOrder?.positions.length).toBe(1);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });
});
