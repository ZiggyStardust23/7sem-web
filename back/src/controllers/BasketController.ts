import { Request, Response } from 'express';
import { NotFoundError } from '../errors/requestErrors';
import { BasketService } from '../services/BasketService';
import { BasketPosition } from '../models/BasketModel';
import { PostgresBasketRepository } from '../pgRepository/BasketRepository';

export class BasketController {
    private basketService: BasketService;

    constructor() {
        this.basketService = new BasketService(new PostgresBasketRepository());
    }

    async createBasket(req: Request, res: Response) {
        const { userId } = req.body;

        if (userId == undefined || userId == "") {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const basket = await this.basketService.create(userId);
            res.status(201).json(basket.toDTO());
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    }

    async removeProductsFromBasket(req: Request, res: Response) {
        const id = req.params.id;
        const ids = req.query.phoneids as string;
        const amounts = req.query.amounts as string;

        const positions: BasketPosition[] = [];
        if (ids != undefined && amounts != undefined) {
            const idsArr = ids.split(',');
            const amountsArr = amounts.split(',');

            if (idsArr.length != amountsArr.length) {
                return res.status(400).json({ error: "Bad Request" });
            }

            for (let i = 0; i < idsArr.length; i++) {
                positions.push(new BasketPosition("", id, idsArr[i], parseInt(amountsArr[i])));
            }
        }

        try {
            const result = await this.basketService.removeProductsFromBasket(id, positions);
            res.status(200).json(result.toDTO());
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async calculateTotalPrice(req: Request, res: Response) {
        const id = req.params.id;

        try {
            const sum = await this.basketService.calculateTotalPrice(id);
            res.status(200).json(sum);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async addProductsToBasket(req: Request, res: Response) {
        const id = req.params.id;
        const { positions } = req.body;

        if (positions == undefined || positions.length == 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        var basketPositions: BasketPosition[] = [];
        try {
            for (let pos of positions) {
                basketPositions.push(new BasketPosition("", id, pos.phoneId, pos.productsAmount));
            }
        } catch (e: any) {
            return res.status(400).json({ error: "Bad positions" });
        }

        try {
            const basket = await this.basketService.addProductsToBasket(id, basketPositions);
            res.status(200).json(basket.toDTO());
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }
}
