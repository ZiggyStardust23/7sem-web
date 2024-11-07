import { Request, Response } from 'express';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../errors/requestErrors';
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel';
import { userRole } from '../models/userTypes';
import { IUserRepository, PostgresUserRepository } from '../pgRepository/UserRepository';
import { IBasketRepository, PostgresBasketRepository } from '../pgRepository/BasketRepository';
import { IOrderRepository, PostgresOrderRepository } from '../pgRepository/OrderRepository';
import { IWishRepository, PostgresWishRepository } from '../pgRepository/WishRepository';
import { WishService } from '../services/WishService';
import { OrderService } from '../services/OrderService';
import { BasketService } from '../services/BasketService';
import { UserService } from '../services/UserService';
import { returnOrderDTO } from '../dto/OrderDTO';
import { returnDTO } from '../dto/WishDTO';
const tokenKey = '1a2b-3c4d-5e6f-7g8h';

export class UserController {
    private basketService: BasketService;
    private orderService: OrderService;
    private wishService: WishService;
    private userService: UserService;

    constructor() {
        let userRep: IUserRepository = new PostgresUserRepository();
        this.userService = new UserService(userRep);
        let basketRep: IBasketRepository = new PostgresBasketRepository();
        this.basketService = new BasketService(basketRep);
        let orderRep: IOrderRepository = new PostgresOrderRepository();
        this.orderService = new OrderService(orderRep);
        let wishRep: IWishRepository = new PostgresWishRepository();
        this.wishService = new WishService(wishRep); 
    }
    async getUserBasket(req: Request, res: Response) {
        const userId = req.params.id;

        try {
            const basket = await this.basketService.findByUserId(userId);
            res.status(200).json({
                id: basket.id,
                userid: basket.userId,
                positions: basket.positions
            });
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async getUserOrders(req: Request, res: Response) {
        const userId = req.params.id;

        try {
            const orders = await this.orderService.findByUserId(userId);
            const ordersToReturn: returnOrderDTO[] = [];
            for (let order of orders){
                ordersToReturn.push(order.toDTO());
            }
            res.status(200).json({ "orders": ordersToReturn });
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async getUserWishes(req: Request, res: Response) {
        const userId = req.params.id;

        try {
            const wishGetted = await this.wishService.findByUserId(userId);
            const wishesToReturn: returnDTO[] = [];
            for (let i = 0; i < wishGetted.length; i++){
                wishesToReturn.push(wishGetted[i].toDTO());
            }
            res.status(200).json({ "wishes": wishesToReturn });
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async login(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        console.log(this.userService);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const user = await this.userService.login({ email, password });
            const token = jwt.sign({ id: user.id, role: user.role }, tokenKey);

            res.status(200).json({
                id: user.id,
                email: user.email,
                phone: user.phone_number,
                role: user.role,
                token
            });
        } catch (e: any) {
            if (e instanceof NotFoundError || e instanceof UnauthorizedError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async register(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const { email, name, phone_number, password } = req.body;

        if (!email || !name || !phone_number || !password) {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const newUser = new User("", name, email, password, phone_number, userRole.UserRoleCustomer);
            const user = await this.userService.registration(newUser);
            await this.basketService.create(user.id);

            res.status(201).json(user.toDTO());
        } catch (e: any) {
            if (e instanceof BadRequestError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async createUser(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const { email, name, phone_number, password, role } = req.body;

        if (!email || !name || !phone_number || !password || role === undefined || (role < 0 || role > 2)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const user = await this.userService.createUser(new User("", email, name, phone_number, password, role));
            res.status(201).json(user.toDTO());
        } catch (e: any) {
            if (e instanceof BadRequestError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async updateUser(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const { email, name, phone_number, password } = req.body;
        const userId = req.params.id;

        try {
            const updatedUser = new User(userId, name || "", email || "", password || "", phone_number || "", userRole.UserRoleCustomer);
            const user = await this.userService.updateUser(updatedUser);

            res.status(200).json(user.toDTO());
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}