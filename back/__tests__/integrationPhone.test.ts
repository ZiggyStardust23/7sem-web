import { PostgresPhoneRepository } from '../src/pgRepository/PhoneRepository';
import { PhoneService, Phone } from '../src/services/PhoneService';
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env
dotenv.config();

// Создаем экземпляр репозитория
const phoneRepository = new PostgresPhoneRepository();
const phoneService = new PhoneService(phoneRepository);

describe('Phone Repository Tests', () => {
    let testPhoneId: string;

    test('createPhone - создание телефона', async () => {
        await phoneRepository.initialize();
        const phone = new Phone(
            "", // _id
            "Phone X", // _name
            "Phone Producer Inc.", // _producername
            "OSX", // _osname
            8, // _ramsize
            128, // _memsize
            12, // _camres
            999, // _price
        );
        
        await phoneService.create({
            name: "Phone X",
            producername: "Phone Producer Inc.",
            osname: "OSX",
            ramsize: 8,
            memsize: 128,
            camres: 12,
            price: 999,
        }).then((createdPhone) => {
            if (createdPhone instanceof Error){
                throw(createdPhone);
                }
                expect(createdPhone).toBeDefined();
                expect(createdPhone.id).toBeDefined();
                expect(createdPhone.name).toBe(phone.name);
                expect(createdPhone.producername).toBe(phone.producername);
                expect(createdPhone.osname).toBe(phone.osname);
                expect(createdPhone.ramsize).toBe(phone.ramsize);
                expect(createdPhone.memsize).toBe(phone.memsize);
                expect(createdPhone.camres).toBe(phone.camres);
                expect(createdPhone.price).toBe(phone.price);
                testPhoneId = createdPhone.id;
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('findPhoneById - получение телефона по ID', async () => {
        await phoneService.findById(testPhoneId)
            .then((fetchedPhone) => {
            if (fetchedPhone instanceof Error){
                throw(fetchedPhone);
                }
                expect(fetchedPhone).toBeDefined();
                expect(fetchedPhone?.id).toBe(testPhoneId);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('updatePhone - обновление данных телефона', async () => {
        const updatedPhone = await phoneService.update({
            id: testPhoneId,
            name: "Phone 1",
            producername: "Phone Producer Inc.",
            osname: "OSX",
            ramsize: 8,
            memsize: 128,
            camres: 12,
            price: 999,
    }).then((updatedPhone) => {
        if (updatedPhone instanceof Error){
            throw(updatedPhone);
            }
            expect(updatedPhone).toBeDefined();
            expect(updatedPhone?.id).toBe(testPhoneId);
            expect(updatedPhone?.name).toBe("Phone 1");
        }).catch((error: Error) => {
            console.error(error.message);
            expect(false).toBe(true);
        })
    });
});
