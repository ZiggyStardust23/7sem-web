import { Basket, BasketPosition } from '../models/BasketModel';
import { MongoClient, ObjectId } from 'mongodb';

import * as conf from '../../config';

export interface IBasketRepository {
    create(userid: string): Promise<Basket>;
    getByuserid(userid: string): Promise<Basket | null>;
    getById(basketId: string): Promise<Basket | null>;
    clearBasket(basketId: string): Promise<boolean>;
    calculateTotalPrice(basketId: string): Promise<number>;
    update(basket: Basket): Promise<Basket>;
}

export class MongoBasketRepository implements IBasketRepository {
    private client: MongoClient;
    private dbName = "ppo";
    private basketsCollection = 'baskets';
    private basketPositionsCollection = 'basketpositions';

    constructor() {
        this.client = new MongoClient(conf.mongoUrl);
        this.initialize();
    }

    async initialize(): Promise<void> {
        await this.client.connect();
        console.log('Подключение к MongoDB установлено');

        const db = this.client.db(this.dbName);

        // Проверяем и создаем коллекции, если они не существуют
        const collections = await db.listCollections().toArray();

        if (!collections.some(col => col.name === this.basketsCollection)) {
            await db.createCollection(this.basketsCollection);
            console.log(`Коллекция "${this.basketsCollection}" была создана.`);
        } else {
            console.log(`Коллекция "${this.basketsCollection}" уже существует.`);
        }

        if (!collections.some(col => col.name === this.basketPositionsCollection)) {
            await db.createCollection(this.basketPositionsCollection);
            console.log(`Коллекция "${this.basketPositionsCollection}" была создана.`);
        } else {
            console.log(`Коллекция "${this.basketPositionsCollection}" уже существует.`);
        }
    }

    async create(userid: string): Promise<Basket> {
        const db = this.client.db(this.dbName);
        const result = await db.collection(this.basketsCollection).insertOne({
            userid: new ObjectId(userid),
            created_at: new Date(),
        });

        return new Basket(result.insertedId.toString(), userid, []);
    }

    async getByuserid(userid: string): Promise<Basket | null> {
        const db = this.client.db(this.dbName);
        const basketData = await db.collection(this.basketsCollection).findOne({ userid: new ObjectId(userid) });

        if (!basketData) return null;

        const positions = await db.collection(this.basketPositionsCollection)
            .find({ basketid: basketData._id })
            .toArray();

        const basketPositions = positions.map((position) => new BasketPosition(
            position._id.toString(),
            position.basketid.toString(),
            position.phoneid.toString(),
            position.products_amount
        ));

        return new Basket(basketData._id.toString(), basketData.userid.toString(), basketPositions);
    }

    async getById(basketId: string): Promise<Basket | null> {
        const db = this.client.db(this.dbName);
        const basketData = await db.collection(this.basketsCollection).findOne({ _id: new ObjectId(basketId) });

        if (!basketData) return null;

        const positions = await db.collection(this.basketPositionsCollection)
            .find({ basketid: basketData._id })
            .toArray();

        const basketPositions = positions.map((position) => new BasketPosition(
            position._id.toString(),
            position.basketid.toString(),
            position.phoneid.toString(),
            position.products_amount
        ));

        return new Basket(basketData._id.toString(), basketData.userid.toString(), basketPositions);
    }

    async clearBasket(basketId: string): Promise<boolean> {
        const db = this.client.db(this.dbName);
        const result = await db.collection(this.basketPositionsCollection).deleteMany({ basketid: new ObjectId(basketId) });
        return result.deletedCount > 0;
    }

    async calculateTotalPrice(basketId: string): Promise<number> {
        const db = this.client.db(this.dbName);
        const result = await db.collection(this.basketPositionsCollection).aggregate([
            { $match: { basketid: new ObjectId(basketId) } },
            {
                $lookup: {
                    from: 'phones',
                    localField: 'phoneid',
                    foreignField: '_id',
                    as: 'phone'
                }
            },
            { $unwind: '$phone' },
            {
                $group: {
                    _id: null,
                    total: { 
                        $sum: { 
                            $multiply: [
                                { $toDouble: '$products_amount' }, 
                                { $toDouble: '$phone.price' } 
                            ] 
                        } 
                    }
                }
            }
        ]).toArray();

        return result.length > 0 ? result[0].total : 0;
    }

    async update(basket: Basket): Promise<Basket> {
        const db = this.client.db(this.dbName);

        await db.collection(this.basketsCollection).updateOne(
            { _id: new ObjectId(basket.id) },
            { $set: { userid: new ObjectId(basket.userId) } }
        );

        await db.collection(this.basketPositionsCollection).deleteMany({ basketid: new ObjectId(basket.id) });

        const positionPromises = basket.positions.map((position) => db.collection(this.basketPositionsCollection).insertOne({
            basketid: new ObjectId(basket.id),
            phoneid: new ObjectId(position.phoneId),
            products_amount: position.productsAmount
        }));

        await Promise.all(positionPromises);

        return basket;
    }
}
