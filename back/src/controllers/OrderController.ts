import { Request, Response } from 'express';
import { NotFoundError, BadRequestError } from '../errors/requestErrors';
import {OrderService} from '../services/OrderService';
import {PaymentService} from '../services/PaymentService';
import { Order, OrderPosition, OrderStatus } from '../models/OrderModel';
import { PostgresOrderRepository } from '../pgRepository/OrderRepository';
import { PostgresPaymentRepository } from '../pgRepository/PaymentRepository';

export class OrderController {
    private orderService: OrderService;
    private paymentService: PaymentService;

    constructor() {
        this.orderService = new OrderService(new PostgresOrderRepository());
        this.paymentService = new PaymentService(new PostgresPaymentRepository());
    }

    async updateOrder(req: Request, res: Response) {
        const id = req.params.id;
        const { status } = req.body;

        if (status == undefined || status < 0 || status > 3) {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const order = await this.orderService.updateOrderStatus({ id, status });
            res.status(200).json(order);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async deleteOrder(req: Request, res: Response) {
        const id = req.params.id;

        try {
            const order = await this.orderService.deleteOrder(id);
            res.status(204).json(order);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async createOrder(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const { userid, address, positions } = req.body;

        if (!((userid != undefined && userid != "") ||
            (address != undefined && address != "") ||
            (positions != undefined && positions.length > 0))) {
            return res.status(400).json({ error: "Bad Request" });
        }

        var orderPositions: OrderPosition[] = [];

        try {
            for (let pos of positions) {
                if (pos.productId == undefined || pos.productId == "" || pos.productsAmount == undefined || pos.productsAmount <= 0) {
                    throw new BadRequestError("Bad positions for order");
                }
                orderPositions.push(new OrderPosition("", "", pos.productId, pos.productsAmount));
            }
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }

        try {
            const result = await this.orderService.create(new Order("", userid, OrderStatus.PLACED, address, new Date(), orderPositions));
            res.status(201).json(result);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    }

    async getOrder(req: Request, res: Response) {
        const orderId = req.params.id;

        try {
            const order = await this.orderService.findById(orderId);
            res.status(200).json(order);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async getOrderPayment(req: Request, res: Response) {
        const orderId = req.params.id;

        try {
            const payment = await this.paymentService.findByOrderId(orderId);
            res.status(200).json(payment);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }
}
