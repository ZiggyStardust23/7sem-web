import { commentCreateDTO, commentUpdateRateDTO, returnCommentDTO } from "../dto/CommentDTO";
import { Comment } from "../models/CommentModel";
import { ICommentRepository } from "../pgRepository/CommentRepository";

export interface ICommentService {
    create(comment: commentCreateDTO): Promise<returnCommentDTO>;
    findByProductId(productId: string): Promise<returnCommentDTO[] | Error>;
    updateRate(comment: commentUpdateRateDTO): Promise<returnCommentDTO | Error>;
    delete(commentId: string): Promise<boolean>;
}

export class CommentService implements ICommentService {
    constructor(private commentRepository: ICommentRepository) {}

    public async create(comment: commentCreateDTO): Promise<returnCommentDTO> {
        const commentToCreate = new Comment(
            "",
            comment.userid,
            comment.productId,
            comment.text,
            0
        );
        const commentCreated = await this.commentRepository.create(commentToCreate);
        return Promise.resolve(commentCreated.toDTO());
    }

    public async findByProductId(productId: string): Promise<returnCommentDTO[] | Error> {
        const productsGetted = await this.commentRepository.getByProductId(productId);
        if (productsGetted.length == 0){
            return Promise.reject(new Error("comments not found by this product id"));
        }
        const productsDTOToReturn: returnCommentDTO[] = [];
        for (let p of productsGetted){
            productsDTOToReturn.push(p.toDTO());
        }
        return Promise.resolve(productsDTOToReturn);
    }

    public async updateRate(comment: commentUpdateRateDTO): Promise<returnCommentDTO | Error> {
        const checkComment = await this.commentRepository.getById(comment.id);
        if (!checkComment) {
            return Promise.reject(new Error("comment to update not found"));
        }
        checkComment.rate = comment.rate;
        const commentUpdated = await this.commentRepository.update(checkComment);
        if (!commentUpdated) {
            return Promise.reject(new Error("comment found but error occured"));
        }
        return Promise.resolve(commentUpdated.toDTO());
    }

    public async delete(commentId: string): Promise<boolean> {
        return this.commentRepository.delete(commentId);
    }
}