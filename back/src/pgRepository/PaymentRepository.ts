import { Payment } from "../models/PaymentModel";
import { Pool } from 'pg';
import * as conf from '../../config'
import { NotFoundError } from "../errors/requestErrors";

export interface IPaymentRepository {
    create(payment: Payment): Promise<Payment | null>;
    getById(paymentId: string): Promise<Payment | null>;
    getByOrderId(orderId: string): Promise<Payment | null>;
    update(id: string, status: boolean): Promise<Payment | null>;
    delete(id: string): Promise<boolean>;
}

export class PostgresPaymentRepository implements IPaymentRepository {
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
                `SELECT to_regclass('public.payments')`
            );

            if (!result.rows[0].to_regclass) {
                await client.query(
                    `CREATE TABLE IF NOT EXISTS payments (
                        id SERIAL PRIMARY KEY,
                        orderid SERIAL NOT NULL,
                        status BOOLEAN NOT NULL,
                        sum INT NOT NULL CHECK (sum >= 0),
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (orderid) REFERENCES orders(id) ON DELETE CASCADE
                    )`
                );
                console.log('Таблица платежей создана');
            } else {
                console.log('Таблица платежей уже существует');
            }
        } catch (error: any) {
            console.error('Ошибка при проверке таблицы платежей:', error.message);
        } finally {
            client.release();
        }
    }

    async create(payment: Payment): Promise<Payment | null> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
    
            const order = await client.query(
                `SELECT * FROM orders WHERE id = $1`,
                [payment.orderId]
            );

            if(order.rows.length == 0){
                throw new NotFoundError("order not found by id");
            }

            const positionResult = await client.query(
                `SELECT * FROM positions WHERE orderid = $1`,
                [payment.orderId]
            );
    
            const result = await client.query(
                `SELECT SUM(products_amount * price) AS total_price 
                 FROM positions 
                 INNER JOIN phones ON positions.productid = phones.id 
                 WHERE orderid = $1`,
                [payment.orderId]
            );
    
            const paymentResult = await client.query(
                `INSERT INTO payments (orderid, status, sum) VALUES ($1, $2, $3) RETURNING *`,
                [payment.orderId, payment.status, parseInt(result.rows[0].total_price) || 0]
            );
    
            const createdPayment = paymentResult.rows[0];
            const createdPaymentId = createdPayment.id;
            const createdPaymentSum = createdPayment.sum;
    
            await client.query('COMMIT');
    
            return new Payment(createdPaymentId, payment.orderId, payment.status, createdPaymentSum);
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при создании платежа:', error.message);
            return null;
        } finally {
            client.release();
        }
    }

    async getById(paymentId: string): Promise<Payment | null> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(`SELECT * FROM payments WHERE id = $1`, [paymentId]);
            if (result.rows.length === 0) return null;

            const paymentData = result.rows[0];
            return new Payment(
                paymentData.id,
                paymentData.orderid,
                paymentData.status,
                paymentData.sum
            );
        } catch (error: any) {
            console.error('Ошибка при получении платежа по ID:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async getByOrderId(orderId: string): Promise<Payment | null> {
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(`SELECT * FROM payments WHERE orderid = $1`, [orderId]);
            if (result.rows.length === 0) return null;

            const paymentData = result.rows[0];
            return new Payment(
                paymentData.id,
                paymentData.orderid,
                paymentData.status,
                paymentData.sum
            );
        } catch (error: any) {
            console.error('Ошибка при получении платежа по ID заказа:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async update(id: string, status: boolean): Promise<Payment | null> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `UPDATE payments SET status = $1 WHERE id = $2 RETURNING *`,
                [status, id]
            );

            if (result.rows.length === 0) return null;

            await client.query('COMMIT');

            return new Payment(
                result.rows[0].id,
                result.rows[0].orderId,
                result.rows[0].status,
                result.rows[0].sum 
            );
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Ошибка при обновлении платежа:', error.message);
            return null;
        } finally {
            client.release();
        }
    }

    async delete(id: string): Promise<boolean>{
        const client = await this.pool.connect();
        try {
            await client.query(
                `DELETE FROM payments WHERE id = $1`,
                [id]
            );
            return true;
        } catch (error) {
            console.error('Error deleting payment:', error);
            return false;
        } finally {
            client.release();
        }
    }
}
