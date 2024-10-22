import { Comment } from "../models/CommentModel";
import { Pool } from 'pg';
import * as conf from '../../config'

export interface ICommentRepository {
    create(comment: Comment): Promise<Comment>;
    getByProductId(productId: string): Promise<Comment[]>;
    getById(commentId: string): Promise<Comment | null>;
    update(comment: Comment): Promise<Comment | null>;
    delete(commentId: string): Promise<boolean>;
}

export class PostgresCommentRepository implements ICommentRepository {
    private pool: Pool;

	constructor() {
        this.pool = new Pool({
            user: conf.user,
            password: conf.password,
            host: conf.host,
            port: conf.port,
            database: conf.database
        });
    }

    async initialize(): Promise<void> {
        await this.ensureTableExists();
    }

    async ensureTableExists(): Promise<void> {
        const client = await this.pool.connect();
        try {
            // Проверяем, существует ли таблица
            const result = await client.query(
                `SELECT to_regclass('public.comments')`
            );

            if (!result.rows[0].to_regclass) {
                // Если таблица не существует, создаем ее
                await client.query(
                    `CREATE TABLE comments (
                        id SERIAL PRIMARY KEY,
                        userid SERIAL NOT NULL,
                        product_id SERIAL NOT NULL,
                        text TEXT NOT NULL,
                        rate INT NOT NULL,
                        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (product_id) REFERENCES phones(id) ON DELETE CASCADE,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )`
                );
                console.log('Таблица комментариев создана');
            } else {
                console.log('Таблица комментариев уже существует');
            }
        } catch (error: any) {
            console.error('Ошибка при проверке таблицы комментариев:', error.message);
        } finally {
            client.release();
        }
    }

    async create(comment: Comment): Promise<Comment> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(
                `INSERT INTO comments (userid, product_id, text, rate) VALUES ($1, $2, $3, $4) RETURNING *`,
                [comment.userId, comment.productId, comment.text, comment.rate]
            );
            const createdComment = result.rows[0];
            return new Comment(
                createdComment.id,
                createdComment.userid,
                createdComment.product_id,
                createdComment.text,
                createdComment.rate
            );
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getByProductId(productId: string): Promise<Comment[]> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(
                `SELECT * FROM comments WHERE product_id = $1`,
                [productId]
            );
            return result.rows.map(row => new Comment(
                row.id,
                row.userid,
                row.product_id,
                row.text,
                row.rate
            ));
        } catch (error) {
            console.error('Error getting comments by product ID:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getById(commentId: string): Promise<Comment | null> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(
                `SELECT * FROM comments WHERE id = $1`,
                [commentId]
            );
            if (result.rows.length === 0) return null;
            const commentData = result.rows[0];
            return new Comment(
                commentData.id,
                commentData.userid,
                commentData.product_id,
                commentData.text,
                commentData.rate
            );
        } catch (error) {
            console.error('Error getting comment by ID:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async update(comment: Comment): Promise<Comment | null> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(
                `UPDATE comments SET text = $1, rate = $2 WHERE id = $3 RETURNING *`,
                [comment.text, comment.rate, comment.id]
            );
            if (result.rows.length === 0) return null;
            const updatedComment = result.rows[0];
            return new Comment(
                updatedComment.id,
                updatedComment.userid,
                updatedComment.product_id,
                updatedComment.text,
                updatedComment.rate
            );
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(commentId: string): Promise<boolean> {
        const client = await this.pool.connect();
        
        try {
            await client.query(
                `DELETE FROM comments WHERE id = $1`,
                [commentId]
            );
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
