import { User } from "../models/UserModel"
import { Pool } from 'pg';
import * as conf from '../../config'
import { BadRequestError, NotFoundError } from "../errors/requestErrors";
import { userRole } from "../models/userTypes";


interface IUserRepository{
    create(user: User): Promise<User>
	update(user: User): Promise<User | null>
	authenticate(login: string, password: string): Promise<User | null>
	getByEmail(email: string): Promise<User | null>
	getById(id: string): Promise<User | null>
	delete(id: string): Promise<boolean>
}

export class UserDA {
    private _id = "";
    get id(): string{
        return this._id;
    }
    set id(idToSet: string){
        this._id = idToSet;
    }

    private _email = "";
    get email(): string{
        return this._email;
    }
    set email(nameToSet: string){
        this._email = nameToSet;
    }

    private _phone_number = "";
    get phone_number(): string{
        return this._phone_number;
    }
    set phone_number(phone_numberToSet: string){
        this._phone_number = phone_numberToSet;
    }

    private _name = "";
    get name(): string{
        return this._name;
    }
    set name(nameToSet: string){
        this._name = nameToSet;
    }

    private _password = "";
    get password(): string{
        return this._password;
    }
    set password(passwordToSet: string){
        this._password = passwordToSet;
    }

    private _role: userRole = userRole.UserRoleCustomer;
    get role(): userRole{
        return this._role;
    }
    set role(userRoleToSet: userRole){
        this._role = userRoleToSet;
    }

    constructor(id: string, name: string, email: string, password: string, phone_number: string,
    role: userRole){
        this._id = id;
        this._name = name;
        this._email = email;
        this._password = password;
        this._phone_number = phone_number;
        this._role = role;
    }

    public static fromServce(user: User): UserDA{
        return new UserDA(
            user.id,
            user.name,
            user.email,
            user.password, 
            user.phone_number,
            user.role
        )
    }

    public toService(): User{
        return new User(
            this.id,
            this.name,
            this.email,
            this.password,
            this.phone_number,
            this.role,
        )
    }
}

export class PostgresUserRepository implements IUserRepository {
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
                `SELECT to_regclass('public.users')`
            );

            if (!result.rows[0].to_regclass) {
                // Если таблица не существует, создаем ее
                await client.query(
                    `CREATE TABLE users (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(64) NOT NULL,
                        email VARCHAR(64) NOT NULL,
                        password TEXT NOT NULL,
                        phone_number VARCHAR(30) NOT NULL,
                        role INT NOT NULL CHECK (role >= 0 AND role <= 2),
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )`
                );
                console.log('Таблица пользователей создана');
            } else {
                console.log('Таблица пользователей уже существует');
            }
        } catch (error: any) {
            console.error('Ошибка при проверке таблицы пользователей:', error.message);
        } finally {
            client.release();
        }
    }

    async create(user: User): Promise<User> {
            const client = await this.pool.connect();
            const uda = UserDA.fromServce(user);
            const result = await client.query<User>(
                `INSERT INTO users (name, email, password, phone_number, role) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [uda.name, uda.email, uda.password, uda.phone_number, uda.role]
            );


            client.release();

            let toParse = result.rows[0];
            let userCreated = new UserDA(
                toParse.id, 
                toParse.name,
                toParse.email,
                toParse.password,
                toParse.phone_number,
                toParse.role
            )
            return userCreated.toService();
    }

    async update(user: User): Promise<User | null> {
        try {
            const client = await this.pool.connect();
    
            const uda = UserDA.fromServce(user);
            const fields: string[] = [];
            const values: any[] = [];
    
            if (uda.name !== "") {
                fields.push('name = $' + (fields.length + 1));
                values.push(uda.name);
            }
            if (uda.email !== "") {
                fields.push('email = $' + (fields.length + 1));
                values.push(uda.email);
            }
            if (uda.password !== "") {
                fields.push('password = $' + (fields.length + 1));
                values.push(uda.password);
            }
            if (uda.phone_number !== "") {
                fields.push('phone_number = $' + (fields.length + 1));
                values.push(uda.phone_number);
            }
            
            values.push(uda.id);
    
            const query = `
                UPDATE users 
                SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $${values.length} 
                RETURNING *`;
    
            const result = await client.query<UserDA>(query, values);
    
            client.release();
    
            if (result.rows.length === 0) {
                throw new NotFoundError('UserNotFound');
            }
    
            const toParse = result.rows[0];
            const userUpdated = new UserDA(
                toParse.id, 
                toParse.name,
                toParse.email,
                toParse.password,
                toParse.phone_number,
                toParse.role
            );
            return userUpdated.toService();
        } catch (error: any) {
            return null;
        }
    }

    async authenticate(login: string, password: string): Promise<User | null> {
        try {
            // Валидация входных данных
            if (!login || !password) {
                throw new Error('Не указан email или пароль');
            }

            const client = await this.pool.connect();
            
            const result = await client.query<User>(
                `SELECT * FROM users WHERE email = $1`,
                [login]
            );

            client.release();

            const toParse = result.rows[0];

            const userAuth = new UserDA(
                toParse.id, 
                toParse.name,
                toParse.email,
                toParse.password,
                toParse.phone_number,
                toParse.role
            );

            if (!userAuth) {
                throw new Error('Пользователь не найден');
            }

            if (userAuth.password !== password) {
                throw new Error('Неверный пароль');
            }

            return userAuth.toService();
        } catch (error: any) {
            console.error('Ошибка аутентификации:', error.message);
            return null;
        }
    }

    async getByEmail(email: string): Promise<User | null> {
        try {
            if (!email) {
                throw new Error('Email не указан');
            }

            const client = await this.pool.connect();
            
            const result = await client.query<User>(
                `SELECT * FROM users WHERE email = $1`,
                [email]
            );

            client.release();

            if (result.rows.length === 0) {
                throw new Error('Пользователь с указанным email не найден');
            }

            let toParse = result.rows[0];
            let userGetted = new UserDA(
                toParse.id, 
                toParse.name,
                toParse.email,
                toParse.password,
                toParse.phone_number,
                toParse.role
            )
            return userGetted.toService();
        } catch (error: any) {
            console.error('Ошибка при поиске пользователя по email:', error.message);
            return null;
        }
    }

    async getById(id: string): Promise<User | null> {
        try {
            // Валидация входных данных
            if (!id) {
                throw new Error('ID пользователя не указан');
            }

            const client = await this.pool.connect();
            
            const result = await client.query<User>(
                `SELECT * FROM users WHERE id = $1`,
                [parseInt(id)]
            );

            client.release();

            if (result.rows.length === 0) {
                throw new Error('Пользователь с указанным ID не найден');
            }

            let toParse = result.rows[0];
            let userGetted = new UserDA(
                toParse.id, 
                toParse.name,
                toParse.email,
                toParse.password,
                toParse.phone_number,
                toParse.role
            )
            return userGetted.toService();
        } catch (error: any) {
            console.error('Ошибка при поиске пользователя по ID:', error.message);
            return null;
        }
    }
	async delete(id: string): Promise<boolean> {
        try {
            // Проверка, что ID пользователя указан
            if (!id) {
                throw new Error('ID пользователя не указан');
            }

            const client = await this.pool.connect();
            
            await client.query(
                `DELETE FROM users WHERE id = $1`,
                [id]
            );

            client.release();

            return true;
        } catch (error: any) {
            console.error('Ошибка при удалении пользователя:', error.message);
            return false;
        }
    }
}




export { IUserRepository }