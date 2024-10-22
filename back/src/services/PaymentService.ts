import { paymentUpdateDTO, returnPaymentDTO } from "../dto/PaymentDTO";
import { Payment } from "../models/PaymentModel";
import { IPaymentRepository } from "../pgRepository/PaymentRepository";

export interface IPaymentService {
    create(orderid: string): Promise<returnPaymentDTO>;
    update(payment: paymentUpdateDTO): Promise<returnPaymentDTO | Error>;
    findById(paymentId: string): Promise<returnPaymentDTO | Error>;
    findByOrderId(orderId: string): Promise<returnPaymentDTO | Error>;
}

export class PaymentService implements IPaymentService {
    constructor(private paymentRepository: IPaymentRepository) {}

    public async create(orderid: string): Promise<returnPaymentDTO> {
        const paymentToCreate = new Payment("", orderid, true, 0);
        const paymentCreated = await this.paymentRepository.create(paymentToCreate);
        return paymentCreated.toDTO();
    }
    
    public async update(payment: paymentUpdateDTO): Promise<returnPaymentDTO | Error> {
        const paymentToUpdate = new Payment(payment.id, payment.orderId, payment.status, payment.sum);
        const paymentUpdated = await  this.paymentRepository.update(paymentToUpdate);
        if (paymentUpdated == null){
            return Promise.reject(new Error("not found in db"));
        }
        return Promise.resolve(paymentUpdated.toDTO())
    }

    public async findById(paymentId: string): Promise<returnPaymentDTO | Error> {
        const paymentGetted = await this.paymentRepository.getById(paymentId);
        if (paymentGetted == null){
            return Promise.reject(new Error("not found in db by id"));
        }
        return Promise.resolve(paymentGetted.toDTO())
    }

    public async findByOrderId(orderId: string): Promise<returnPaymentDTO | Error> {
        const paymentGetted = await this.paymentRepository.getByOrderId(orderId);
        if (paymentGetted == null){
            return Promise.reject(new Error("not found in db by order id"));
        }
        return Promise.resolve(paymentGetted.toDTO())
    }
}