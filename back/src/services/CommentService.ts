import { commentCreateDTO, commentUpdateRateDTO, returnCommentDTO } from "../dto/CommentDTO";
import { InternalServerError, NotFoundError } from "../errors/requestErrors";
import { Comment } from "../models/CommentModel";
import { ICommentRepository } from "../pgRepository/CommentRepository";

export interface ICommentService {
    create(comment: commentCreateDTO): Promise<Comment>;
    findByProductId(productId: string): Promise<Comment[]>;
    updateRate(id: string, liked: boolean): Promise<Comment>;
    delete(commentId: string): Promise<boolean>;
}

export class CommentService implements ICommentService {
    constructor(private commentRepository: ICommentRepository) {}

    public async create(comment: Comment): Promise<Comment> {
        const commentCreated = await this.commentRepository.create(comment);
        return Promise.resolve(commentCreated);
    }

    public async findByProductId(productId: string): Promise<Comment[]> {
        const comments = await this.commentRepository.getByProductId(productId);
        if (comments.length == 0){
            throw new NotFoundError("comments not found by this product id");
        }
        return Promise.resolve(comments);
    }

    public async updateRate(id: string, liked: boolean): Promise<Comment> {
        const checkComment = await this.commentRepository.getById(id);
        if (checkComment == null) {
            throw new NotFoundError("comment to update not found");
        }

        checkComment.rate = liked ? checkComment.rate + 1 : checkComment.rate - 1; 
        const commentUpdated = await this.commentRepository.update(checkComment);
        if (!commentUpdated) {
            throw new InternalServerError("comment found but error occured");
        }
        return Promise.resolve(commentUpdated);
    }

    public async delete(commentId: string): Promise<boolean> {
        const checkComment = await this.commentRepository.getById(commentId);
        if (checkComment == null) {
            throw new NotFoundError("comment to delete not found");
        }
        this.commentRepository.delete(commentId); 
        return true;
    }
}