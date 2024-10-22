import { MongoClient, ObjectId } from 'mongodb';
import { User } from "../models/UserModel";
import * as conf from '../../config';

interface IUserRepository {
    create(user: User): Promise<User>;
    update(user: User): Promise<User | null>;
    authenticate(login: string, password: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    getById(id: string): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}

export class MongoUserRepository implements IUserRepository {
    private client: MongoClient;
    private db: any;
    private collection: string = 'users';

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
            await this.db.collection(this.collection).createIndex({ email: 1 }, { unique: true });
            console.log('Коллекция пользователей создана');
        } else {
            console.log('Коллекция пользователей уже существует');
        }
    }

    async create(user: User): Promise<User> {
        console.log("HERE")
        const result = await this.db.collection(this.collection).insertOne({
            name: user.name,
            email: user.email,
            password: user.password,
            phone_number: user.phone_number,
            role: user.role,
            created_at: new Date(),
            updated_at: new Date(),
        });

        user.id = result.insertedId.toString();
        return user;
    }

    async update(user: User): Promise<User | null> {
        const result = await this.db.collection(this.collection).findOneAndUpdate(
            { _id: new ObjectId(user.id) },
            {
                $set: {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    phone_number: user.phone_number,
                    role: user.role,
                    updated_at: new Date(),
                }
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            console.error('Пользователь не найден');
            return null;
        }

        return new User(
            result.value._id.toString(),
            result.value.name,
            result.value.email,
            result.value.password,
            result.value.phone_number,
            result.value.role
        );
    }

    async authenticate(login: string, password: string): Promise<User | null> {
        const user = await this.db.collection(this.collection).findOne({ email: login });

        if (!user || user.password !== password) {
            console.error('Неверный логин или пароль');
            return null;
        }

        return new User(
            user._id.toString(),
            user.name,
            user.email,
            user.password,
            user.phone_number,
            user.role
        );
    }

    async getByEmail(email: string): Promise<User | null> {
        const user = await this.db.collection(this.collection).findOne({ email });

        if (!user) {
            console.error('Пользователь не найден');
            return null;
        }

        return new User(
            user._id.toString(),
            user.name,
            user.email,
            user.password,
            user.phone_number,
            user.role
        );
    }

    async getById(id: string): Promise<User | null> {
        const user = await this.db.collection(this.collection).findOne({ _id: new ObjectId(id) });

        if (!user) {
            console.error('Пользователь не найден');
            return null;
        }

        return new User(
            user._id.toString(),
            user.name,
            user.email,
            user.password,
            user.phone_number,
            user.role
        );
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.collection(this.collection).deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

export { IUserRepository };
