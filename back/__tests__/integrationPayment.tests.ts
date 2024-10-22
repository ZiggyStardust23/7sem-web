import { PostgresPaymentRepository } from '../src/pgRepository/PaymentRepository';
import { PaymentService } from '../src/services/PaymentService';
import { Payment } from '../src/models/PaymentModel';
import { OrderStatus } from '../src/models/OrderModel';
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env
dotenv.config();

// Создаем экземпляр репозитория
const paymentRepository = new PostgresPaymentRepository();
const paymentService = new PaymentService(paymentRepository);

describe('Payment Service Tests', () => {
    let testOrderId: string;

    test('createPayment - создание платежа', async () => {
        await paymentRepository.initialize();
        await paymentService.create('6')
        .then((newPayment) => {
            if (newPayment instanceof Error){
                throw(newPayment);
                }
                expect(newPayment).toBeDefined();
                expect(newPayment.id).toBeDefined();
                expect(newPayment.orderId).toBe('2');
                expect(newPayment.status).toBe(true);
                testOrderId = newPayment.orderId;
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('getPaymentById - получение платежа по ID', async () => {
        await paymentService.findById('6')
        .then((fetchedPayment) => {
            if (fetchedPayment instanceof Error){
                throw(fetchedPayment);
                }
                expect(fetchedPayment).toBeDefined();
                expect(fetchedPayment?.id).toBe(2);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('updatePayment - обновление платежа', async () => {
        const updatedPayment = await paymentService.update({
            id: testOrderId,
            orderId: '6',
            status: false, // Предположим, что статус платежа был изменен на COMPLETED
            sum: 6000 // Предположим, что сумма платежа увеличилась до 6000
        }).then((updatedPayment) => {
            if (updatedPayment instanceof Error){
                throw(updatedPayment);
                }
                expect(updatedPayment).toBeDefined();
                expect(updatedPayment?.id).toBe(testOrderId);
                expect(updatedPayment?.orderId).toBe('2');
                expect(updatedPayment?.status).toBe(false);
                expect(updatedPayment?.sum).toBe(6000);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('getPaymentByOrderId - получение платежа по ID заказа', async () => {
        await paymentService.findByOrderId('6')
        .then((paymentByOrderId) => {
            if (paymentByOrderId instanceof Error){
                throw(paymentByOrderId);
                }
                expect(paymentByOrderId).toBeDefined();
                expect(paymentByOrderId?.orderId).toBe(2);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });
});
