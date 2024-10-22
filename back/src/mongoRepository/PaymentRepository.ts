import { Payment } from "../models/PaymentModel";
import { MongoClient, ObjectId } from 'mongodb';
import * as conf from '../../config';

export interface IPaymentRepository {
    create(payment: Payment): Promise<Payment>;
    getById(paymentId: string): Promise<Payment | null>;
    getByOrderId(orderId: string): Promise<Payment | null>;
    update(payment: Payment): Promise<Payment | null>;
}

export class MongoPaymentRepository implements IPaymentRepository {
    private client: MongoClient;
    private dbName = "ppo";
    private paymentsCollection = 'payments';
    private positionsCollection = 'positions';
    private productsCollection = 'phones';

    constructor() {
        this.client = new MongoClient(conf.mongoUrl);
        this.initialize()
    }

    async initialize(): Promise<void> {
        await this.client.connect();
        console.log('Подключение к MongoDB установлено');

        const db = this.client.db(this.dbName);

        const collections = await db.listCollections({ name: this.paymentsCollection }).toArray();
        if (collections.length === 0) {
            await db.createCollection(this.paymentsCollection);
            console.log(`Коллекция "${this.paymentsCollection}" была создана.`);
        } else {
            console.log(`Коллекция "${this.paymentsCollection}" уже существует.`);
        }
    }

    async create(payment: Payment): Promise<Payment> {
        const db = this.client.db(this.dbName);
        const session = this.client.startSession();

        try {
            session.startTransaction();

            // Находим позиции товаров в заказе
            const positions = await db.collection(this.positionsCollection).find({ orderid: new ObjectId(payment.orderId) }).toArray();

            // Вычисляем общую сумму заказа
            const totalSum = (await Promise.all(
                positions.map(async (position) => {
                    const product = await db.collection(this.productsCollection).findOne({ _id: new ObjectId(position.productid) });
                    return position.products_amount * (product?.price || 0);
                })
            )).reduce((acc, price) => acc + price, 0);

            // Создаем платеж с полученной суммой
            const paymentDoc = {
                orderid: new ObjectId(payment.orderId),
                status: payment.status,
                sum: totalSum,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const result = await db.collection(this.paymentsCollection).insertOne(paymentDoc, { session });
            const createdPayment = result.insertedId;

            await session.commitTransaction();

            return new Payment(
                createdPayment.toString(),
                paymentDoc.orderid.toString(),
                paymentDoc.status,
                paymentDoc.sum
            );
        } catch (error) {
            await session.abortTransaction();
            console.error('Ошибка при создании платежа:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getById(paymentId: string): Promise<Payment | null> {
        const db = this.client.db(this.dbName);

        const payment = await db.collection(this.paymentsCollection).findOne({ _id: new ObjectId(paymentId) });

        if (!payment) return null;

        return new Payment(
            payment._id.toString(),
            payment.orderid.toString(),
            payment.status,
            payment.sum
        );
    }

    async getByOrderId(orderId: string): Promise<Payment | null> {
        const db = this.client.db(this.dbName);

        const payment = await db.collection(this.paymentsCollection).findOne({ orderid: new ObjectId(orderId) });

        if (!payment) return null;

        return new Payment(
            payment._id.toString(),
            payment.orderid.toString(),
            payment.status,
            payment.sum
        );
    }

    async update(payment: Payment): Promise<Payment | null> {
        const db = this.client.db(this.dbName);
        const session = this.client.startSession();

        try {
            session.startTransaction();

            const updateResult = await db.collection(this.paymentsCollection).findOneAndUpdate(
                { _id: new ObjectId(payment.id) },
                {
                    $set: {
                        orderid: new ObjectId(payment.orderId),
                        status: payment.status,
                        sum: payment.sum,
                        updated_at: new Date(),
                    }
                },
                { returnDocument: 'after', session }
            );

            if (updateResult == null) return null;
            if (!updateResult.value) return null;

            await session.commitTransaction();

            const updatedPayment = updateResult.value;

            return new Payment(
                updatedPayment._id.toString(),
                updatedPayment.orderid.toString(),
                updatedPayment.status,
                updatedPayment.sum
            );
        } catch (error) {
            await session.abortTransaction();
            console.error('Ошибка при обновлении платежа:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }
}
