import { returnPaymentDTO } from "../dto/PaymentDTO";

export class Payment {
    private _id: string;
    private _orderId: string;
    private _status: boolean;
    private _sum: number;
    
    constructor (id: string, orderId: string, status: boolean, sum: number){
        this._id = id;
        this._orderId = orderId;
        this._status = status;
        this._sum = sum;
    }

    get id(): string {
        return this._id;
    }
    set id(id: string) {
        this._id = id;
    }
    get orderId(): string {
        return this._orderId;
    }
    set orderId(orderId: string) {
        this._orderId = orderId;
    }
    get status(): boolean {
        return this._status;
    }
    set status(status: boolean) {
        this._status = status;
    }
    get sum(): number {
        return this._sum;
    }
    set sum(sum: number) {
        this._sum = sum;
    }

    public toDTO(): returnPaymentDTO{
        return {
            id: this.id,
            orderId: this.orderId,
            status: this.status,
            sum: this.sum
        }
    }
}
