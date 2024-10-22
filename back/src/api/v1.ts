import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {UserService} from '../services/UserService';
import { PostgresUserRepository } from '../pgRepository/UserRepository';
import {PhoneService} from '../services/PhoneService';
import { PostgresPhoneRepository } from '../pgRepository/PhoneRepository';
import {PaymentService} from '../services/PaymentService';
import { PostgresPaymentRepository } from '../pgRepository/PaymentRepository';
import {OrderService} from '../services/OrderService';
import { PostgresOrderRepository } from '../pgRepository/OrderRepository';
import {CommentService} from '../services/CommentService';
import { PostgresCommentRepository } from '../pgRepository/CommentRepository';
import {BasketService} from '../services/BasketService';
import { PostgresBasketRepository } from '../pgRepository/BasketRepository';
import { WishService } from "../services/WishService";
import { PostgresWishRepository } from "../pgRepository/WishRepository";
import { Pool } from "pg";
import * as conf from '../../config'

const app: Express = express();
const PORT = 3000; // Выберите порт, который вы хотите прослушивать
let role: string = "guest";
// Middleware для парсинга JSON-тела запроса
app.use(express.json());
const tokenKey = '1a2b-3c4d-5e6f-7g8h';

// services

let userRep;
let phoneRep;
let paymentRep;
let orderRep;
let commentRep;
let basketRep;
let wishRep;

userRep = new PostgresUserRepository();
phoneRep = new PostgresPhoneRepository();
paymentRep = new PostgresPaymentRepository();
orderRep = new PostgresOrderRepository();
commentRep = new PostgresCommentRepository();
basketRep = new PostgresBasketRepository();
wishRep = new PostgresWishRepository();

const userService = new UserService(userRep);
const phoneService = new PhoneService(phoneRep);
const paymentService = new PaymentService(paymentRep);
const orderService = new OrderService(orderRep);
const commentService = new CommentService(commentRep);
const basketService = new BasketService(basketRep);
const wishService = new WishService(wishRep);

const pool = new Pool({
        user: conf.user,
        password: conf.password,
        host: conf.host,
        port: conf.port,
        database: conf.database
    });
// Обработчик запросов
app.get('/api/users/:id', async (req: Request, res: Response) => {
    const userId = req.params.id; // Получаем id пользователя из URL и преобразуем его в число
    // Поиск пользователя по id
    console.log(userId);
    try{
        const user = await userService.findUserById(userId);
        res.json(user);
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/users/profile', async (req: Request, res: Response) => {
    if (req.headers.authorization){
        const decoded = jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            async (err, payload: any) => {
                if (err) res.status(52)
                else if (payload) {
                    await userService.findUserById(payload.id)
                    .then(async user => {
                        if (user instanceof Error){
                            res.status(500)
                        }
                        else{
                            res.status(200).json({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                phone: user.phone_number
                            })
                        }
                    })
                }
            }
        )
    } 
});

app.post('/api/users/logout', async (req: Request, res: Response) => {
    role = "guest";
    res.json("logout");
});

app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userService.login({ email, password });

        if (user instanceof Error) {
            throw user;
        }

        res.status(200).json({
            id: user.id,
            email: user.email,
            phone: user.phone_number,
            role: user.role,
            token: jwt.sign({id: user.id, role: user.role}, tokenKey)
        });
    } catch (error: any) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users/reg', async (req: Request, res: Response) => {
    const { email, name, phone_number, password } = req.body;

    try{
        const user = await userService.registration({email, name, phone_number, password});
        if (!(user instanceof Error)){
            await basketService.create(user.id);
        }
        res.json(user);
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/users/', async (req: Request, res: Response) => {
    const { email, name, phone_number, password, userrole} = req.body;

    try{
        const user = await userService.createUser({email, name, phone_number, password, role: userrole});
        res.json(user);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/users', async (req: Request, res: Response) => {
    const { id, email, name, phone_number, password, userrole} = req.body;

    try{
        const user = await userService.updateUser({id, email, name, phone_number, password, role: userrole});
        res.json(user);
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/users', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const client = await pool.connect();
        await client.query(`SET ROLE ${role}`);
        try {
            await client.query(
                `DELETE FROM users WHERE id = $1`,
                [id]
            );
            res.json(true);;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    catch(e: any){
        res.json(e);
    }
});

app.get('/api/phones/:id', async (req: Request, res: Response) => {
    const phoneId = req.params.id; // Получаем id пользователя из URL и преобразуем его в число
    
    try{
        const phone = await phoneService.findById(phoneId);
        res.json(phone);
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/phones', async (req: Request, res: Response) => {
    const { 
        name,
        producername,
        osname,
        ramsize,
        memsize,
        camres,
        price,
        } = req.body;

    try{
        const phone = await phoneService.create({
            name,
            producername,
            osname,
            ramsize,
            memsize,
            camres,
            price,
            });
        res.json(phone);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/phones', async (req: Request, res: Response) => {
    const {
        id, 
        name,
        producername,
        osname,
        ramsize,
        memsize,
        camres,
        price} = req.body;

    try{
        const phone = await phoneService.update({id, 
            name,
            producername,
            osname,
            ramsize,
            memsize,
            camres,
            price,
            });
        res.json(phone);
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/phones/paginate', async (req: Request, res: Response) => {
    const { pageNumber, pageSize, minramsize,
        maxramsize,
        minmemsize,
        maxmemsize,
        mincamres,
        maxcamres,
        name,
        producername,
        osname,
        minPrice,
        maxPrice} = req.body;
    try{
        const phones = await phoneService.paginate({
        minramsize,
        maxramsize,
        minmemsize,
        maxmemsize,
        mincamres,
        maxcamres,
        name,
        producername,
        osname,
        minPrice,
        maxPrice
        }, pageNumber, pageSize);
        res.json(phones);
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/phones', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const client = await pool.connect();
        await client.query(`SET ROLE ${role}`);
        try {
            await client.query(
                `DELETE FROM phones WHERE id = $1`,
                [id]
            );
            res.json(true);;
        } catch (error) {
            console.error('Error deleting phone:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/orders/', async (req: Request, res: Response) => {
    const {address, positions} = req.body;
    if (req.headers.authorization){
        const decoded = jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            async (err, payload: any) => {
                if (err) res.status(52)
                else if (payload) {
                    await orderService.create({userid: payload.id, address, positions})
                    .then(async order => {
                        if (order instanceof Error){
                            res.status(500)
                        }
                        else{
                            res.status(200).json({
                            })
                        }
                    })
                }
            }
        )
    }
});

app.get('/api/orders/:id', async (req: Request, res: Response) => {
    const orderId = req.params.id;
    try{
        const order = await orderService.findById(orderId);
        res.json(order);
    }
    catch(e: any){
        res.json(e);
    }
});

app.get('/api/orders', async (req: Request, res: Response) => {
    const {address, positions} = req.body;
    if (req.headers.authorization){
        const decoded = jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            async (err, payload: any) => {
                if (err) res.status(52)
                else if (payload) {
                    await orderService.findByUserId(payload.id)
                    .then(async _orders => {
                        if (_orders instanceof Error){
                            res.status(500)
                        }
                        else{
                            res.status(200).json({
                                orders: _orders
                            })
                        }
                    })
                }
            }
        )
    }
});

app.put('/api/orders/status', async (req: Request, res: Response) => {
    const { id, status} = req.body;

    try{
        const order = await orderService.updateOrderStatus({id, status});
        res.json(order);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/orders/add', async (req: Request, res: Response) => {
    const { id, positions} = req.body;

    try{
        const order = await orderService.addPositionsToOrder({id, positions});
        res.json(order);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/orders/remove', async (req: Request, res: Response) => {
    const { id, positions} = req.body;

    try{
        const order = await orderService.removePositionsFromOrder({id, positions});
        res.json(order);
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/orders', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const client = await pool.connect();
        await client.query(`SET ROLE ${role}`);
        try {
            await client.query(
                `DELETE FROM orders WHERE id = $1`,
                [id]
            );
            res.json(true);;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/orders/rempos', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const client = await pool.connect();
        await client.query(`SET ROLE ${role}`);
        try {
            await client.query(
                `DELETE FROM positions WHERE id = $1`,
                [id]
            );
            res.json(true);;
        } catch (error) {
            console.error('Error deleting position:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    catch(e: any){
        res.json(e);
    }
});

app.get('/api/payments/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    try{
        const payment = await paymentService.findById(id);
        res.json(payment);
    }
    catch(e: any){
        res.json(e);
    }
});

app.get('/api/payments', async (req: Request, res: Response) => {
    const orderId = req.query.orderId as string;

    try{
        const payment = await paymentService.findByOrderId(orderId);
        res.json(payment);
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/payments', async (req: Request, res: Response) => {
    const orderId = req.query.orderId as string;

    try{
        const payment = await paymentService.create(orderId);
        res.json(payment);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/payments', async (req: Request, res: Response) => {
    const { id, orderId, status, sum} = req.body;

    try{
        const payment = await paymentService.update({id, orderId, status, sum});
        res.json(payment);
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/payments', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const client = await pool.connect();
        await client.query(`SET ROLE ${role}`);
        try {
            await client.query(
                `DELETE FROM payments WHERE id = $1`,
                [id]
            );
            res.json(true);;
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/baskets', async (req: Request, res: Response) => {
    const userId = req.query.userid as string;

    try{
        const order = await basketService.create(userId);
        res.json(order);
    }
    catch(e: any){
        res.json(e);
    }
});

app.get('/api/baskets', async (req: Request, res: Response) => {
    if (req.headers.authorization){
        const decoded = jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            async (err, payload: any) => {
                if (err) res.status(52)
                else if (payload) {
                    await basketService.findByUserId(payload.id)
                    .then(async basket => {
                        if (basket instanceof Error){
                            res.status(500)
                        }
                        else{
                            res.status(200).json({
                                id: basket.id,
                                userid: basket.userId,
                                positions: basket.positions
                            })
                        }
                    })
                }
            }
        )
    } 
});

app.post('/api/baskets/clear', async (req: Request, res: Response) => {
    const basketId = req.query.basketid as string;

    try{
        const result = await basketService.clear(basketId);
        res.json(result)
    }
    catch(e: any){
        res.json(e);
    }
});

app.get('/api/baskets/price', async (req: Request, res: Response) => {
    const basketId = req.query.basketid as string;

    try{
        const sum = await basketService.calculateTotalPrice(basketId);
        res.json(sum);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/baskets/add', async (req: Request, res: Response) => {
    const {id, positions} = req.body;

    try{
        const basket = await basketService.addProductsToBasket({id, positions});
        res.status(200).json(basket);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/baskets/remove', async (req: Request, res: Response) => {
    const {id, positions} = req.body;

    try{
        const basket = await basketService.removeProductsFromBasket({id, positions});
        res.json(basket);
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/baskets', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const client = await pool.connect();
        await client.query(`SET ROLE ${role}`);
        try {
            await client.query(
                `DELETE FROM baskets WHERE id = $1`,
                [id]
            );
            res.json(true);;
        } catch (error) {
            console.error('Error deleting basket:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/baskets/rempos', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const client = await pool.connect();
        await client.query(`SET ROLE ${role}`);
        try {
            await client.query(
                `DELETE FROM basketpositions WHERE id = $1`,
                [id]
            );
            res.json(true);;
        } catch (error) {
            console.error('Error deleting position:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/comments', async (req: Request, res: Response) => {
    const {productId, text} = req.body;
    if (req.headers.authorization){
        const decoded = jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            async (err, payload: any) => {
                if (err) res.status(52)
                else if (payload) {
                    await commentService.create({userid: payload.id, productId, text})
                    .then(async _orders => {
                        if (_orders instanceof Error){
                            res.status(500)
                        }
                        else{
                            res.status(200)
                        }
                    })
                }
            }
        )
    }
});



app.get('/api/comments', async (req: Request, res: Response) => {
    const productId = req.query.productId as string;

    try{
        const comments = await commentService.findByProductId(productId);
        res.json(comments);
    }
    catch(e: any){
        res.json(e);
    }
});

app.put('/api/comments', async (req: Request, res: Response) => {
    const {id, rate} = req.body;

    try{
        const comment = await commentService.updateRate({id, rate});
        res.json(comment);
    }
    catch(e: any){
        res.json(e);
    }
});

app.delete('/api/comments', async (req: Request, res: Response) => {
    const commentId = req.query.commentId as string;

    try{
        const result = await commentService.delete(commentId);
        res.json(result);
    }
    catch(e: any){
        res.json(e);
    }
});

app.post('/api/wishes', async (req: Request, res: Response) => {
    const {productId} = req.body;
    if (req.headers.authorization){
        const decoded = jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            async (err, payload: any) => {
                if (err) res.status(52)
                else if (payload) {
                    await wishService.create({userId: payload.id, productId: productId})
                    .then(async => {
                        res.status(200)
                    })
                }
            }
        )
    } 
});

app.get('/api/wishes', async (req: Request, res: Response) => {
    if (req.headers.authorization){
        const decoded = jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
            async (err, payload: any) => {
                if (err) res.status(52)
                else if (payload) {
                    await wishService.findByUserId(payload.id)
                    .then(async _wishes => {
                        res.status(200).json({
                            wishes: _wishes
                        })
                    })
                }
            }
        )
    } 
});
app.delete('/api/wishes', async (req: Request, res: Response) => {
    const id = req.query.id as string;

    try{
        const result = await wishService.delete(id);
        res.json(result);
    }
    catch(e: any){
        res.json(e);
    }
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});