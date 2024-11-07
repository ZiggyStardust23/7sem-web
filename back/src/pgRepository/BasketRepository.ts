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

export class BasketDA {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _userId: string;
    public get userId(): string {
        return this._userId;
    }
    public set userId(value: string) {
        this._userId = value;
    }
    private _positions: BasketDAPosition[];
    public get positions(): BasketDAPosition[] {
        return this._positions;
    }
    public set positions(value: BasketDAPosition[]) {
        this._positions = value;
    }
    
    constructor(
        id: string,
        userId: string,
        positions: BasketDAPosition[]
    ){
        this._id = id;
        this._userId = userId;
        this._positions = positions;
    }
    public static fromService(
        serviceBasket: Basket, 
    ): BasketDA{
        let dapositions: BasketDAPosition[] = [];
        for (let i = 0; i < serviceBasket.positions.length; i++){
            dapositions.push(BasketDAPosition.fromService(serviceBasket.positions[i]));
        }

        return new BasketDA(serviceBasket.id, serviceBasket.userId, dapositions);
    }
    public toService(): Basket{
        const basketPositions: BasketPosition[] = [];
        for (let i = 0; i < this.positions.length; i++){
            basketPositions.push(this.positions[i].toService());
        }
        return new Basket(
            this.id,
            this.userId,
            basketPositions,
        )
    }
}

export class BasketDAPosition {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _basketId: string;
    public get basketId(): string {
        return this._basketId;
    }
    public set basketId(value: string) {
        this._basketId = value;
    }
    private _phoneId: string;
    public get phoneId(): string {
        return this._phoneId;
    }
    public set phoneId(value: string) {
        this._phoneId = value;
    }
    private _productsAmount: number;
    public get productsAmount(): number {
        return this._productsAmount;
    }
    public set productsAmount(value: number) {
        this._productsAmount = value;
    }

    constructor(
        id: string,
        basketId: string,
        phoneId: string,
        productsAmount: number
    ){
        this._id = id;
        this._basketId = basketId;
        this._phoneId = phoneId;
        this._productsAmount = productsAmount;
    }

    public static fromService(
        servicePosition: BasketPosition
    ): BasketDAPosition{
        return new BasketDAPosition(
            servicePosition.id,
            servicePosition.basketId,
            servicePosition.phoneId,
            servicePosition.productsAmount
        )
    }

    public toService(): BasketPosition{
        return new BasketPosition(
            this.id,
            this.basketId,
            this.phoneId,
            this.productsAmount
        )
    }
};

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

            return new BasketDA(basketId.toString(), userid, []).toService();
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
            const positions: BasketDAPosition[] = positionResult.rows.map(row => (new BasketDAPosition(
                row.id.toString(),
                row.basketid.toString(),
                row.phoneid.toString(),
                row.products_amount
            )));

            const bda = new BasketDA(
                basketData.id.toString(),
                basketData.userid,
                positions
            );

            return bda.toService();
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
            const positions: BasketDAPosition[] = positionResult.rows.map(row => (new BasketDAPosition(
                row.id.toString(),
                row.basketid.toString(),
                row.phoneid.toString(),
                row.products_amount
            )));

            const bda = new BasketDA(
                basketData.id.toString(),
                basketData.userid,
                positions
            );

            return bda.toService();
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

            const bda = BasketDA.fromService(basket);

            await client.query(
                `UPDATE baskets SET userid = $1 WHERE id = $2`,
                [bda.userId, bda.id]
            );

            await client.query(`DELETE FROM basketpositions WHERE basketid = $1`, [basket.id]);

            var positions: BasketDAPosition[] = [];

            for (let i = 0; i < bda.positions.length; i++){
                let result = await client.query(
                    `INSERT INTO basketpositions (basketid, phoneid, products_amount) VALUES ($1, $2, $3) RETURNING *`,
                    [bda.id, bda.positions[i].phoneId, bda.positions[i].productsAmount]
                )
                bda.positions[i].id = result.rows[0].id;
            }

            await client.query('COMMIT');
            return bda.toService();
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при обновлении корзины:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }
}
