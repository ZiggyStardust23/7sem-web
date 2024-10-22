import { Request, Response } from 'express';
import { IPaymentService } from '../services/PaymentService';
import { paymentUpdateDTO } from '../dto/PaymentDTO';

export interface IPaymentController {
    handleCreatePaymentRequest(req: Request, res: Response): Promise<void>;
    handleUpdatePaymentRequest(req: Request, res: Response): Promise<void>;
    handleFindPaymentByIdRequest(req: Request, res: Response): Promise<void>;
    handleFindPaymentByOrderIdRequest(req: Request, res: Response): Promise<void>;
}

export class PaymentController implements IPaymentController {
    constructor(private paymentService: IPaymentService) {}

    async handleCreatePaymentRequest(req: Request, res: Response): Promise<void> {
        const { orderid } = req.body;
        try {
            const createdPayment = await this.paymentService.create(orderid);
            res.status(201).json(createdPayment);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async handleUpdatePaymentRequest(req: Request, res: Response): Promise<void> {
        const { body } = req as { body: paymentUpdateDTO };
        try {
            const updatedPayment = await this.paymentService.update(body);
            res.status(200).json(updatedPayment);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async handleFindPaymentByIdRequest(req: Request, res: Response): Promise<void> {
        const { paymentId } = req.params;
        try {
            const payment = await this.paymentService.findById(paymentId);
            res.status(200).json(payment);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async handleFindPaymentByOrderIdRequest(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;
        try {
            const payment = await this.paymentService.findByOrderId(orderId);
            res.status(200).json(payment);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }
}
