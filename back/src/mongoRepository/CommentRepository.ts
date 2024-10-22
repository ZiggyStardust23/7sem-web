import { Comment } from "../models/CommentModel";
import { MongoClient, ObjectId } from 'mongodb';
import * as conf from '../../config';

export interface ICommentRepository {
    create(comment: Comment): Promise<Comment>;
    getByProductId(productId: string): Promise<Comment[]>;
    getById(commentId: string): Promise<Comment | null>;
    update(comment: Comment): Promise<Comment | null>;
    delete(commentId: string): Promise<boolean>;
}

export class MongoCommentRepository implements ICommentRepository {
    private client: MongoClient;
    private dbName = "ppo";
    private commentsCollection = 'comments';

    constructor() {
        this.client = new MongoClient(conf.mongoUrl);
        this.initialize();
    }

    async initialize(): Promise<void> {
        await this.client.connect();
        console.log('Подключение к MongoDB установлено');

        const db = this.client.db(this.dbName);

        // Проверяем и создаем коллекцию, если она не существует
        const collections = await db.listCollections({ name: this.commentsCollection }).toArray();
        if (collections.length === 0) {
            await db.createCollection(this.commentsCollection);
            console.log(`Коллекция "${this.commentsCollection}" была создана.`);
        } else {
            console.log(`Коллекция "${this.commentsCollection}" уже существует.`);
        }
    }

    async create(comment: Comment): Promise<Comment> {
        const db = this.client.db(this.dbName);
        const result = await db.collection(this.commentsCollection).insertOne({
            userid: new ObjectId(comment.userId),
            product_id: new ObjectId(comment.productId),
            text: comment.text,
            rate: comment.rate,
            created_at: new Date(),
            updated_at: new Date()
        });

        return new Comment(
            result.insertedId.toString(),
            comment.userId,
            comment.productId,
            comment.text,
            comment.rate
        );
    }

    async getByProductId(productId: string): Promise<Comment[]> {
        const db = this.client.db(this.dbName);
        const comments = await db.collection(this.commentsCollection).find({ product_id: new ObjectId(productId) }).toArray();

        return comments.map(comment => new Comment(
            comment._id.toString(),
            comment.userid.toString(),
            comment.product_id.toString(),
            comment.text,
            comment.rate
        ));
    }

    async getById(commentId: string): Promise<Comment | null> {
        const db = this.client.db(this.dbName);
        const comment = await db.collection(this.commentsCollection).findOne({ _id: new ObjectId(commentId) });

        if (!comment) return null;

        return new Comment(
            comment._id.toString(),
            comment.userid.toString(),
            comment.product_id.toString(),
            comment.text,
            comment.rate
        );
    }

    async update(comment: Comment): Promise<Comment | null> {
        const db = this.client.db(this.dbName);
        const result = await db.collection(this.commentsCollection).findOneAndUpdate(
            { _id: new ObjectId(comment.id) },
            { $set: { text: comment.text, rate: comment.rate, updated_at: new Date() } },
            { returnDocument: 'after' }
        );

        if (result == null) return null;
        if (!result.value) return null;

        return new Comment(
            result.value._id.toString(),
            result.value.userid.toString(),
            result.value.product_id.toString(),
            result.value.text,
            result.value.rate
        );
    }

    async delete(commentId: string): Promise<boolean> {
        const db = this.client.db(this.dbName);
        const result = await db.collection(this.commentsCollection).deleteOne({ _id: new ObjectId(commentId) });

        return result.deletedCount > 0;
    }
}
