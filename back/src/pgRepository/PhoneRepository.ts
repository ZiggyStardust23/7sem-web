import { Phone } from "../models/PhoneModel";
import { phoneFullDTO, phoneSearchDTO } from "../dto/PhoneDTO";
import { QueryResult, Pool } from 'pg';

import * as conf from '../../config'

export interface IPhoneRepository {
    getById(id: string): Promise<Phone | null>;
    paginate(props: Partial<phoneFullDTO>, pageNumber: number, pageSize: number): Promise<Phone[]>;
    create(phone: Phone): Promise<Phone>;
    update(phone: Phone): Promise<Phone | null>;
}

export class PostgresPhoneRepository implements IPhoneRepository {
    private pool: Pool;
    private seq: any;

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
                `SELECT to_regclass('public.phones')`
            );

            if (!result.rows[0].to_regclass) {
                // Если таблица не существует, создаем ее
                await client.query(
                    `CREATE TABLE IF NOT EXISTS phones (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        producername VARCHAR(255) NOT NULL,
                        osname VARCHAR(255) NOT NULL,
                        ramsize INT NOT NULL CHECK (ramsize >= 0),
                        memsize INT NOT NULL CHECK (memsize >= 0),
                        camres INT NOT NULL CHECK (camres >= 0),
                        price INT NOT NULL CHECK (price >= 0),
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )`
                );
                console.log('Таблица телефонов создана');
            } else {
                console.log('Таблица телефонов уже существует');
            }
        } catch (error: any) {
            console.error('Ошибка при проверке таблицы телефонов:', error.message);
        } finally {
            client.release();
        }
    }

    async create(phone: Phone): Promise<Phone> {
        const client = await this.pool.connect();
        
        try {

            const result = await client.query(
                `INSERT INTO phones (
                    name,
                    producername,
                    osname,
                    ramsize,
                    memsize,
                    camres,
                    price
                ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [
                    phone.name,
                    phone.producername,
                    phone.osname,
                    phone.ramsize,
                    phone.memsize,
                    phone.camres,
                    phone.price,
                ]
            );
    
            const phoneCreated = new Phone(
                result.rows[0].id,
                result.rows[0].name,
                result.rows[0].producername,
                result.rows[0].osname,
                result.rows[0].ramsize,
                result.rows[0].memsize,
                result.rows[0].camres,
                result.rows[0].price,
            );
    
            return phoneCreated;
        } finally {
            client.release();
        }
    }
    

    async update(phone: Phone): Promise<Phone | null> {
        try {
            // Проверка, что пользователь существует
            if (!phone.id) {
                throw new Error('ID телефона не указан');
            }

            const client = await this.pool.connect();
            
            const result = await client.query(
                `UPDATE phones 
                 SET 
                    name = $1, 
                    producername = $2, 
                    osname = $3, 
                    ramsize = $4, 
                    memsize = $5, 
                    camres = $6, 
                    price = $7, 
                    updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $8 
                 RETURNING *`,
                [
                    phone.name,
                    phone.producername,
                    phone.osname,
                    phone.ramsize,
                    phone.memsize,
                    phone.camres,
                    phone.price,
                    phone.id
                ]
            );

            client.release();

            if (result.rows.length === 0) {
                throw new Error('Телефон не найден');
            }

            let phoneUpdated = new Phone(
                result.rows[0].id,
                result.rows[0].name,
                result.rows[0].producername,
                result.rows[0].osname,
                result.rows[0].ramsize,
                result.rows[0].memsize,
                result.rows[0].camres,
                result.rows[0].price,
            );
            return phoneUpdated;
        } catch (error: any) {
            console.error('Ошибка при обновлении телефона:', error.message);
            return null;
        }
    }

    async getById(id: string): Promise<Phone | null> {
        try {
            // Валидация входных данных
            if (!id) {
                throw new Error('ID телефона не указан');
            }

            const client = await this.pool.connect();
            
            const result = await client.query(
                `SELECT * FROM phones WHERE id = $1`,
                [parseInt(id)]
            );

            client.release();

            if (result.rows.length === 0) {
                throw new Error('Телефон с указанным ID не найден');
            }

            let toParse = result.rows[0];
            let phoneGetted = new Phone(
                result.rows[0].id,
                result.rows[0].name,
                result.rows[0].producername,
                result.rows[0].osname,
                result.rows[0].ramsize,
                result.rows[0].memsize,
                result.rows[0].camres,
                result.rows[0].price,
            );
            return phoneGetted;
        } catch (error: any) {
            console.error('Ошибка при поиске телефона по ID:', error.message);
            return null;
        }
    }
    async paginate(props: phoneSearchDTO, pageNumber: number, pageSize: number): Promise<Phone[]> {
        const offset = (pageNumber - 1) * pageSize;
    
        console.log(props, pageNumber, pageSize);
    
        let query = `SELECT * FROM phones`;
    
        const conditions: string[] = [];
        const values: any[] = [];
    
        if (props.name) {
            conditions.push(`name ILIKE $${values.length + 1}`);
            values.push(`%${props.name}%`);
        }
    
        if (props.producername) {
            conditions.push(`producername ILIKE $${values.length + 1}`);
            values.push(`%${props.producername}%`);
        }
    
        if (props.osname) {
            conditions.push(`osname ILIKE $${values.length + 1}`);
            values.push(`%${props.osname}%`);
        }
    
        if (props.minramsize !== undefined) {
            conditions.push(`ramsize >= $${values.length + 1}`);
            values.push(props.minramsize);
        }
    
        if (props.maxramsize !== undefined) {
            conditions.push(`ramsize <= $${values.length + 1}`);
            values.push(props.maxramsize);
        }
    
        if (props.minmemsize !== undefined) {
            conditions.push(`memsize >= $${values.length + 1}`);
            values.push(props.minmemsize);
        }
    
        if (props.maxmemsize !== undefined) {
            conditions.push(`memsize <= $${values.length + 1}`);
            values.push(props.maxmemsize);
        }
    
        if (props.mincamres !== undefined) {
            conditions.push(`camres >= $${values.length + 1}`);
            values.push(props.mincamres);
        }
    
        if (props.maxcamres !== undefined) {
            conditions.push(`camres <= $${values.length + 1}`);
            values.push(props.maxcamres);
        }
    
        if (props.minPrice !== undefined) {
            conditions.push(`price >= $${values.length + 1}`);
            values.push(props.minPrice);
        }
    
        if (props.maxPrice !== undefined) {
            conditions.push(`price <= $${values.length + 1}`);
            values.push(props.maxPrice);
        }
    
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
    
        query += ` ORDER BY id`;
    
        if (pageSize !== undefined) {
            query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
            values.push(pageSize, offset);
        }
    
        const client = await this.pool.connect();
        
        try {
            const result = await client.query(query, values);
            let phonesToRet: Phone[] = [];
            for (let i = 0; i < result.rows.length; i++){
                phonesToRet.push(
                    new Phone(
                        result.rows[i].id,
                        result.rows[i].name,
                        result.rows[i].producername,
                        result.rows[i].osname,
                        result.rows[i].ramsize,
                        result.rows[i].memsize,
                        result.rows[i].camres,
                        result.rows[i].price,
                    )
                )
            }
            return phonesToRet;
        } catch (error: any) {
            console.error('Ошибка при поиске телефонов:', error.message);
            return [];
        } finally {
            client.release();
        }
    }
}    