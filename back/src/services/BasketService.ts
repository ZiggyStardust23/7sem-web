import { IBasketRepository } from '../pgRepository/BasketRepository';
import { Basket, BasketPosition } from '../models/BasketModel';
import { returnBasketDTO, updateBasketDTO } from '../dto/BasketDTO';
import { NotFoundError } from '../errors/requestErrors';

export interface IBasketService {
    findByUserId(userId: string): Promise<Basket>;
    create(userId: string): Promise<returnBasketDTO>;
    clear(basketId: string): Promise<boolean>;
    calculateTotalPrice(basketId: string): Promise<number | Error>;
    addProductsToBasket(basket: updateBasketDTO): Promise<returnBasketDTO | Error>;
    removeProductsFromBasket(basket: updateBasketDTO): Promise<returnBasketDTO | Error>;
}

export class BasketService implements IBasketService {
    constructor(private basketRepository: IBasketRepository) {}

    public async create(userId: string): Promise<returnBasketDTO> {
        const basketCreated = await this.basketRepository.create(userId);
        return Promise.resolve(basketCreated.toDTO());
    }

    public async findByUserId(userId: string): Promise<Basket> {
        console.log(userId)
        const basketGetted = await this.basketRepository.getByuserid(userId);
        if (basketGetted == null){
            throw new NotFoundError("basket not found by id");
        }
        return Promise.resolve(basketGetted);
    }

    public async clear(basketId: string): Promise<boolean> {
        return this.basketRepository.clearBasket(basketId);
    }

    public async calculateTotalPrice(basketId: string): Promise<number | Error> {
        const checkBasket = await this.basketRepository.getById(basketId);
        if (checkBasket == null){
            return Promise.reject(new Error("basket not found by id"));
        }
        return this.basketRepository.calculateTotalPrice(basketId);
    }

    public async addProductsToBasket(basket: updateBasketDTO): Promise<returnBasketDTO | Error> {
        const checkBasket = await this.basketRepository.getById(basket.id);
        if (checkBasket == null){
            return Promise.reject(new Error("basket not found by id"));
        }
        //Чтобы одинаковые позиции не попадали в basket
        let filteredPositions = basket.positions.filter(function(pos) {
            for (let dbPos of checkBasket.positions){
                if (dbPos.phoneId == pos.productId && dbPos.productsAmount == pos.productsAmount){
                    return false;
                }
            }
            return true;
        })
        for (let pos of filteredPositions){
            checkBasket.positions.push(new BasketPosition("", basket.id, pos.productId, pos.productsAmount));
        }
        
        const basketUpdated = await this.basketRepository.update(checkBasket);
        if (basketUpdated == null){
            return Promise.reject(new Error("basket not updated, error occured"));
        }

        return Promise.resolve(basketUpdated.toDTO());
    }

    public async removeProductsFromBasket(basket: updateBasketDTO): Promise<returnBasketDTO | Error> {
        const checkBasket = await this.basketRepository.getById(basket.id);
        if (checkBasket == null){
            return Promise.reject(new Error("basket not found by id"));
        }
        checkBasket.positions = checkBasket.positions.filter(function(pos) {
            for (let delPos of basket.positions){
                if (delPos.productId == pos.phoneId && delPos.productsAmount == pos.productsAmount){
                    return false;
                }
            }
            return true;
        })

        const basketUpdated = await this.basketRepository.update(checkBasket);
        if (basketUpdated == null){
            return Promise.reject(new Error("basket not updated, error occured"));
        }

        return Promise.resolve(basketUpdated.toDTO());
    }
}

export { BasketPosition, Basket };
