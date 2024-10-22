import { returnDTO, createDTO} from "../dto/WishDTO";

export class Wish {
    private _id = "";
    get id(): string{
        return this._id;
    }
    set id(idToSet: string){
        this._id = idToSet;
    }

    private _userid = "";
    get userid(): string{
        return this._userid;
    }
    set userid(idToSet: string){
        this._userid = idToSet;
    }

    private _productid = "";
    get productid(): string{
        return this._productid;
    }
    set productid(idToSet: string){
        this._productid = idToSet;
    }

    constructor(id: string, userid: string, productid: string){
        this._id = id;
        this._userid = userid;
        this._productid = productid;
    }

    public toDTO(): returnDTO{
        return {
            id: this.id,
            userId: this.userid,
            productId: this.productid
        }
    }
}