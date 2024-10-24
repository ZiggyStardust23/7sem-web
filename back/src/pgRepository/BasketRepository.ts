import { Basket, BasketPosition } from '../models/BasketModel';
import { Pool } from 'pg';

import * as conf from '../../config'

export interface IBasketRepository {
    create(userid: string): Promise<Basket>;
    getByuserid(userid: string): Promise<Basket | null>;
    getById(baskerId: string): Promise<Basket | null>
    clearBasket(basketId: string): Promise<boolean>;
    calculateTotalPrice(basketId: string): Promise<number>;
    update(basket: Basket): Promise<Basket>;
}

export class PostgresBasketRepository implements IBasketRepository {
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
            const result = await client.query(
                `SELECT to_regclass('public.baskets')`
            );

            if (!result.rows[0].to_regclass) {
                await client.query(
                    `CREATE TABLE baskets (
                        id SERIAL PRIMARY KEY,
                        userid SERIAL NOT NULL,
                        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )`
                );
                console.log('Таблица корзин создана');
            } else {
                console.log('Таблица корзин уже существует');
            }

            const resultpos = await client.query(
                `SELECT to_regclass('public.basketpositions')`
            );
            if (!resultpos.rows[0].to_regclass) {
                await client.query(
                    `CREATE TABLE basketpositions (
                        id SERIAL PRIMARY KEY,
                        basketid SERIAL NOT NULL,
                        phoneid SERIAL NOT NULL,
                        products_amount INT NOT NULL CHECK (products_amount > 0),
                        FOREIGN KEY (basketid) REFERENCES baskets(id) ON DELETE CASCADE,
                        FOREIGN KEY (phoneid) REFERENCES phones(id) ON DELETE CASCADE
                    )`
                );
                console.log('Таблица позиций корзин создана');
            } else {
                console.log('Таблица позиций корзин уже существует');
            }
        } catch (error: any) {
            console.error('Ошибка при проверке таблицы корзин:', error.message);
        } finally {
            client.release();
        }
    }

    async create(userid: string): Promise<Basket> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            const basketResult = await client.query(
                `INSERT INTO baskets (userid) VALUES ($1) RETURNING id`,
                [userid]
            );
            const basketId = basketResult.rows[0].id;

            await client.query('COMMIT');

            return new Basket(basketId.toString(), userid, []);
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при создании корзины:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async getByuserid(userid: string): Promise<Basket | null> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(`SELECT * FROM baskets WHERE userid = $1`, [userid]);
            if (result.rows.length === 0) return null;

            const basketData = result.rows[0];
            const positionResult = await client.query(`SELECT * FROM basketpositions WHERE basketid = $1`, [basketData.id]);
            const positions: BasketPosition[] = positionResult.rows.map(row => (new BasketPosition(
                row.id.toString(),
                row.basketid.toString(),
                row.phoneid.toString(),
                row.products_amount
            )));

            return new Basket(
                basketData.id.toString(),
                basketData.userid,
                positions
            );
        } catch (error: any) {
            console.error('Ошибка при получении корзины по пользователю:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async getById(basketId: string): Promise<Basket | null> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(`SELECT * FROM baskets WHERE id = $1`, [basketId]);
            if (result.rows.length === 0) return null;

            const basketData = result.rows[0];
            const positionResult = await client.query(`SELECT * FROM basketpositions WHERE basketid = $1`, [basketId]);
            const positions: BasketPosition[] = positionResult.rows.map(row => (new BasketPosition(
                row.id.toString(),
                row.basketid.toString(),
                row.phoneid.toString(),
                row.products_amount
            )));

            return new Basket(
                basketData.id.toString(),
                basketData.userid,
                positions
            );
        } catch (error: any) {
            console.error('Ошибка при получении корзины по ID:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async clearBasket(basketId: string): Promise<boolean> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            await client.query(`DELETE FROM basketpositions WHERE basketid = $1`, [basketId]);

            await client.query('COMMIT');

            return true;
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при очистке корзины:', error.message);
            return false;
        } finally {
            client.release();
        }
    }

    async calculateTotalPrice(basketId: string): Promise<number> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(
                `SELECT SUM(products_amount * price) AS total_price 
                 FROM basketpositions 
                 INNER JOIN phones ON basketpositions.phoneid = phones.id 
                 WHERE basketid = $1`,
                [basketId]
            );

            return parseInt(result.rows[0].total_price) || 0;
        } catch (error: any) {
            console.error('Ошибка при расчете общей суммы корзины:', error.message);
            return 0;
        } finally {
            client.release();
        }
    }

    async update(basket: Basket): Promise<Basket> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            await client.query(
                `UPDATE baskets SET userid = $1 WHERE id = $2`,
                [basket.userId, basket.id]
            );

            await client.query(`DELETE FROM basketpositions WHERE basketid = $1`, [basket.id]);

            var positions: BasketPosition[] = [];

            for (let i = 0; i < basket.positions.length; i++){
                let result = await client.query(
                    `INSERT INTO basketpositions (basketid, phoneid, products_amount) VALUES ($1, $2, $3) RETURNING *`,
                    [basket.id, basket.positions[i].phoneId, basket.positions[i].productsAmount]
                )
                basket.positions[i].id = result.rows[0].id;
            }

            await client.query('COMMIT');
            return basket;
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при обновлении корзины:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }
}
