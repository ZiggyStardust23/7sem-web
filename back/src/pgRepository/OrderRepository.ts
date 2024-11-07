import { Order, OrderPosition } from '../models/OrderModel';
import { OrderStatus } from '../models/OrderModel';
import { Pool } from 'pg';

import * as conf from '../../config'

export interface IOrderRepository {
    create(order: Order): Promise<Order>;
    getById(orderId: string): Promise<Order | null>;
    getByUserId(userid: string): Promise<Order[]>;
    update(order: Order): Promise<Order | null>;
    updateStatus(order: Order): Promise<Order>;
    delete(order: Order): Promise<boolean>;
}

class OrderDA {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _userid: string;
    public get userid(): string {
        return this._userid;
    }
    public set userid(value: string) {
        this._userid = value;
    }
    private _status: OrderStatus;
    public get status(): OrderStatus {
        return this._status;
    }
    public set status(value: OrderStatus) {
        this._status = value;
    }
    private _address: string;
    public get address(): string {
        return this._address;
    }
    public set address(value: string) {
        this._address = value;
    }
    private _date: Date;
    public get date(): Date {
        return this._date;
    }
    public set date(value: Date) {
        this._date = value;
    }
    private _positions: OrderDAPosition[];
    public get positions(): OrderDAPosition[] {
        return this._positions;
    }
    public set positions(value: OrderDAPosition[]) {
        this._positions = value;
    }
    constructor (
        id: string, 
        userid: string,
        status: OrderStatus,
        adress: string,
        date: Date,
        positions: OrderDAPosition[]
    ){
        this._id = id;
        this._userid = userid;
        this._status = status;
        this._address = adress;
        this._date = date;
        this._positions = positions;
    }

    public static fromServce(order: Order): OrderDA{
        const orderDAPositions: OrderDAPosition[] = []
        for (let i = 0; i < order.positions.length; i++){
            var pos = OrderDAPosition.fromService(order.positions[i]);
            orderDAPositions.push(pos);
        }
        return new OrderDA(
            order.id,
            order.userid,
            order.status,
            order.address,
            order.date,
            orderDAPositions
        )
    }

    public toService(): Order{
        const orderPositions: OrderPosition[] = [];
        for (let i = 0; i < this.positions.length; i++){
            var pos = this.positions[i].toService();
            orderPositions.push(pos);
        }
        return new Order(
            this.id,
            this.userid,
            this.status,
            this.address,
            this.date,
            orderPositions,
        )
    }
}

class OrderDAPosition {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _orderId: string;
    public get orderId(): string {
        return this._orderId;
    }
    public set orderId(value: string) {
        this._orderId = value;
    }
    private _productId: string;
    public get productId(): string {
        return this._productId;
    }
    public set productId(value: string) {
        this._productId = value;
    }
    private _productsAmount: number;
    public get productsAmount(): number {
        return this._productsAmount;
    }
    public set productsAmount(value: number) {
        this._productsAmount = value;
    }

	constructor(id: string, orderId: string, productId: string, productsAmount: number) {
        this._id = id;
        this._orderId = orderId;
        this._productId = productId;
        this._productsAmount = productsAmount;
	}

    public static fromService(pos: OrderPosition): OrderDAPosition{
        return new OrderDAPosition(
            pos.id,
            pos.orderId,
            pos.productId,
            pos.productsAmount
        )
    }

    public toService(): OrderPosition{
        return new OrderPosition(
            this.id,
            this.orderId,
            this.productId,
            this.productsAmount,    
        )
    }
    
}

export class PostgresOrderRepository implements IOrderRepository {
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
                `SELECT to_regclass('public.orders')`
            );

            if (!result.rows[0].to_regclass) {
                // Если таблица не существует, создаем ее
                await client.query(
                    `CREATE TABLE orders (
                        id SERIAL PRIMARY KEY,
                        userid SERIAL NOT NULL,
                        status INT NOT NULL CHECK (status >= 0 AND status <= 3),
                        address VARCHAR(255) NOT NULL,
                        date TIMESTAMPTZ NOT NULL,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
                    )`
                );
                console.log('Таблица заказов создана');
            } else {
                console.log('Таблица заказов уже существует');
            }

            const resultpos = await client.query(
                `SELECT to_regclass('public.positions')`
            );
            if (!resultpos.rows[0].to_regclass) {
                // Если таблица не существует, создаем ее
                await client.query(
                    `CREATE TABLE IF NOT EXISTS positions (
                        id SERIAL PRIMARY KEY,
                        orderid SERIAL NOT NULL,
                        productid SERIAL NOT NULL,
                        products_amount INT NOT NULL CHECK (products_amount > 0),
                        FOREIGN KEY (orderid) REFERENCES orders(id) ON DELETE CASCADE,
                        FOREIGN KEY (productid) REFERENCES phones(id) ON DELETE CASCADE
                    )`
                );
                console.log('Таблица позиций создана');
            } else {
                console.log('Таблица позиций уже существует');
            }
        } catch (error: any) {
            console.error('Ошибка при проверке таблицы заказов:', error.message);
        } finally {
            client.release();
        }
    }

    async create(order: Order): Promise<Order> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const oda = OrderDA.fromServce(order);
            const orderResult = await client.query(
                `INSERT INTO orders (userid, status, address, date) VALUES ($1, $2, $3, $4) RETURNING *`,
                [oda.userid, oda.status, oda.address, oda.date]
            );
            const orderId = orderResult.rows[0].id;

            for (const position of oda.positions) {
                const positionResult = await client.query(
                    `INSERT INTO positions (orderid, productid, products_amount) VALUES ($1, $2, $3) RETURNING id`,
                    [orderId, position.productId, position.productsAmount]
                );
                position.id = positionResult.rows[0].id;
                position.orderId = orderId;
            }
    
            await client.query('COMMIT');
    
            oda.id = orderId;
    
            return oda.toService();
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при создании заказа:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async getById(orderId: string): Promise<Order | null> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
            if (result.rows.length === 0) return null;

            const orderData = result.rows[0];
            const positionResult = await client.query(`SELECT * FROM positions WHERE orderid = $1`, [orderId]);
            const positions: OrderDAPosition[] = positionResult.rows.map(row => (new OrderDAPosition(
                row.id,
                row.orderid,
                row.productid,
                row.products_amount
            )));

            return new OrderDA(
                orderData.id,
                orderData.userid,
                orderData.status as OrderStatus,
                orderData.address,
                orderData.date,
                positions
            ).toService();
        } catch (error: any) {
            console.error('Ошибка при получении заказа по ID:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async getByUserId(userid: string): Promise<Order[]> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(`SELECT * FROM orders WHERE userid = $1`, [userid]);
            if (result.rows.length === 0) return [];

            const orders: OrderDA[] = [];
            for (const orderData of result.rows) {
                const positionResult = await client.query(`SELECT * FROM positions WHERE orderid = $1`, [orderData.id]);
                const positions: OrderDAPosition[] = positionResult.rows.map(row => (new OrderDAPosition(
                    row.id,
                    row.orderid,
                    row.productid,
                    row.products_amount
                )));

                orders.push(new OrderDA(
                    orderData.id,
                    orderData.userid,
                    orderData.status as OrderStatus,
                    orderData.address,
                    orderData.date,
                    positions
                ));
            }

            const serviceOrders: Order[] = [];
            for (let o of orders){
                serviceOrders.push(o.toService())
            }
            return serviceOrders;
        } catch (error: any) {
            console.error('Ошибка при получении заказов пользователя:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async update(order: Order): Promise<Order | null> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const oda = OrderDA.fromServce(order);
            await client.query(
                `UPDATE orders SET userid = $1, status = $2, address = $3, date = $4 WHERE id = $5`,
                [oda.userid, oda.status, oda.address, oda.date, oda.id]
            );
    
            await client.query(`DELETE FROM positions WHERE orderid = $1`, [oda.id]);
    
            const positionPromises = oda.positions.map(position =>
                client.query(
                    `INSERT INTO positions (orderid, productid, products_amount) VALUES ($1, $2, $3) RETURNING *`,
                    [oda.id, position.productId, position.productsAmount]
                )
            );
            const positionResults = await Promise.all(positionPromises);
            oda.positions = positionResults.map(result => new OrderDAPosition(result.rows[0].id, order.id, result.rows[0].productid, result.rows[0].products_amount));
            await client.query('COMMIT');
    
            return oda.toService();
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при обновлении заказа:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async delete(order: Order): Promise<boolean> {
        const client = await this.pool.connect();
        
        try {    
            const oda = OrderDA.fromServce(order);
            await client.query(`DELETE FROM positions WHERE orderid = $1`, [oda.id]);
            await client.query(`DELETE FROM orders WHERE id = $1`, [oda.id]);
    
            return true;
        } catch (error: any) {
            console.error('Ошибка при удалении заказа:', error.message);
            return false;
        } finally {
            client.release();
        }
    }

    async updateStatus(order: Order): Promise<Order> {
        const client = await this.pool.connect();
        const oda = OrderDA.fromServce(order);

        await client.query(
            `UPDATE orders SET status = $1 WHERE id = $2`,
            [oda.status, oda.id]
        );

        return oda.toService();
        client.release();
    }
    
    
}