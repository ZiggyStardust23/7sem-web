import { IPhoneRepository } from "../pgRepository/PhoneRepository";
import { Phone } from "../models/PhoneModel";
import { phoneCreateDTO, phoneFullDTO, phoneSearchDTO, returnPhoneDTO } from "../dto/PhoneDTO";
import { NotFoundError } from "../errors/requestErrors";

export interface IPhoneService {
    findById(id: string): Promise<returnPhoneDTO>;
    paginate(props: Partial<phoneSearchDTO>, pageNumber: number, pageSize: number): Promise<returnPhoneDTO[]>;
    create(phone: phoneCreateDTO): Promise<returnPhoneDTO>;
    update(phone: phoneFullDTO): Promise<returnPhoneDTO>;
    delete(phoneId: string): Promise<boolean>
}

export class PhoneService implements IPhoneService {
    constructor(private phoneRepository: IPhoneRepository) {}

    async findById(id: string): Promise<returnPhoneDTO> {
        const phone = await this.phoneRepository.getById(id);
        if (phone == null){
            throw new NotFoundError("phone not found by id");
        }
        return Promise.resolve(phone.toDTO());
    }

    async paginate(props: Partial<phoneSearchDTO>, pageNumber: number, pageSize: number): Promise<returnPhoneDTO[]> {
        const phones =  await this.phoneRepository.paginate(props, pageNumber, pageSize);
        if (phones.length == 0){
            return Promise.reject(new Error("not found by this props"));
        }
        const phonesToReturn: returnPhoneDTO[] = [];
        for (let i = 0; i < phones.length; i++){
            phonesToReturn.push(phones[i].toDTO());
        }
        return Promise.resolve(phonesToReturn);
    }

    async create(phone: Phone): Promise<returnPhoneDTO> {
        const phoneCreated = await this.phoneRepository.create(phone);
        return Promise.resolve(phoneCreated.toDTO());
    }

    async update(phone: Phone): Promise<returnPhoneDTO> {
        const phoneUpdated = await this.phoneRepository.update(phone);
        if (phoneUpdated == null){
            throw new NotFoundError("phone not found in db");
        }
        return Promise.resolve(phoneUpdated.toDTO());
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

