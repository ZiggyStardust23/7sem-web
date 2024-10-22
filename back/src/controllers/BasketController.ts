import { Request, Response } from 'express';
import { BasketService, IBasketService } from '../services/BasketService';
import { updateBasketDTO } from '../dto/BasketDTO';

export interface IBasketController {
    handleFindByUserId(req: Request, res: Response): Promise<string | null>;
    handleCreate(req: Request, res: Response): Promise<void>;
    handleClear(req: Request, res: Response): Promise<void>;
    handleCalculateTotalPrice(req: Request, res: Response): Promise<void>;
    handleAddProductsToBasket(req: Request, res: Response): Promise<void>;
    handleRemoveProductsFromBasket(req: Request, res: Response): Promise<void>;
}

export class BasketController implements IBasketController {
    constructor(private basketService: IBasketService) {}

    async handleFindByUserId(req: Request, res: Response): Promise<string | null> {
        const { userId } = req.params;
        try {
            const basket = await this.basketService.findByUserId(userId);
            if (basket instanceof Error){
                throw basket;
            }
            res.status(200).json(basket);
            return Promise.resolve(basket.id);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
            return Promise.resolve(null);
        }
    }

    async handleCreate(req: Request, res: Response): Promise<void> {
        const { userId } = req.body;
        try {
            const basket = await this.basketService.create(userId);
            res.status(201).json(basket);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async handleClear(req: Request, res: Response): Promise<void> {
        const { basketId } = req.params;
        try {
            await this.basketService.clear(basketId);
            res.status(200).json({ message: 'Basket cleared successfully' });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async handleCalculateTotalPrice(req: Request, res: Response): Promise<void> {
        const { basketId } = req.params;
        try {
            const totalPrice = await this.basketService.calculateTotalPrice(basketId);
            res.status(200).json({ totalPrice });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    async handleAddProductsToBasket(req: Request, res: Response): Promise<void> {
        const { id, positions } = req.body as updateBasketDTO;
        try {
            const updatedBasket = await this.basketService.addProductsToBasket({ id, positions });
            res.status(200).json(updatedBasket);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async handleRemoveProductsFromBasket(req: Request, res: Response): Promise<void> {
        const { id, positions } = req.body as updateBasketDTO;
        try {
            const updatedBasket = await this.basketService.removeProductsFromBasket({ id, positions });
            res.status(200).json(updatedBasket);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
