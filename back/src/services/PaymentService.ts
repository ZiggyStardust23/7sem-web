import { paymentUpdateDTO, returnPaymentDTO } from "../dto/PaymentDTO";
import { NotFoundError } from "../errors/requestErrors";
import { Payment } from "../models/PaymentModel";
import { IPaymentRepository } from "../pgRepository/PaymentRepository";

export interface IPaymentService {
    create(payment: Payment): Promise<returnPaymentDTO>;
    update(id: string, status: boolean): Promise<returnPaymentDTO>;
    findById(paymentId: string): Promise<returnPaymentDTO>;
    findByOrderId(orderId: string): Promise<returnPaymentDTO>;
}

export class PaymentService implements IPaymentService {
    constructor(private paymentRepository: IPaymentRepository) {}

    public async create(payment: Payment): Promise<returnPaymentDTO> {
        const paymentCreated = await this.paymentRepository.create(payment);
        if (paymentCreated == null){
            throw new NotFoundError("order not found in db");
        }
        return Promise.resolve(paymentCreated.toDTO());
    }
    
    public async update(id: string, status: boolean): Promise<returnPaymentDTO> {
        const paymentUpdated = await  this.paymentRepository.update(id, status);
        if (paymentUpdated == null){
            return Promise.reject(new Error("not found in db"));
        }
        return Promise.resolve(paymentUpdated.toDTO());
    }

    public async findById(paymentId: string): Promise<returnPaymentDTO> {
        const paymentGetted = await this.paymentRepository.getById(paymentId);
        if (paymentGetted == null){
            throw new NotFoundError("not found in db by id");
        }
        return Promise.resolve(paymentGetted.toDTO())
    }

    public async findByOrderId(orderId: string): Promise<returnPaymentDTO> {
        const paymentGetted = await this.paymentRepository.getByOrderId(orderId);
        if (paymentGetted == null){
            throw new NotFoundError("not found in db by order id");
        }
        return Promise.resolve(paymentGetted.toDTO())
    }

    public async delete(id: string): Promise<boolean> {
        const paymentGetted = await this.paymentRepository.getById(id);
        if (paymentGetted == null){
            throw new NotFoundError("not found in db by id");
        }

        await this.paymentRepository.delete(id);
        return Promise.resolve(true)
    }
}