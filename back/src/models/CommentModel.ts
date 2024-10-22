import { returnCommentDTO } from "../dto/CommentDTO";

export class Comment {
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
    public set userid(value: string) {
        this._userId = value;
    }
    private _productId: string;
    public get productId(): string {
        return this._productId;
    }
    public set productId(value: string) {
        this._productId = value;
    }
    private _text: string;
    public get text(): string {
        return this._text;
    }
    public set text(value: string) {
        this._text = value;
    }
    private _rate: number;
    public get rate(): number {
        return this._rate;
    }
    public set rate(value: number) {
        this._rate = value;
    }

    constructor(
        id: string, 
        userId: string, 
        productId: string,
        text: string,
        rate: number
    ){
        this._id = id;
        this._userId = userId;
        this._productId = productId;
        this._text = text;
        this._rate = rate;
    }

    public toDTO(): returnCommentDTO{
        return {
            id: this.id, 
            userId: this.userId, 
            productId: this.productId,
            text: this.text,
            rate: this.rate   
        }
    }
}
