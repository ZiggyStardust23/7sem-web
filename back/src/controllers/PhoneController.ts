import { Request, Response } from 'express';
import { NotFoundError, BadRequestError } from '../errors/requestErrors';
import {PhoneService} from '../services/PhoneService';
import {CommentService} from '../services/CommentService';
import { Phone } from '../models/PhoneModel';
import { PostgresPhoneRepository } from '../pgRepository/PhoneRepository';
import { PostgresCommentRepository } from '../pgRepository/CommentRepository';
import { returnCommentDTO } from '../dto/CommentDTO';
import { returnPhoneDTO } from '../dto/PhoneDTO';

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
            res.status(200).json(phone.toDTO());
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
            const commentsToReturn: returnCommentDTO[] = [];
            for (let comment of comments){
                commentsToReturn.push(comment.toDTO());
            }
            res.status(200).json({ "comments": commentsToReturn });
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
            res.status(201).json(phone.toDTO());
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
            res.json(phone.toDTO());
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async getPhones(req: Request, res: Response) {
        const str_pageNumber = req.query.pageNumber as string;
        const str_pageSize = req.query.pageSize as string;

        if (str_pageNumber == undefined || str_pageSize == undefined){
            return res.status(400).json({ error: "Bad Request" });
        }

        const str_minramsize = req.query.minramsize as string;
        const str_maxramsize = req.query.maxramsize as string;
        const str_minmemsize = req.query.minmemsize as string;
        const str_maxmemsize = req.query.maxmemsize as string;
        const str_mincamres = req.query.mincamres as string;
        const str_maxcamres = req.query.maxcamres as string;
        const name = req.query.name as string;
        const producername = req.query.producername as string;
        const osname = req.query.osname as string;
        const str_minPrice = req.query.minPrice as string;
        const str_maxPrice = req.query.maxPrice as string;
        let pageNumber = 0;
        let pageSize = 0;
        let maxramsize = 0;
        let minramsize = 0;
        let maxmemsize = 0;
        let minmemsize = 0;
        let mincamres = 0;
        let maxcamres = 0;
        let minPrice = 0;
        let maxPrice = 0;
        try{
            pageNumber = parseInt(str_pageNumber);
            pageSize = parseInt(str_pageSize);
            minramsize = -1;
            if (str_minramsize != undefined){
                minramsize = parseInt(str_minramsize);
            }
            maxramsize = -1;
            if (str_maxramsize != undefined){
                maxramsize = parseInt(str_maxramsize);
            }

            minmemsize = -1;
            if (str_minmemsize != undefined){
                minmemsize = parseInt(str_minmemsize);
            }

            maxmemsize = -1;
            if (str_maxmemsize != undefined){
                maxmemsize = parseInt(str_maxmemsize);
            }

            mincamres = -1;
            if (str_mincamres != undefined){
                mincamres = parseInt(str_mincamres);
            }

            maxcamres = -1;
            if (str_maxcamres != undefined){
                maxcamres = parseInt(str_maxcamres);
            }
            minPrice = -1;
            if (str_minPrice != undefined){
                minPrice = parseInt(str_minPrice);
            }

            maxPrice = -1;
            if (str_maxPrice != undefined){
                maxPrice = parseInt(str_maxPrice);
            }
        } catch (e: any) {
            return res.status(400).json({ error: "Bad Request" });
        }

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
            const phonesToReturn: returnPhoneDTO[] = [];
            for (let i = 0; i < phones.length; i++){
                phonesToReturn.push(phones[i].toDTO());
            }
            res.json(phonesToReturn);
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
