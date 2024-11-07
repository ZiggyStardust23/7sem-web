import { Phone } from "../models/PhoneModel";
import { phoneFullDTO, phoneSearchDTO } from "../dto/PhoneDTO";
import { QueryResult, Pool } from 'pg';

import * as conf from '../../config'
import { NotFoundError } from "../errors/requestErrors";

export interface IPhoneRepository {
    getById(id: string): Promise<Phone | null>;
    paginate(props: Partial<phoneFullDTO>, pageNumber: number, pageSize: number): Promise<Phone[]>;
    create(phone: Phone): Promise<Phone>;
    update(phone: Phone): Promise<Phone | null>;
    delete(phoneId: string): Promise<boolean>;
}

class PhoneDA {
    private _id: string;
    private _name: string;
    private _producername: string;
    private _osname: string;
    private _ramsize: number;
    private _memsize: number;
    private _camres: number;
    private _price: number;
    constructor(
        id: string,
        name: string,
        producername: string,
        osname: string,
        ramsize: number,
        memsize: number,
        camres: number,
        price: number,
    ) {
        this._id = id;
        this._name = name;
        this._producername = producername;
        this._osname = osname;
        this._ramsize = ramsize;
        this._memsize = memsize;
        this._camres = camres;
        this._price = price;
    }

    public static fromService(phone: Phone): PhoneDA{
        return new PhoneDA(
            phone.id,
            phone.name,
            phone.producername,
            phone.osname,
            phone.ramsize,
            phone.memsize,
            phone.camres,
            phone.price
        )
    }

    public toService(): Phone {
        return new Phone(
            this._id,
            this._name,
            this._producername,
            this._osname,
            this._ramsize,
            this._memsize,
            this._camres,
            this._price,
        );
    }
        get id(): string {
            return this._id;
        }
    
        get name(): string {
            return this._name;
        }
    
        get producername(): string {
            return this._producername;
        }
    
        get osname(): string {
            return this._osname;
        }
    
        get ramsize(): number {
            return this._ramsize;
        }
    
        get memsize(): number {
            return this._memsize;
        }
    
        get camres(): number {
            return this._camres;
        }
    
        get price(): number {
            return this._price;
        }
    
        set id(value: string) {
            this._id = value;
        }
    
        set name(value: string) {
            this._name = value;
        }
    
        set producername(value: string) {
            this._producername = value;
        }
    
        set osname(value: string) {
            this._osname = value;
        }
    
        set ramsize(value: number) {
            this._ramsize = value;
        }
    
        set memsize(value: number) {
            this._memsize = value;
        }
    
        set camres(value: number) {
            this._camres = value;
        }
    
        set price(value: number) {
            this._price = value;
        }
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
            const pda = PhoneDA.fromService(phone);
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
                    pda.name,
                    pda.producername,
                    pda.osname,
                    pda.ramsize,
                    pda.memsize,
                    pda.camres,
                    pda.price,
                ]
            );
    
            const phoneCreated = new PhoneDA(
                result.rows[0].id,
                result.rows[0].name,
                result.rows[0].producername,
                result.rows[0].osname,
                result.rows[0].ramsize,
                result.rows[0].memsize,
                result.rows[0].camres,
                result.rows[0].price,
            );
    
            return phoneCreated.toService();
        } finally {
            client.release();
        }
    }
    

    async update(phone: Phone): Promise<Phone | null> {
        try {
            const client = await this.pool.connect();
            const pda = PhoneDA.fromService(phone);
            const fields: string[] = [];
            const values: any[] = [];
    
            if (pda.name !== "") {
                fields.push('name = $' + (fields.length + 1));
                values.push(pda.name);
            }
            if (pda.producername !== "") {
                fields.push('producername = $' + (fields.length + 1));
                values.push(pda.producername);
            }
            if (pda.osname !== "") {
                fields.push('osname = $' + (fields.length + 1));
                values.push(pda.osname);
            }
            if (pda.ramsize > 0) {
                fields.push('ramsize = $' + (fields.length + 1));
                values.push(pda.ramsize);
            }
            if (pda.memsize > 0) {
                fields.push('memsize = $' + (fields.length + 1));
                values.push(pda.memsize);
            }
            if (pda.camres > 0) {
                fields.push('camres = $' + (fields.length + 1));
                values.push(pda.camres);
            }
            if (pda.price > 0) {
                fields.push('price = $' + (fields.length + 1));
                values.push(pda.price);
            }
            
            values.push(pda.id);
    
            const query = `
                UPDATE phones 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $${values.length} 
                RETURNING *`;
    
            const result = await client.query<PhoneDA>(query, values);
    
            client.release();

            if (result.rows.length === 0) {
                throw new NotFoundError('Телефон не найден');
            }

            let phoneUpdated = new PhoneDA(
                result.rows[0].id,
                result.rows[0].name,
                result.rows[0].producername,
                result.rows[0].osname,
                result.rows[0].ramsize,
                result.rows[0].memsize,
                result.rows[0].camres,
                result.rows[0].price,
            );
            return phoneUpdated.toService();
        } catch (error: any) {
            console.error('Ошибка при обновлении телефона:', error.message);
            return null;
        }
    }

    async getById(id: string): Promise<Phone | null> {
        try {
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
            let phoneGetted = new PhoneDA(
                result.rows[0].id,
                result.rows[0].name,
                result.rows[0].producername,
                result.rows[0].osname,
                result.rows[0].ramsize,
                result.rows[0].memsize,
                result.rows[0].camres,
                result.rows[0].price,
            );
            return phoneGetted.toService();
        } catch (error: any) {
            console.error('Ошибка при поиске телефона по ID:', error.message);
            return null;
        }
    }

    async delete(phoneId: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            await client.query(
                `DELETE FROM phones WHERE id = $1`,
                [phoneId]
            );
            return true;
        } catch (error: any) {
            return false;
        } finally {
            client.release();
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
    
        if (props.minramsize !== undefined && props.minramsize >= 0) {
            conditions.push(`ramsize >= $${values.length + 1}`);
            values.push(props.minramsize);
        }
    
        if (props.maxramsize !== undefined && props.maxramsize > 0) {
            conditions.push(`ramsize <= $${values.length + 1}`);
            values.push(props.maxramsize);
        }
    
        if (props.minmemsize !== undefined && props.minmemsize >= 0) {
            conditions.push(`memsize >= $${values.length + 1}`);
            values.push(props.minmemsize);
        }
    
        if (props.maxmemsize !== undefined && props.maxmemsize > 0) {
            conditions.push(`memsize <= $${values.length + 1}`);
            values.push(props.maxmemsize);
        }
    
        if (props.mincamres !== undefined && props.mincamres >= 0) {
            conditions.push(`camres >= $${values.length + 1}`);
            values.push(props.mincamres);
        }
    
        if (props.maxcamres !== undefined && props.maxcamres > 0) {
            conditions.push(`camres <= $${values.length + 1}`);
            values.push(props.maxcamres);
        }
    
        if (props.minPrice !== undefined && props.minPrice >= 0) {
            conditions.push(`price >= $${values.length + 1}`);
            values.push(props.minPrice);
        }
    
        if (props.maxPrice !== undefined && props.maxPrice > 0) {
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
                    new PhoneDA(
                        result.rows[i].id,
                        result.rows[i].name,
                        result.rows[i].producername,
                        result.rows[i].osname,
                        result.rows[i].ramsize,
                        result.rows[i].memsize,
                        result.rows[i].camres,
                        result.rows[i].price,
                    ).toService()
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