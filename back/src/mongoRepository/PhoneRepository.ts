import { MongoClient, ObjectId } from 'mongodb';
import { Phone } from "../models/PhoneModel";
import { phoneFullDTO, phoneSearchDTO } from "../dto/PhoneDTO";
import * as conf from '../../config';

export interface IPhoneRepository {
    getById(id: string): Promise<Phone | null>;
    paginate(props: Partial<phoneFullDTO>, pageNumber: number, pageSize: number): Promise<Phone[]>;
    create(phone: Phone): Promise<Phone>;
    update(phone: Phone): Promise<Phone | null>;
}

export class MongoPhoneRepository implements IPhoneRepository {
    private client: MongoClient;
    private db: any;
    private collection: string = 'phones';

    constructor() {
        this.client = new MongoClient(conf.mongoUrl);
        this.initialize()
    }

    async initialize(): Promise<void> {
        await this.client.connect();
        this.db = this.client.db('ppo');
        await this.ensureCollectionExists();
    }

    async ensureCollectionExists(): Promise<void> {
        const collections = await this.db.listCollections({ name: this.collection }).toArray();
        if (collections.length === 0) {
            await this.db.createCollection(this.collection);
            await this.db.collection(this.collection).createIndex({ name: 1 }, { unique: true });
            console.log('Коллекция телефонов создана');
        } else {
            console.log('Коллекция телефонов уже существует');
        }
    }

    async create(phone: Phone): Promise<Phone> {
        const result = await this.db.collection(this.collection).insertOne({
            name: phone.name,
            producername: phone.producername,
            osname: phone.osname,
            ramsize: phone.ramsize,
            memsize: phone.memsize,
            camres: phone.camres,
            price: phone.price,
            created_at: new Date(),
            updated_at: new Date()
        });

        phone.id = result.insertedId.toString();
        return phone;
    }

    async update(phone: Phone): Promise<Phone | null> {
        const result = await this.db.collection(this.collection).findOneAndUpdate(
            { _id: new ObjectId(phone.id) },
            {
                $set: {
                    name: phone.name,
                    producername: phone.producername,
                    osname: phone.osname,
                    ramsize: phone.ramsize,
                    memsize: phone.memsize,
                    camres: phone.camres,
                    price: phone.price,
                    updated_at: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            throw new Error('Телефон не найден');
        }

        return new Phone(
            result.value._id.toString(),
            result.value.name,
            result.value.producername,
            result.value.osname,
            result.value.ramsize,
            result.value.memsize,
            result.value.camres,
            result.value.price,
        );
    }

    async getById(id: string): Promise<Phone | null> {
        const phone = await this.db.collection(this.collection).findOne({ _id: new ObjectId(id) });

        if (!phone) {
            throw new Error('Телефон не найден');
        }

        return new Phone(
            phone._id.toString(),
            phone.name,
            phone.producername,
            phone.osname,
            phone.ramsize,
            phone.memsize,
            phone.camres,
            phone.price
        );
    }

    async paginate(props: phoneSearchDTO, pageNumber: number, pageSize: number): Promise<Phone[]> {
        const query: any = {};

        if (props.name) {
            query.name = { $regex: props.name, $options: 'i' };
        }
        if (props.producername) {
            query.producername = { $regex: props.producername, $options: 'i' };
        }
        if (props.osname) {
            query.osname = { $regex: props.osname, $options: 'i' };
        }
        if (props.minramsize !== undefined) {
            query.ramsize = { ...query.ramsize, $gte: props.minramsize };
        }
        if (props.maxramsize !== undefined) {
            query.ramsize = { ...query.ramsize, $lte: props.maxramsize };
        }
        if (props.minmemsize !== undefined) {
            query.memsize = { ...query.memsize, $gte: props.minmemsize };
        }
        if (props.maxmemsize !== undefined) {
            query.memsize = { ...query.memsize, $lte: props.maxmemsize };
        }
        if (props.mincamres !== undefined) {
            query.camres = { ...query.camres, $gte: props.mincamres };
        }
        if (props.maxcamres !== undefined) {
            query.camres = { ...query.camres, $lte: props.maxcamres };
        }
        if (props.minPrice !== undefined) {
            query.price = { ...query.price, $gte: props.minPrice };
        }
        if (props.maxPrice !== undefined) {
            query.price = { ...query.price, $lte: props.maxPrice };
        }

        const phones = await this.db.collection(this.collection)
            .find(query)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return phones.map((phone: any) => new Phone(
            phone._id.toString(),
            phone.name,
            phone.producername,
            phone.osname,
            phone.ramsize,
            phone.memsize,
            phone.camres,
            phone.price,
        ));
    }
}
