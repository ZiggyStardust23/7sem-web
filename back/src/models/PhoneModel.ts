import { returnPhoneDTO } from "../dto/PhoneDTO";

export class Phone {
    private _id: string;
    private _name: string;
    private _producername: string;
    private _osname: string;
    private _ramsize: number;
    private _memsize: number;
    private _camres: number;
    private _price: number;
    constructor(
        id: string,
        name: string,
        producername: string,
        osname: string,
        ramsize: number,
        memsize: number,
        camres: number,
        price: number,
    ) {
        this._id = id;
        this._name = name;
        this._producername = producername;
        this._osname = osname;
        this._ramsize = ramsize;
        this._memsize = memsize;
        this._camres = camres;
        this._price = price;
    }

    public toDTO(): returnPhoneDTO {
        return {
            id: this._id,
            name: this._name,
            producername: this._producername,
            osname: this._osname,
            ramsize: this._ramsize,
            memsize: this._memsize,
            camres: this._camres,
            price: this._price,
        };
    }
        get id(): string {
            return this._id;
        }
    
        get name(): string {
            return this._name;
        }
    
        get producername(): string {
            return this._producername;
        }
    
        get osname(): string {
            return this._osname;
        }
    
        get ramsize(): number {
            return this._ramsize;
        }
    
        get memsize(): number {
            return this._memsize;
        }
    
        get camres(): number {
            return this._camres;
        }
    
        get price(): number {
            return this._price;
        }
    
        set id(value: string) {
            this._id = value;
        }
    
        set name(value: string) {
            this._name = value;
        }
    
        set producername(value: string) {
            this._producername = value;
        }
    
        set osname(value: string) {
            this._osname = value;
        }
    
        set ramsize(value: number) {
            this._ramsize = value;
        }
    
        set memsize(value: number) {
            this._memsize = value;
        }
    
        set camres(value: number) {
            this._camres = value;
        }
    
        set price(value: number) {
            this._price = value;
        }
    }
    
