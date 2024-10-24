import { Request, Response } from 'express';
import { NotFoundError } from '../errors/requestErrors';
import { PaymentService } from '../services/PaymentService';
import { Payment } from '../models/PaymentModel';
import { PostgresPaymentRepository } from '../pgRepository/PaymentRepository';

export class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService(new PostgresPaymentRepository());
    }

    async createPayment(req: Request, res: Response) {
        const { orderId } = req.body;
        if (orderId == undefined || orderId == "") {
            return res.status(400).json({ error: "Bad Request" });
        }
        try {
            const paymentToCreate = new Payment("", orderId, true, 0);
            const payment = await this.paymentService.create(paymentToCreate);
            res.status(200).json(payment);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async getPaymentById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const payment = await this.paymentService.findById(id);
            res.status(200).json(payment);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async updatePayment(req: Request, res: Response) {
        const id = req.params.id;
        const { status } = req.body;
        if (status == undefined) {
            return res.status(400).json({ error: "Bad Request" });
        }
        try {
            const payment = await this.paymentService.update(id, status);
            res.status(200).json(payment);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async deletePayment(req: Request, res: Response) {
        const id = req.params.id;

        try {
            await this.paymentService.delete(id);
            res.status(204).json();
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }
}
