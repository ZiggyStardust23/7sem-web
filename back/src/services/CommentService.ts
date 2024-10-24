import { commentCreateDTO, commentUpdateRateDTO, returnCommentDTO } from "../dto/CommentDTO";
import { InternalServerError, NotFoundError } from "../errors/requestErrors";
import { Comment } from "../models/CommentModel";
import { ICommentRepository } from "../pgRepository/CommentRepository";

export interface ICommentService {
    create(comment: commentCreateDTO): Promise<returnCommentDTO>;
    findByProductId(productId: string): Promise<returnCommentDTO[]>;
    updateRate(id: string, liked: boolean): Promise<returnCommentDTO>;
    delete(commentId: string): Promise<boolean>;
}

export class CommentService implements ICommentService {
    constructor(private commentRepository: ICommentRepository) {}

    public async create(comment: Comment): Promise<returnCommentDTO> {
        const commentCreated = await this.commentRepository.create(comment);
        return Promise.resolve(commentCreated.toDTO());
    }

    public async findByProductId(productId: string): Promise<returnCommentDTO[]> {
        const comments = await this.commentRepository.getByProductId(productId);
        if (comments.length == 0){
            throw new NotFoundError("comments not found by this product id");
        }
        const commentsToReturn: returnCommentDTO[] = [];
        for (let comment of comments){
            commentsToReturn.push(comment.toDTO());
        }
        return Promise.resolve(commentsToReturn);
    }

    public async updateRate(id: string, liked: boolean): Promise<returnCommentDTO> {
        const checkComment = await this.commentRepository.getById(id);
        if (checkComment == null) {
            throw new NotFoundError("comment to update not found");
        }

        checkComment.rate = liked ? checkComment.rate + 1 : checkComment.rate - 1; 
        const commentUpdated = await this.commentRepository.update(checkComment);
        if (!commentUpdated) {
            throw new InternalServerError("comment found but error occured");
        }
        return Promise.resolve(commentUpdated.toDTO());
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