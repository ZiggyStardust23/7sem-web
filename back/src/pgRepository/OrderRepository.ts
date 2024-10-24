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

            const orderResult = await client.query(
                `INSERT INTO orders (userid, status, address, date) VALUES ($1, $2, $3, $4) RETURNING *`,
                [order.userid, order.status, order.address, order.date]
            );
            const orderId = orderResult.rows[0].id;

            for (const position of order.positions) {
                const positionResult = await client.query(
                    `INSERT INTO positions (orderid, productid, products_amount) VALUES ($1, $2, $3) RETURNING id`,
                    [orderId, position.productId, position.productsAmount]
                );
                position.id = positionResult.rows[0].id; // Обновляем id позиции
                position.orderId = orderId; // Обновляем orderId для позиции
            }
    
            await client.query('COMMIT');
    
            order.id = orderId; // Добавляем id созданного заказа в объект заказа
    
            return order;
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
            const positions: OrderPosition[] = positionResult.rows.map(row => (new OrderPosition(
                row.id,
                row.orderid,
                row.productid,
                row.products_amount
            )));

            return new Order(
                orderData.id,
                orderData.userid,
                orderData.status as OrderStatus,
                orderData.address,
                orderData.date,
                positions
            );
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

            const orders: Order[] = [];
            for (const orderData of result.rows) {
                const positionResult = await client.query(`SELECT * FROM positions WHERE orderid = $1`, [orderData.id]);
                const positions: OrderPosition[] = positionResult.rows.map(row => (new OrderPosition(
                    row.id,
                    row.orderid,
                    row.productid,
                    row.products_amount
                )));

                orders.push(new Order(
                    orderData.id,
                    orderData.userid,
                    orderData.status as OrderStatus,
                    orderData.address,
                    orderData.date,
                    positions
                ));
            }

            console.log("HERE", orders)
            return orders;
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
    
            await client.query(
                `UPDATE orders SET userid = $1, status = $2, address = $3, date = $4 WHERE id = $5`,
                [order.userid, order.status, order.address, order.date, order.id]
            );
    
            await client.query(`DELETE FROM positions WHERE orderid = $1`, [order.id]);
    
            const positionPromises = order.positions.map(position =>
                client.query(
                    `INSERT INTO positions (orderid, productid, products_amount) VALUES ($1, $2, $3) RETURNING *`,
                    [order.id, position.productId, position.productsAmount]
                )
            );
            const positionResults = await Promise.all(positionPromises);
            // Сохраняем идентификаторы новых позиций в массиве позиций заказа
            order.positions = positionResults.map(result => new OrderPosition(result.rows[0].id, order.id, result.rows[0].productid, result.rows[0].products_amount));
            await client.query('COMMIT');
    
            return order;
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
            await client.query(`DELETE FROM positions WHERE orderid = $1`, [order.id]);
            await client.query(`DELETE FROM orders WHERE id = $1`, [order.id]);
    
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

        await client.query(
            `UPDATE orders SET status = $1 WHERE id = $2`,
            [order.status, order.id]
        );

        return order;
        client.release();
    }
    
    
}