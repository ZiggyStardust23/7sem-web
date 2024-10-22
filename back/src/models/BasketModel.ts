import { returnBasketDTO, returnBasketPositionDTO } from "../dto/BasketDTO";

export class Basket {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _userId: string;
    public get userId(): string {
        return this._userId;
    }
    public set userId(value: string) {
        this._userId = value;
    }
    private _positions: BasketPosition[];
    public get positions(): BasketPosition[] {
        return this._positions;
    }
    public set positions(value: BasketPosition[]) {
        this._positions = value;
    }
    
    constructor(
        id: string,
        userId: string,
        positions: BasketPosition[], 
    ){
        this._id = id;
        this._userId = userId;
        this._positions = positions
    }
    public toDTO(): returnBasketDTO{
        const basketPositionsDTO: returnBasketPositionDTO[] = [];
        for (let i = 0; i < this.positions.length; i++){
            basketPositionsDTO.push(this.positions[i].toDTO());
        }
        return {
            id: this.id,
            userId: this.userId,
            positions: basketPositionsDTO,
        }
    }
}

export class BasketPosition {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _basketId: string;
    public get basketId(): string {
        return this._basketId;
    }
    public set basketId(value: string) {
        this._basketId = value;
    }
    private _phoneId: string;
    public get phoneId(): string {
        return this._phoneId;
    }
    public set phoneId(value: string) {
        this._phoneId = value;
    }
    private _productsAmount: number;
    public get productsAmount(): number {
        return this._productsAmount;
    }
    public set productsAmount(value: number) {
        this._productsAmount = value;
    }
    constructor(
        id: string,
        basketId: string,
        phoneId: string,
        productsAmount: number
    ){
        this._id = id;
        this._basketId = basketId;
        this._phoneId = phoneId;
        this._productsAmount = productsAmount;
    }

    public toDTO(): returnBasketPositionDTO{
        return {
            id: this.id,
            basketId: this.basketId,
            productId: this.phoneId,
            productsAmount: this.productsAmount
        }
    }
};
