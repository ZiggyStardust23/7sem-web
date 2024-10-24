import { IBasketRepository } from '../pgRepository/BasketRepository';
import { Basket, BasketPosition } from '../models/BasketModel';
import { returnBasketDTO, updateBasketDTO } from '../dto/BasketDTO';
import { InternalServerError, NotFoundError } from '../errors/requestErrors';

export interface IBasketService {
    findByUserId(userId: string): Promise<returnBasketDTO>;
    create(userId: string): Promise<returnBasketDTO>;
    clear(basketId: string): Promise<boolean>;
    calculateTotalPrice(basketId: string): Promise<number>;
    addProductsToBasket(id: string, positions: BasketPosition[]): Promise<returnBasketDTO>;
    removeProductsFromBasket(id: string, positions: BasketPosition[]): Promise<returnBasketDTO>;
}

export class BasketService implements IBasketService {
    constructor(private basketRepository: IBasketRepository) {}

    public async create(userId: string): Promise<returnBasketDTO> {
        const basketCreated = await this.basketRepository.create(userId);
        return Promise.resolve(basketCreated.toDTO());
    }

    public async findByUserId(userId: string): Promise<returnBasketDTO> {
        console.log(userId)
        const basketGetted = await this.basketRepository.getByuserid(userId);
        if (basketGetted == null){
            throw new NotFoundError("basket not found by id");
        }
        return Promise.resolve(basketGetted.toDTO());
    }

    public async clear(basketId: string): Promise<boolean> {
        return this.basketRepository.clearBasket(basketId);
    }

    public async calculateTotalPrice(basketId: string): Promise<number> {
        const checkBasket = await this.basketRepository.getById(basketId);
        if (checkBasket == null){
            throw new NotFoundError("basket not found by id");
        }
        return this.basketRepository.calculateTotalPrice(basketId);
    }

    public async addProductsToBasket(id: string, positions: BasketPosition[]): Promise<returnBasketDTO> {
        const checkBasket = await this.basketRepository.getById(id);
        if (checkBasket == null){
            throw new NotFoundError("basket not found by id");
        }

        let filteredPositions = positions.filter(function(pos) {
            for (let dbPos of checkBasket.positions){
                if (dbPos.phoneId == pos.phoneId){
                    dbPos.productsAmount += pos.productsAmount;
                    return false;
                }
            }
            return true;
        })
        for (let pos of filteredPositions){
            checkBasket.positions.push(pos);
        }
        
        const basketUpdated = await this.basketRepository.update(checkBasket);
        if (basketUpdated == null){
            throw new InternalServerError("basket not updated, error occured");
        }

        return Promise.resolve(basketUpdated.toDTO());
    }

    public async removeProductsFromBasket(id: string, positions: BasketPosition[]): Promise<returnBasketDTO> {
        const checkBasket = await this.basketRepository.getById(id);
        if (checkBasket == null){
            throw new NotFoundError("basket not found by id");
        }

        if (positions.length == 0){
            checkBasket.positions = [];
        }
        else{
            checkBasket.positions = checkBasket.positions.filter(function(pos) {
                for (let delPos of positions){
                    if (delPos.phoneId == pos.phoneId ){
                        if(delPos.productsAmount >= pos.productsAmount)
                            return false;
                        else{
                            pos.productsAmount -= delPos.productsAmount;
                            return true;
                        }
                    }
                }
                return true;
            })
        }

        const basketUpdated = await this.basketRepository.update(checkBasket);
        if (basketUpdated == null){
            throw new InternalServerError("basket not updated, error occured");
        }

        return Promise.resolve(basketUpdated.toDTO());
    }
}

export { BasketPosition, Basket };
