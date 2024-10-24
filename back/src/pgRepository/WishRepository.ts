import { Wish } from "../models/WishModel"
import { Pool } from 'pg';
import * as conf from '../../config'
import { createDTO } from "../dto/WishDTO";


export interface IWishRepository{
    create(wish: Wish): Promise<Wish | null>
	getByUserId(userId: string): Promise<Wish[]>
    getById(id: string): Promise<Wish | null>
	delete(id: string): Promise<boolean>
}

export class PostgresWishRepository implements IWishRepository {
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
                `SELECT to_regclass('public.wishes')`
            );

            if (!result.rows[0].to_regclass) {
                // Если таблица не существует, создаем ее
                await client.query(
                    `CREATE TABLE wishes (
                        id SERIAL PRIMARY KEY,
                        userid SERIAL NOT NULL,
                        product_id SERIAL NOT NULL,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )`
                );
                console.log('Таблица желаний создана');
            } else {
                console.log('Таблица желаний уже существует');
            }
        } catch (error: any) {
            console.error('Ошибка при проверке таблицы желаний:', error.message);
        } finally {
            client.release();
        }
    }

    async create(wish: Wish): Promise<Wish | null> {
        const client = await this.pool.connect();
        try {
            const resultCheck = await client.query(
                `SELECT * FROM wishes WHERE userid = $1 AND product_id = $2`,
                [wish.userid, wish.productid]
            );
            if (resultCheck.rows.length != 0){
                if (resultCheck.rows[0].product_id == parseInt(wish.productid)){
                    return null;
                }
            }
            const result = await client.query(
                `INSERT INTO wishes (userid, product_id) VALUES ($1, $2) RETURNING *`,
                [wish.userid, wish.productid]
            );
            const createdWish = result.rows[0];
            return new Wish(
                createdWish.id,
                createdWish.userid,
                createdWish.product_id,
            );
        } catch (error) {
            console.error('Error creating wish:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getByUserId(userId: string): Promise<Wish[]> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM wishes WHERE userid = $1`,
                [userId]
            );
            return result.rows.map(row => new Wish(
                row.id,
                row.userid,
                row.product_id,
            ));
        } catch (error) {
            console.error('Error getting wishes by product ID:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getById(id: string): Promise<Wish | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `SELECT * FROM wishes WHERE id = $1`,
                [id]
            );
            if (result.rows.length == 0){
                return null;
            }
            else{
                const createdWish = result.rows[0];
                return new Wish(
                    createdWish.id,
                    createdWish.userid,
                    createdWish.product_id,
                );
            }
        } catch (error) {
            console.error('Error getting comments by product ID:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(wishId: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            await client.query(
                `DELETE FROM wishes WHERE id = $1`,
                [wishId]
            );
            return true;
        } catch (error) {
            console.error('Error deleting wish:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
