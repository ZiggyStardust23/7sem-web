import { IPhoneRepository } from '../src/pgRepository/PhoneRepository';
import { PhoneService } from '../src/services/PhoneService';
import { Phone } from '../src/models/PhoneModel';
import { mock, instance, when, anything } from 'ts-mockito';
import { returnPhoneDTO } from '../src/dto/PhoneDTO';

describe('OrderService', () => {
    let phoneService: PhoneService;
    let phoneRepository: IPhoneRepository;

    beforeEach(() => {
        phoneRepository = mock<IPhoneRepository>();
        phoneService = new PhoneService(instance(phoneRepository));
    });

    it('should create a phone', async () => {
        const id_ = "";
        const name_ = "testname";
        const producername_ = "producer1";
        const osname_ = "os1";
        const ramsize_ = 16;
        const memsize_ = 128;
        const camres_ = 20;
        const price_ = 20000;
        const createdPhone = new Phone(
            id_,
            name_,
            producername_,
            osname_,
            ramsize_,
            memsize_,
            camres_,
            price_
        )

        when(phoneRepository.create(anything())).thenResolve(createdPhone);
    
        phoneService.create({            
                            name: name_,
                            producername: producername_,
                            osname: osname_,
                            ramsize: ramsize_,
                            memsize: memsize_,
                            camres: camres_,
                            price: price_})
                            .then((result) => {
                                expect(result).toEqual({           
                                    id: id_, 
                                    name: name_,
                                    producername: producername_,
                                    osname: osname_,
                                    ramsize: ramsize_,
                                    memsize: memsize_,
                                    camres: camres_,
                                    price: price_});    
                            }).catch((error: Error) => {
                                console.error(error.message);
                            })
    });

    it('findById: success', async () => {
        const id_ = "test";
        const name_ = "testname";
        const producername_ = "producer1";
        const osname_ = "os1";
        const ramsize_ = 16;
        const memsize_ = 128;
        const camres_ = 20;
        const price_ = 20000;
        const phoneToFind = new Phone(
            id_,
            name_,
            producername_,
            osname_,
            ramsize_,
            memsize_,
            camres_,
            price_
        )

        when(phoneRepository.getById("test")).thenResolve(phoneToFind);
    

        phoneService.findById("test")
            .then((result) => {
                expect(result).toEqual({
                    id: id_,            
                    name: name_,
                    producername: producername_,
                    osname: osname_,
                    ramsize: ramsize_,
                    memsize: memsize_,
                    camres: camres_,
                    price: price_});    
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });

    it('findById: fail', async () => {

        when(phoneRepository.getById("test")).thenResolve(null);
    

        phoneService.findById("test").then((result) => {
                        }).catch((error: Error) => {
                            expect(error.message).toEqual("not found by id");
                        });
    });

    it('paginate: find first by os name', async () => {
        const id_ = "test";
        const name_ = "testname";
        const producername_ = "producer1";
        const osname_ = "os1";
        const ramsize_ = 16;
        const memsize_ = 128;
        const camres_ = 20;
        const price_ = 20000;
        const phones: Phone[] = [
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_)
        ]
        phones[0].id = 'test1';
        phones[1].id = 'test2';
        phones[2].id = 'test3'; phones[2].osname = 'specialOs';
        phones[3].id = 'test4';
        phones[4].id = 'test5';

        when(phoneRepository.paginate(anything(), 1, 1)).thenResolve([
            phones[2]
        ]);
    
        phoneService.paginate({osname: "specialOs"}, 1, 1)
            .then((result) => {
                if (result instanceof Error) {
                    throw result
                }
                expect(result[0]).toEqual({
                    id: phones[2].id,            
                    name: name_,
                    producername: producername_,
                    osname: phones[2].osname,
                    ramsize: ramsize_,
                    memsize: memsize_,
                    camres: camres_,
                    price: price_});   
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });
    it('paginate: find all by osname, on one page', async () => {
        const id_ = "test";
        const name_ = "testname";
        const producername_ = "producer1";
        const osname_ = "os1";
        const ramsize_ = 16;
        const memsize_ = 128;
        const camres_ = 20;
        const price_ = 20000;
        const phones: Phone[] = [
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_)
        ]
        phones[0].id = 'test1';
        phones[1].id = 'test2';
        phones[2].id = 'test3'; phones[2].osname = 'specialOs';
        phones[3].id = 'test4';
        phones[4].id = 'test5'; phones[4].osname = 'specialOs';

        when(phoneRepository.paginate(anything(), 1, 2)).thenResolve([
            phones[2], phones[4]
        ]);
    
        phoneService.paginate({osname: "specialOs"}, 1, 2)
            .then((result) => {
                expect(result).toEqual([{
                    id: phones[2].id,            
                    name: name_,
                    producername: producername_,
                    osname: phones[2].osname,
                    ramsize: ramsize_,
                    memsize: memsize_,
                    camres: camres_,
                    price: price_},
                    {
                    id: phones[4].id,            
                    name: name_,
                    producername: producername_,
                    osname: phones[4].osname,
                    ramsize: ramsize_,
                    memsize: memsize_,
                    camres: camres_,
                    price: price_}]); 
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });
    it('paginate: not found', async () => {
        const id_ = "test";
        const name_ = "testname";
        const producername_ = "producer1";
        const osname_ = "os1";
        const ramsize_ = 16;
        const memsize_ = 128;
        const camres_ = 20;
        const price_ = 20000;
        const phones: Phone[] = [
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_),
            new Phone(id_, name_, producername_, osname_, ramsize_, memsize_, camres_, price_)
        ]
        phones[0].id = 'test1';
        phones[1].id = 'test2';
        phones[2].id = 'test3'; phones[2].osname = 'notSpecialOs';
        phones[3].id = 'test4';
        phones[4].id = 'test5'; phones[4].osname = 'notSpecialOs';

        when(phoneRepository.paginate(anything(), 1, 2)).thenResolve([])

        phoneService.paginate({osname: "specialOs"}, 1, 2)
            .then((result) => {
            }).catch((error: Error) => {
                expect(error.message).toEqual("not found by this props");
            });
    });

    it('should succesfully update the price of phone', async () => {
        const id_ = "1";
        const name_ = "testname";
        const producername_ = "producer1";
        const osname_ = "os1";
        const ramsize_ = 16;
        const memsize_ = 128;
        const camres_ = 20;
        const givenPhone = new Phone(
            id_,
            name_,
            producername_,
            osname_,
            ramsize_,
            memsize_,
            camres_,
            20000
        )
        const updatedPhone = new Phone(
            id_,
            name_,
            producername_,
            osname_,
            ramsize_,
            memsize_,
            camres_,
            25000
        )

        when(phoneRepository.getById("1")).thenResolve(givenPhone);
        when(phoneRepository.update(anything())).thenResolve(updatedPhone);
    
        phoneService.update({     
            id: id_,       
            name: name_,
            producername: producername_,
            osname: osname_,
            ramsize: ramsize_,
            memsize: memsize_,
            camres: camres_,
            price: 25000})
            .then((result) => {
                expect(result).toEqual({
                    id: id_,            
                    name: name_,
                    producername: producername_,
                    osname: osname_,
                    ramsize: ramsize_,
                    memsize: memsize_,
                    camres: camres_,
                    price: 25000});   
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });

    it('update fail: phone not found', async () => {
        const name_ = "testname";
        const producername_ = "producer1";
        const osname_ = "os1";
        const ramsize_ = 16;
        const memsize_ = 128;
        const camres_ = 20;

        when(phoneRepository.getById("2")).thenResolve(null);
        when(phoneRepository.update(anything())).thenResolve(null);
    
        phoneService.update({     
            id: "2",       
            name: name_,
            producername: producername_,
            osname: osname_,
            ramsize: ramsize_,
            memsize: memsize_,
            camres: camres_,
            price: 25000}).then((result) => {
            }).catch((error: Error) => {
                expect(error.message).toEqual("not found in db");
            });
    });
});
