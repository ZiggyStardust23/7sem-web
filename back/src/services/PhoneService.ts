import { IPhoneRepository } from "../pgRepository/PhoneRepository";
import { Phone } from "../models/PhoneModel";
import { phoneCreateDTO, phoneFullDTO, phoneSearchDTO, returnPhoneDTO } from "../dto/PhoneDTO";
import { NotFoundError } from "../errors/requestErrors";

export interface IPhoneService {
    findById(id: string): Promise<Phone>;
    paginate(props: Partial<phoneSearchDTO>, pageNumber: number, pageSize: number): Promise<Phone[]>;
    create(phone: phoneCreateDTO): Promise<Phone>;
    update(phone: phoneFullDTO): Promise<Phone>;
    delete(phoneId: string): Promise<boolean>
}

export class PhoneService implements IPhoneService {
    constructor(private phoneRepository: IPhoneRepository) {}

    async findById(id: string): Promise<Phone> {
        const phone = await this.phoneRepository.getById(id);
        if (phone == null){
            throw new NotFoundError("phone not found by id");
        }
        return Promise.resolve(phone);
    }

    async paginate(props: Partial<phoneSearchDTO>, pageNumber: number, pageSize: number): Promise<Phone[]> {
        console.log(props);
        const phones =  await this.phoneRepository.paginate(props, pageNumber, pageSize);
        if (phones.length == 0){
            return Promise.reject(new Error("not found by this props"));
        }
        return Promise.resolve(phones);
    }

    async create(phone: Phone): Promise<Phone> {
        const phoneCreated = await this.phoneRepository.create(phone);
        return Promise.resolve(phoneCreated);
    }

    async update(phone: Phone): Promise<Phone> {
        const phoneUpdated = await this.phoneRepository.update(phone);
        if (phoneUpdated == null){
            throw new NotFoundError("phone not found in db");
        }
        return Promise.resolve(phoneUpdated);
    }

    async delete(id: string): Promise<boolean>{
        const phone = await this.findById(id)
        if (!phone){
            throw new NotFoundError();
        }
        const result = this.phoneRepository.delete(id);
        return Promise.resolve(true);
    }
}
export { Phone };

