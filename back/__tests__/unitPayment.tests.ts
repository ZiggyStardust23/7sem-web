import { IPaymentRepository } from '../src/pgRepository/PaymentRepository'
import { PaymentService } from '../src/services/PaymentService'
import { Payment } from '../src/models/PaymentModel';
import { mock, instance, when, anything } from 'ts-mockito';

describe('OrderService', () => {
    let paymentService: PaymentService;
    let paymentRepository: IPaymentRepository;

    beforeEach(() => {
        paymentRepository = mock<IPaymentRepository>();
        paymentService = new PaymentService(instance(paymentRepository));
    });

    it('should create a payment', async () => {
        const id_ = "1";
        const orderId_ = "test";
        const status_ = true;
        const sum_ = 20000;
        const createdPayment = new Payment(
            id_,
            orderId_,
            status_,
            sum_
        )

        when(paymentRepository.create(anything())).thenResolve(createdPayment);
    
        paymentService.create(orderId_)
            .then((result) => {
                expect(result).toEqual({
                    id: id_,
                    orderId: orderId_,
                    status: status_,
                    sum: sum_
                });   
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });

    it('findById: success', async () => {
        const id_ = "test"
        const orderId_ = "test";
        const status_ = true;
        const sum_ = 20000;
        const paymentToFind = new Payment(
            id_,
            orderId_,
            status_,
            sum_
        )

        when(paymentRepository.getById("test")).thenResolve(paymentToFind);
    
        paymentService.findById("test")
            .then((result) => {
                expect(result).toEqual({
                    id: id_,
                    orderId: orderId_,
                    status: status_,
                    sum: sum_
                });  
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });

    it('findById: fail', async () => {

        when(paymentRepository.getById("test")).thenResolve(null);
    
        paymentService.findById("test").then((result) => {
        }).catch((error: Error) => {
            expect(error.message).toEqual("not found in db by id");
        });
    });

    it('findByOrderId: success', async () => {
        const id_ = "test"
        const orderId_ = "test";
        const status_ = true;
        const sum_ = 20000;
        const paymentToFind = new Payment(
            id_,
            orderId_,
            status_,
            sum_
        )

        when(paymentRepository.getByOrderId("test")).thenResolve(paymentToFind);
    
        paymentService.findByOrderId("test")
            .then((result) => {
                expect(result).toEqual({
                    id: id_,
                    orderId: orderId_,
                    status: status_,
                    sum: sum_
                }); 
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });
    it('findByOrderId: fail', async () => {

        when(paymentRepository.getByOrderId("test")).thenResolve(null);
    
        paymentService.findByOrderId("test").then((result) => {
        }).catch((error: Error) => {
            expect(error.message).toEqual("not found in db by order id");
        });
    });
    
    it('should succesfully update the status of payment', async () => {
        const id_ = "test"
        const orderId_ = "test";
        const status_ = true;
        const sum_ = 20000;

        const paymentUpdated = new Payment(
            id_,
            orderId_,
            status_,
            sum_
        )

        when(paymentRepository.update(anything())).thenResolve(paymentUpdated);
    
        paymentService.update({     
            id: id_,       
            orderId: orderId_,
            status: status_,
            sum: sum_
        }).then((result) => {
            expect(result).toEqual({
                id: id_,
                orderId: orderId_,
                status: status_,
                sum: sum_
            });
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('update fail: payment not found', async () => {
        const id_ = "test"
        const orderId_ = "test";
        const status_ = false;
        const sum_ = 20000;

        when(paymentRepository.getById("test")).thenResolve(null);
    
        paymentService.update({     
            id: id_,       
            orderId: orderId_,
            status: false,
            sum: sum_
        }).then((result) => {
        }).catch((error: Error) => {
            expect(error.message).toEqual("not found in db");
        });
    });
});
