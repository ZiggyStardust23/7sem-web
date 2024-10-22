import { MongoClient, ObjectId } from 'mongodb';
import { Wish } from "../models/WishModel";
import * as conf from '../../config';

export interface IWishRepository {
    create(wish: Wish): Promise<Wish | null>;
    getByUserId(userId: string): Promise<Wish[]>;
    delete(id: string): Promise<boolean>;
}

export class MongoWishRepository implements IWishRepository {
    private client: MongoClient;
    private db: any;
    private collection: string = 'wishes';

    constructor() {
        this.client = new MongoClient(conf.mongoUrl);
        this.initialize()
    }

    async initialize(): Promise<void> {
        await this.client.connect();
        this.db = this.client.db('ppo');
        await this.ensureCollectionExists();
    }

    async ensureCollectionExists(): Promise<void> {
        const collections = await this.db.listCollections({ name: this.collection }).toArray();
        if (collections.length === 0) {
            await this.db.createCollection(this.collection);
            await this.db.collection(this.collection).createIndex({ userid: 1, product_id: 1 }, { unique: true });
            console.log('Коллекция желаний создана');
        } else {
            console.log('Коллекция желаний уже существует');
        }
    }

    async create(wish: Wish): Promise<Wish | null> {
        try {
            const existingWish = await this.db.collection(this.collection).findOne({
                userid: wish.userid,
                product_id: wish.productid
            });

            if (existingWish) {
                return null;
            }

            const result = await this.db.collection(this.collection).insertOne({
                userid: wish.userid,
                product_id: wish.productid,
                created_at: new Date(),
                updated_at: new Date(),
            });

            wish.id = result.insertedId.toString();
            return wish;
        } catch (error) {
            console.error('Ошибка при создании желания:', error);
            throw error;
        }
    }

    async getByUserId(userId: string): Promise<Wish[]> {
        try {
            const wishes = await this.db.collection(this.collection).find({ userid: userId }).toArray();
            return wishes.map((wish: any) => new Wish(
                wish._id.toString(),
                wish.userid,
                wish.product_id
            ));
        } catch (error) {
            console.error('Ошибка при получении желаний по ID пользователя:', error);
            throw error;
        }
    }

    async delete(wishId: string): Promise<boolean> {
        try {
            const result = await this.db.collection(this.collection).deleteOne({ _id: new ObjectId(wishId) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Ошибка при удалении желания:', error);
            throw error;
        }
    }
}
