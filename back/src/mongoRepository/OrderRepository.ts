import { Order, OrderPosition } from '../models/OrderModel';
import { OrderStatus } from '../models/OrderModel';
import { MongoClient, ObjectId } from 'mongodb';
import * as conf from '../../config';

export interface IOrderRepository {
    create(order: Order): Promise<Order>;
    getById(orderId: string): Promise<Order | null>;
    getByUserId(userid: string): Promise<Order[]>;
    update(order: Order): Promise<Order | null>;
}

export class MongoOrderRepository implements IOrderRepository {
    private client: MongoClient;
    private dbName = "ppo";
    private ordersCollection = 'orders';
    private positionsCollection = 'positions';

    constructor() {
        this.client = new MongoClient(conf.mongoUrl);
        this.initialize();
    }

    async initialize(): Promise<void> {
        await this.client.connect();
        console.log('Подключение к MongoDB установлено');
        await this.ensureCollections();
    }

    async ensureCollections(): Promise<void> {
        const db = this.client.db(this.dbName);

        // Проверяем, существует ли коллекция orders
        const collections = await db.listCollections({ name: this.ordersCollection }).toArray();
        if (collections.length === 0) {
            await db.createCollection(this.ordersCollection);
            console.log('Коллекция заказов создана');
        } else {
            console.log('Коллекция заказов уже существует');
        }

        // Проверяем, существует ли коллекция positions
        const positionCollections = await db.listCollections({ name: this.positionsCollection }).toArray();
        if (positionCollections.length === 0) {
            await db.createCollection(this.positionsCollection);
            console.log('Коллекция позиций создана');
        } else {
            console.log('Коллекция позиций уже существует');
        }

        // Создаем индексы для повышения производительности запросов
        await db.collection(this.ordersCollection).createIndex({ userid: 1 });
        await db.collection(this.positionsCollection).createIndex({ orderid: 1 });
        console.log('Индексы созданы');
    }

    async create(order: Order): Promise<Order> {
        const db = this.client.db(this.dbName);

        try {
            const orderDoc = {
                userid: new ObjectId(order.userid),
                status: order.status,
                address: order.address,
                date: order.date,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const result = await db.collection(this.ordersCollection).insertOne(orderDoc);
            const orderId = result.insertedId;

            const positionDocs = order.positions.map(pos => ({
                orderid: orderId,
                productid: new ObjectId(pos.productId),
                products_amount: pos.productsAmount,
            }));

            if (positionDocs.length > 0) {
                await db.collection(this.positionsCollection).insertMany(positionDocs);
            }

            return new Order(
                orderId.toString(),
                orderDoc.userid.toString(),
                orderDoc.status,
                orderDoc.address,
                orderDoc.date,
                order.positions.map(pos => new OrderPosition(
                    pos.id, // Предполагаем, что id позиций присваиваются клиентом
                    orderId.toString(),
                    pos.productId,
                    pos.productsAmount
                ))
            );
        } catch (error) {
            console.error('Ошибка при создании заказа:', error);
            throw error;
        }
    }

    async getById(orderId: string): Promise<Order | null> {
        const db = this.client.db(this.dbName);

        const order = await db.collection(this.ordersCollection).findOne({ _id: new ObjectId(orderId) });
        if (!order) return null;

        const positions = await db.collection(this.positionsCollection)
            .find({ orderid: new ObjectId(orderId) })
            .toArray();

        return new Order(
            order._id.toString(),
            order.userid.toString(),
            order.status as OrderStatus,
            order.address,
            order.date,
            positions.map((pos: any) => new OrderPosition(
                pos._id.toString(),
                pos.orderid.toString(),
                pos.productid.toString(),
                pos.products_amount
            ))
        );
    }

    async getByUserId(userid: string): Promise<Order[]> {
        const db = this.client.db(this.dbName);

        const orders = await db.collection(this.ordersCollection).find({ userid: new ObjectId(userid) }).toArray();

        return Promise.all(orders.map(async (order) => {
            const positions = await db.collection(this.positionsCollection)
                .find({ orderid: order._id })
                .toArray();

            return new Order(
                order._id.toString(),
                order.userid.toString(),
                order.status as OrderStatus,
                order.address,
                order.date,
                positions.map((pos: any) => new OrderPosition(
                    pos._id.toString(),
                    pos.orderid.toString(),
                    pos.productid.toString(),
                    pos.products_amount
                ))
            );
        }));
    }

    async update(order: Order): Promise<Order | null> {
        const db = this.client.db(this.dbName);

        try {
            const updateResult = await db.collection(this.ordersCollection).findOneAndUpdate(
                { _id: new ObjectId(order.id) },
                {
                    $set: {
                        userid: new ObjectId(order.userid),
                        status: order.status,
                        address: order.address,
                        date: order.date,
                        updated_at: new Date(),
                    }
                },
                { returnDocument: 'after' }
            );
            
            if (updateResult == null) return null;
            if (!updateResult.value) return null;

            await db.collection(this.positionsCollection).deleteMany({ orderid: new ObjectId(order.id) });

            const positionDocs = order.positions.map(pos => ({
                orderid: new ObjectId(order.id),
                productid: new ObjectId(pos.productId),
                products_amount: pos.productsAmount,
            }));

            if (positionDocs.length > 0) {
                await db.collection(this.positionsCollection).insertMany(positionDocs);
            }

            return new Order(
                updateResult.value._id.toString(),
                updateResult.value.userid.toString(),
                updateResult.value.status as OrderStatus,
                updateResult.value.address,
                updateResult.value.date,
                order.positions.map(pos => new OrderPosition(
                    pos.id, // Предполагаем, что id позиций присваиваются клиентом
                    updateResult.value._id.toString(),
                    pos.productId,
                    pos.productsAmount
                ))
            );
        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error);
            throw error;
        }
    }
}
