import { OrderStatus, returnOrderDTO, returnOrderPositionDTO } from "../dto/OrderDTO";

export class Order {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _userid: string;
    public get userid(): string {
        return this._userid;
    }
    public set userid(value: string) {
        this._userid = value;
    }
    private _status: OrderStatus;
    public get status(): OrderStatus {
        return this._status;
    }
    public set status(value: OrderStatus) {
        this._status = value;
    }
    private _address: string;
    public get address(): string {
        return this._address;
    }
    public set address(value: string) {
        this._address = value;
    }
    private _date: Date;
    public get date(): Date {
        return this._date;
    }
    public set date(value: Date) {
        this._date = value;
    }
    private _positions: OrderPosition[];
    public get positions(): OrderPosition[] {
        return this._positions;
    }
    public set positions(value: OrderPosition[]) {
        this._positions = value;
    }
    constructor (
        id: string, 
        userid: string,
        status: OrderStatus,
        adress: string,
        date: Date,
        positions: OrderPosition[]
    ){
        this._id = id;
        this._userid = userid;
        this._status = status;
        this._address = adress;
        this._date = date;
        this._positions = positions;
    }

    public toDTO(): returnOrderDTO{
        const orderPositionsDTO: returnOrderPositionDTO[] = [];
        for (let i = 0; i < this.positions.length; i++){
            orderPositionsDTO.push(this.positions[i].toDTO());
        }
        return {
            id: this.id,
            userid: this.userid,
            status: this.status,
            address: this.address,
            date: this.date,
            positions: orderPositionsDTO,
        }
    }
}

export class OrderPosition {
    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    private _orderId: string;
    public get orderId(): string {
        return this._orderId;
    }
    public set orderId(value: string) {
        this._orderId = value;
    }
    private _productId: string;
    public get productId(): string {
        return this._productId;
    }
    public set productId(value: string) {
        this._productId = value;
    }
    private _productsAmount: number;
    public get productsAmount(): number {
        return this._productsAmount;
    }
    public set productsAmount(value: number) {
        this._productsAmount = value;
    }

	constructor(id: string, orderId: string, productId: string, productsAmount: number) {
        this._id = id;
        this._orderId = orderId;
        this._productId = productId;
        this._productsAmount = productsAmount;
	}

    public toDTO(): returnOrderPositionDTO{
        return {
            id: this.id,
            orderId: this.orderId,
            productId: this.productId,
            productsAmount: this.productsAmount,    
        }
    }
    
}
export { OrderStatus };

