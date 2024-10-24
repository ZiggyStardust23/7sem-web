import { Request, Response } from 'express';
import { NotFoundError } from '../errors/requestErrors';
import { CommentService } from '../services/CommentService';
import { Comment } from '../models/CommentModel';
import { PostgresCommentRepository } from '../pgRepository/CommentRepository';

export class CommentController {
    private commentService: CommentService;

    constructor(){
        this.commentService = new CommentService(new PostgresCommentRepository());
    }
    async createComment(req: Request, res: Response) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Bad Request" });
        }
        const { phoneId, userId, text } = req.body;

        if (!((phoneId != undefined && phoneId != "") ||
            (userId != undefined && userId != "") ||
            (text != undefined && text != "")
        )) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const commentToCreate = new Comment("", userId, phoneId, text, 0);

        try {
            const commentCreated = await this.commentService.create(commentToCreate);
            res.status(201).json(commentCreated);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    }

    async rateComment(req: Request, res: Response) {
        const id = req.params.id;
        const { liked } = req.body;

        if (liked == undefined) {
            return res.status(400).json({ error: "Bad Request" });
        }

        try {
            const comment = await this.commentService.updateRate(id, liked);
            res.status(200).json(comment);
        } catch (e: any) {
            if (e instanceof NotFoundError) {
                res.status(e.statusCode).json({ error: e.message });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    }

    async deleteComment(req: Request, res: Response) {
        const id = req.params.id;

        try {
            await this.commentService.delete(id);
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