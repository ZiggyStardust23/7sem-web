import { WishService, IWishService } from "../services/WishService";
import { returnDTO, createDTO } from "../dto/WishDTO";
import { Request, Response } from "express";
import { Wish } from "../models/WishModel";

export interface IWishController {
    handleCreate(req: Request, res: Response): Promise<void>;
    handleFind(req: Request, res: Response): Promise<returnDTO[] | void>;
    handleDelete(req: Request, res: Response): Promise<boolean>;
}

export class WishController implements IWishController {
    private wishService: IWishService;

    constructor(wishService: IWishService) {
        this.wishService = wishService;
    }

    async handleCreate(req: Request, res: Response): Promise<void> {
        try {
            const { userId, productId } = req.body;
            const create: createDTO = { userId, productId };
            const wish = await this.wishService.create(create);
            if (wish instanceof Error){
                throw wish;
            }
            res.status(200);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async handleFind(req: Request, res: Response): Promise<returnDTO[] | void> {
        try {
            const { userId } = req.body;
            const das = await this.wishService.findByUserId(userId);
            res.status(200).json(das);
            if (das instanceof Error){
                throw das;
            }
            return Promise.resolve(das)
        } catch (error: any) {
            res.status(400).json({ error: error.message });
            Promise.resolve(null)
        }
    }

    async handleDelete(req: Request, res: Response): Promise<boolean> {
            const { id } = req.body;
            const das = await this.wishService.delete(id);
            res.status(200).json(das);
            return Promise.resolve(das)
    }
}