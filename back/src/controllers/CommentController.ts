import { ICommentService } from '../services/CommentService';
import { Request, Response } from 'express';
import { commentCreateDTO, commentUpdateRateDTO } from '../dto/CommentDTO';

export interface ICommentController {
    create(req: Request, res: Response): Promise<void>;
    findByProductId(req: Request, res: Response): Promise<void>;
    updateRate(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}

export class CommentController implements ICommentController{
    constructor(private commentService: ICommentService) {}

    async create(req: Request, res: Response) {
        const commentData: commentCreateDTO = req.body;
        try {
            const createdComment = await this.commentService.create(commentData);
            res.status(201).json(createdComment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByProductId(req: Request, res: Response) {
        const productId = req.params.productId;
        try {
            const comments = await this.commentService.findByProductId(productId);
            res.json(comments);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateRate(req: Request, res: Response) {
        const id = req.body.id;
        const rate = req.body.rate;
        const updateData: commentUpdateRateDTO = { id: id, rate };
        try {
            const updatedComment = await this.commentService.updateRate(updateData);
            res.json(updatedComment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        const commentId = req.params.commentId;
        try {
            const result = await this.commentService.delete(commentId);
            res.json({ success: result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
