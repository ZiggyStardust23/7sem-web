import { IPhoneService } from "../services/PhoneService";
import { Request, Response } from "express";
import { phoneCreateDTO, phoneFullDTO, phoneSearchDTO, returnPhoneDTO } from "../dto/PhoneDTO";

export interface IPhoneController {
    handleFindByIdRequest(req: Request, res: Response): Promise<void>;
    handlePaginateRequest(req: Request, res: Response): Promise<returnPhoneDTO[]>;
    handleCreateRequest(req: Request, res: Response): Promise<void>;
    handleUpdateRequest(req: Request, res: Response): Promise<void>;
}

export class PhoneController implements IPhoneController {
    constructor(private phoneService: IPhoneService) {}

    async handleFindByIdRequest(req: Request, res: Response): Promise<void> {
        const phoneId = req.params.id as string;
        try {
            const phone = await this.phoneService.findById(phoneId);
            res.json(phone);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async handlePaginateRequest(req: Request, res: Response): Promise<returnPhoneDTO[]> {
        const { pageNumber, pageSize, props } = req.body;
        try {
            const phones = await this.phoneService.paginate(
                {
                    minramsize: props.minramsize === undefined ? undefined : +props.minramsize,
                    maxramsize: props.maxramsize === undefined ? undefined : +props.maxramsize,
                    minmemsize: props.minmemsize === undefined ? undefined : +props.minmemsize,
                    maxmemsize: props.maxmemsize === undefined ? undefined : +props.maxmemsize,
                    mincamres: props.mincamres === undefined ? undefined : +props.mincamres,
                    maxcamres: props.maxcamres === undefined ? undefined : +props.maxcamres,
                    name: props.name === undefined ? undefined : props.name.toString(),
                    producername: props.producername === undefined ? undefined : props.producername.toString(),
                    osname: props.osname === undefined ? undefined : props.osname.toString(),
                    minPrice: props.minPrice === undefined ? undefined : +props.minPrice,
                    maxPrice: props.maxPrice === undefined ? undefined : +props.maxPrice
                },
                pageNumber as number,
                pageSize as number
            );
            if (phones instanceof Error){
                throw phones;
            }
            res.json(phones);
            return phones;
        } catch (error: any) {
            res.status(500).json({ error: error.message });
            return [];
        }
    }

    async handleCreateRequest(req: Request, res: Response): Promise<void> {
        const phoneData: phoneCreateDTO = req.body;
        try {
            const createdPhone = await this.phoneService.create(phoneData);
            res.json(createdPhone);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleUpdateRequest(req: Request, res: Response): Promise<void> {
        const phoneData: phoneFullDTO = req.body;
        try {
            const updatedPhone = await this.phoneService.update(phoneData);
            res.json(updatedPhone);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
