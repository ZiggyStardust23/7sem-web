import { Wish } from "../models/WishModel";
import { IWishRepository } from "../pgRepository/WishRepository";
import { createDTO, returnDTO } from "../dto/WishDTO";
import * as bcrypt from 'bcrypt';
import { BadRequestError, NotFoundError } from "../errors/requestErrors";

export interface IWishService {
    create(wish: Wish): Promise<returnDTO>
	findByUserId(userId: string): Promise<returnDTO[]>
	delete(id: string): Promise<boolean>
}

export class WishService implements IWishService {
    constructor(private wishRepository: IWishRepository) {}

    async create(wish: Wish): Promise<returnDTO> {
        const wishCreated = await this.wishRepository.create(wish);
        if (wishCreated == null){
            throw new BadRequestError("wish already exists")
        }
        return Promise.resolve (wishCreated.toDTO())
    }

    async findByUserId(userId: string): Promise<returnDTO[]> {
        const wishGetted = await this.wishRepository.getByUserId(userId);
        if (wishGetted.length == 0){
            throw new NotFoundError("wishes not found by this user id")
        }
        const wishesToReturn: returnDTO[] = [];
        for (let i = 0; i < wishGetted.length; i++){
            wishesToReturn.push(wishGetted[i].toDTO());
        }
        return Promise.resolve(wishesToReturn)
    }

    async delete(id: string): Promise<boolean>{
        const wishGetted = await this.wishRepository.getById(id);
        if (wishGetted == null){
            throw new NotFoundError("wishes not found by this user id")
        }
        await this.wishRepository.delete(id);
        return true;
    }
}

