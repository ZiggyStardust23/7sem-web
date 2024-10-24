import { Request, Response } from 'express';
import { BadRequestError } from '../errors/requestErrors';
import { WishService } from '../services/WishService';
import { Wish } from '../models/WishModel';
import { PostgresWishRepository } from '../pgRepository/WishRepository';

export class WishController {
    private wishService: WishService;
    constructor(){
        this.wishService = new WishService(new PostgresWishRepository());
    }

    async createWish(req: Request, res: Response) {
        const { userId, productId } = req.body;
        if (userId == undefined || userId == "" || productId == undefined || productId == "") {
            return res.status(400).json({ error: "Bad Request" });
        }
        try {
            const wishToCreate = new Wish("", userId, productId);
            const result = await this.wishService.create(wishToCreate);
            res.status(201).json(result);
        } catch (e: any) {
            if (e instanceof BadRequestError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async deleteWish(req: Request, res: Response) {
        const id = req.params.id;

        try {
            await this.wishService.delete(id);
            res.status(204).json();
        } catch (e: any) {
            if (e instanceof BadRequestError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }
}
