import { PostgresUserRepository } from './pgRepository/UserRepository';
import { UserService } from './services/UserService';
import { PostgresPhoneRepository } from './pgRepository/PhoneRepository';
import { PhoneService } from './services/PhoneService';
import { PostgresOrderRepository } from './pgRepository/OrderRepository';
import { OrderService } from './services/OrderService';
import { PostgresBasketRepository } from './pgRepository/BasketRepository';
import { BasketService } from './services/BasketService';
import { PostgresCommentRepository } from './pgRepository/CommentRepository';
import { CommentService } from './services/CommentService';
import { PostgresPaymentRepository } from './pgRepository/PaymentRepository';
import { PaymentService } from './services/PaymentService';
import { PostgresWishRepository } from './pgRepository/WishRepository';
import { WishService } from './services/WishService';
import { returnUserDTO } from './dto/UserDTO';
import { Pool } from 'pg';
import * as conf from "../config"

const pool = new Pool({
    user: conf.user,
    password: conf.password,
    host: conf.host,
    port: conf.port,
    database: conf.database
})

async function dropTables(): Promise<void>{
    pool.connect().then(async (client) => {
        await client.query(
            `DROP TABLE IF EXISTS users CASCADE;
             DROP TABLE IF EXISTS basketpositions CASCADE;
             DROP TABLE IF EXISTS baskets CASCADE;
             DROP TABLE IF EXISTS comments CASCADE;
             DROP TABLE IF EXISTS orders CASCADE;
             DROP TABLE IF EXISTS phones CASCADE;
             DROP TABLE IF EXISTS positions CASCADE;
            `
        );
    }).then(async (): Promise<string> => Promise.resolve("bebra"))
}

async function usersInit(): Promise<void>{
    const rep = new PostgresUserRepository();
    await rep.initialize().then(async () => {
        const userService = new UserService(rep);
        await userService.createUser({email: "testUser@test.com", password: "testpswd", phone_number: "123123123", role: 1, name: "Pepe"})
        await userService.createUser({email: "admin@test.com", password: "testpswd", phone_number: "123123123", role: 0, name: "V"})
    })
}
    
async function phonesInit(): Promise<void>{
    const phoneRep = new PostgresPhoneRepository();
    await phoneRep.initialize().then(async () => {
        const phoneService = new PhoneService(phoneRep);
        await phoneService.create({            
            name: "CoolPhone v1",
            producername: "CoolProducer",
            osname: "DOS",
            ramsize: 16,
            memsize: 128,
            camres: 20,
            price: 20000})
        await phoneService.create({            
            name: "CoolPhone v2",
            producername: "CoolProducer",
            osname: "DOS v2",
            ramsize: 16,
            memsize: 1228,
            camres: 220,
            price: 60000})
    }).then(async (): Promise<string> => Promise.resolve("bebra"))
}

async function ordersInit(): Promise<void>{
    const orderRep = new PostgresOrderRepository();
    await orderRep.initialize().then(async () => {
        const orderService = new OrderService(orderRep);
        await orderService.create({positions: [{
            productId: "1",
            productsAmount: 1}], userid: "1", address: "Moscow"})
    }).then(async (): Promise<string> => Promise.resolve("bebra"))
}
 
async function basketInit(): Promise<void>{
    const basketRep = new PostgresBasketRepository();
    await basketRep.initialize().then(async () => {
        const basketService = new BasketService(basketRep);
        await basketService.create("1")
    }).then(async (): Promise<string> => Promise.resolve("bebra"))
}

async function commentInit(): Promise<void>{
    const commentRep = new PostgresCommentRepository();
    await commentRep.initialize().then(async () => {
        const commentService = new CommentService(commentRep);
        await commentService.create({userid: "1", productId: "1", text: "good"})
    }).then(async (): Promise<string> => Promise.resolve("bebra"))
}
 
async function paymentInit(): Promise<void>{
    const paymentRep = new PostgresPaymentRepository();
    await paymentRep.initialize().then(async () => {
        const paymentService = new PaymentService(paymentRep);
        await paymentService.create("1")
    }).then(async (): Promise<string> => Promise.resolve("bebra"))
}

async function wishInit(): Promise<void>{
    const wishRep = new PostgresWishRepository();
    await wishRep.initialize().then(async () => {
        const wishService = new WishService(wishRep);
        await wishService.create({productId: '1', userId: "1"})
    }).then(async (): Promise<string> => Promise.resolve("bebra"))
}

async function populateTables(): Promise<void>{
    await usersInit();
    await phonesInit();
    await basketInit();
    await ordersInit();
    await paymentInit();
    await commentInit();
    await wishInit();
}

dropTables().then(async () => {
    await populateTables()
})


