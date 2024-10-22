import { Wish } from "../models/WishModel";
import { IWishRepository } from "../pgRepository/WishRepository";
import { createDTO, returnDTO } from "../dto/WishDTO";
import * as bcrypt from 'bcrypt';
import { NotFoundError } from "../errors/requestErrors";

export interface IWishService {
    create(wish: createDTO): Promise<returnDTO | Error>
	findByUserId(userId: string): Promise<Wish[]>
	delete(id: string): Promise<boolean>
}

export class WishService implements IWishService {
    constructor(private wishRepository: IWishRepository) {}

    async create(wish: createDTO): Promise<returnDTO | Error> {
        const w = new Wish("", wish.userId, wish.productId);
        const wishCreated = await this.wishRepository.create(w);
        if (wishCreated == null){
            return Promise.resolve ({id: "0", userId: "0", productId: "0"})
        }
        return Promise.resolve (wishCreated.toDTO())
    }

    async findByUserId(userId: string): Promise<Wish[]> {
        const wishGetted = await this.wishRepository.getByUserId(userId);
        if (wishGetted.length == 0){
            throw new NotFoundError("wishes not found by this user id")
        }
        return Promise.resolve(wishGetted)
    }

    async delete(id: string): Promise<boolean>{
        return this.wishRepository.delete(id);
    }
}

