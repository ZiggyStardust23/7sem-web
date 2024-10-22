import * as readline from 'readline-sync';
import { UserService } from '../src/user/UserService';
import { PhoneService } from '../src/phone/PhoneService';
import { PostgresUserRepository } from '../src/user/UserRepository';
import { PostgresPhoneRepository } from '../src/phone/PhoneRepository';
import { PostgresBasketRepository } from '../src/basket/BasketRepository';
import { BasketService } from '../src/basket/BasketService';
import { PostgresOrderRepository } from '../src/order/OrderRepository';
import { OrderService } from '../src/order/OrderService';
import { PostgresPaymentRepository } from '../src/payment/PaymentRepository';
import { PaymentService } from '../src/payment/PaymentService';
import { BasketPosition } from '../src/basket/BasketModel';
import { Position } from '../src/order/OrderModel';
import { deleteJsFiles } from '../delete';

async function main(): Promise<void> {
    const userRepository = new PostgresUserRepository();
    await userRepository.initialize();
    const userService = new UserService(userRepository);
    const phoneRepository = new PostgresPhoneRepository();
    await phoneRepository.initialize();
    const phoneService = new PhoneService(phoneRepository);
    const basketRepository = new PostgresBasketRepository();
    await basketRepository.initialize();
    const basketService = new BasketService(basketRepository);
    const orderRepository = new PostgresOrderRepository();
    await orderRepository.initialize();
    const orderService = new OrderService(orderRepository);
    const paymentRepository = new PostgresPaymentRepository();
    await paymentRepository.initialize();
    const paymentService = new PaymentService(paymentRepository);

    const ures = await userService.createUser({email: "testemail", password: "password", name: "testname", phone_number: "123123123", role: 0})
    if (ures != null){
        await basketService.create(ures.id);
    }
    const check = readline.question('Would you like to register? (N - no): ');

    if (check === 'N') {
        console.log("Authorization\n");
        const email = readline.question('Email (testemail - to test): ');
        const password = readline.question('Password (password - to test): ');
        const res = await userService.login({ email: email, password: password });
        if (res !== null) {
            console.log("Welcome, " + res.name + '!');
            for (let i = 1; i < 4; i++){
                await phoneService.create({name: "test" + i.toString, producername: "a", osname: "a", memsize: 10, ramsize: 10, camres: 10, price: 10000 * i})
            }
            console.log("Check out the assortment and choose a product (enter the number): ");
            const products = await phoneService.paginate({}, 1, 10);
            for (let i = 0; i < products.length; i++) {
                console.log(i.toString() + ' ' + products[i].name + ' ' + products[i].price);
            }
            const choice = readline.question('Enter the product number: ');
            const chosen = products[parseInt(choice)];
            const basket = await basketService.findByuserid(res.id);
            const bp = new BasketPosition("", basket?.id || "", chosen.id, 1);
            const bupdated = await basketService.addProductsToBasket({ basketId: basket?.id || "", positions: [bp] })
            const bpositions = bupdated?.positions || [];
            console.log("Product added, here is the content of your basket: ");
            for (let i = 0; i < bpositions.length; i++) {
                console.log(i.toString() + ' ' + bpositions[i].phoneId + ' ' + bpositions[i].productsAmount + '\n');
            }
            console.log("Total cost of the entire basket: " + (await basketService.calculateTotalPrice(basket?.id || '') || 0).toString() + '\n');
            console.log("Place an order? ");
            const choice2 = readline.question('N - no, * - yes: ');
            if (choice2 !== 'N') {
                const address = readline.question('Enter delivery address: ');
                let opositions: Position[] = [];
                for (let i = 0; i < bpositions.length; i++) {
                    opositions.push(new Position('', '', bpositions[i].phoneId, bpositions[i].productsAmount));
                }
                const ord = await orderService.create({ userid: res.id, address: address, positions: opositions });
                if (ord !== null) {
                    console.log("Proceed to payment? ");
                    const choice3 = readline.question('N - no, * - yes: ');
                    if (choice3 !== 'N') {
                        const payment = await paymentService.create(ord.id);
                        console.log("Your order has been successfully paid, payment ID: " + payment.id);
                    } else {
                        console.log("Order not paid");
                    }
                } else {
                    console.log("Error placing order");
                }
            } else {
                console.log("Goodbye");
            }
        } else {
            console.log("Authorization error");
        }
    }
    else{
        console.log("Registration\n");
        const email = readline.question('Email: ');
        const password = readline.question('Password: ');
        const name = readline.question('name: ');
        const phone = readline.question('phone number: ');
        const res = await userService.registration({ email: email, password: password, name: name, phone_number: phone });
        if (res != null){
            console.log("registration is successful ")
        }
        else{
            console.log("user with same email is already registered");
        }
    }
    deleteJsFiles(".")
}

main();
