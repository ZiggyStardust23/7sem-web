import { Request, Response } from 'express';
import { IOrderService } from '../services/OrderService';

export interface IOrderController {
    handleCreateOrderRequest(req: Request, res: Response): Promise<void>;
    handleFindOrderByIdRequest(req: Request, res: Response): Promise<void>;
    handleFindOrdersByUserIdRequest(req: Request, res: Response): Promise<void>;
    handleUpdateOrderStatusRequest(req: Request, res: Response): Promise<void>;
    handleAddPositionsToOrderRequest(req: Request, res: Response): Promise<void>;
    handleRemovePositionsFromOrderRequest(req: Request, res: Response): Promise<void>;
}

export class OrderController implements IOrderController {
    constructor(private orderService: IOrderService) {}

    async handleCreateOrderRequest(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const createdOrder = await this.orderService.create(body);
            res.status(201).json(createdOrder);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async handleFindOrderByIdRequest(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const order = await this.orderService.findById(id);
            res.status(200).json(order);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async handleFindOrdersByUserIdRequest(req: Request, res: Response): Promise<void> {
        const { userid } = req.params;
        try {
            const orders = await this.orderService.findByUserId(userid);
            res.status(200).json(orders);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async handleUpdateOrderStatusRequest(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const updatedOrder = await this.orderService.updateOrderStatus(body);
            res.status(200).json(updatedOrder);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async handleAddPositionsToOrderRequest(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const updatedOrder = await this.orderService.addPositionsToOrder(body);
            res.status(200).json(updatedOrder);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async handleRemovePositionsFromOrderRequest(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const updatedOrder = await this.orderService.removePositionsFromOrder(body);
            res.status(200).json(updatedOrder);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }
}
