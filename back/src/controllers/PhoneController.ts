import { Request, Response } from 'express';
import { NotFoundError, BadRequestError } from '../errors/requestErrors';
import {PhoneService} from '../services/PhoneService';
import {CommentService} from '../services/CommentService';
import { Phone } from '../models/PhoneModel';
import { PostgresPhoneRepository } from '../pgRepository/PhoneRepository';
import { PostgresCommentRepository } from '../pgRepository/CommentRepository';

export class PhoneController {
    private phoneService: PhoneService;
    private commentService: CommentService;

    constructor() {
        this.phoneService = new PhoneService(new PostgresPhoneRepository());
        this.commentService = new CommentService(new PostgresCommentRepository());
    }

    async getPhone(req: Request, res: Response) {
        const phoneId = req.params.id;

        try {
            const phone = await this.phoneService.findById(phoneId);
            res.status(200).json(phone);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async getPhoneComments(req: Request, res: Response) {
        const phoneId = req.params.id;

        try {
            const comments = await this.commentService.findByProductId(phoneId);
            res.status(200).json({ comments });
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async createPhone(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const { 
            name,
            producername,
            osname,
            ramsize,
            memsize,
            camres,
            price
        } = req.body;

        if (!(name && producername && osname && ramsize > 0 && memsize > 0 && camres > 0 && price > 0)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const phone = await this.phoneService.create(new Phone(
                "",
                name,
                producername,
                osname,
                ramsize,
                memsize,
                camres,
                price
            ));
            res.status(201).json(phone);
        } catch (e: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updatePhone(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const id = req.params.id;

        const {
            name,
            producername,
            osname,
            ramsize,
            memsize,
            camres,
            price
        } = req.body;

        if (
            (ramsize != undefined && ramsize <= 0) ||
            (memsize != undefined && memsize <= 0) ||
            (camres != undefined && camres <= 0) ||
            (price != undefined && price <= 0)
        ) {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const phone = await this.phoneService.update(new Phone(
                id,
                name || "",
                producername || "",
                osname || "",
                ramsize || 0,
                memsize || 0,
                camres || 0,
                price || 0
            ));
            res.json(phone);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async getPhones(req: Request, res: Response) {
        const {
            pageNumber, pageSize, minramsize,
            maxramsize, minmemsize, maxmemsize,
            mincamres, maxcamres, name, producername,
            osname, minPrice, maxPrice
        } = req.body;

        try {
            const phones = await this.phoneService.paginate({
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
        } catch (e: any) {
            res.status(500).json(e);
        }
    }

    async deletePhone(req: Request, res: Response) {
        const id = req.params.id;

        try {
            const result = await this.phoneService.delete(id);
            res.status(204).json(result);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }
}
