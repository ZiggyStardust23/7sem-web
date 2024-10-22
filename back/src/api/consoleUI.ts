import * as readline from 'readline';
import { UserController, IUserController } from '../controllers/UserController';
import { PostgresUserRepository } from '../pgRepository/UserRepository';
import { UserService } from '../services/UserService';
import { phoneCreateDTO, phoneFullDTO, phoneSearchDTO } from '../dto/PhoneDTO';
import { PostgresPhoneRepository } from '../pgRepository/PhoneRepository';
import { PhoneController, IPhoneController } from '../controllers/PhoneController';
import { PhoneService } from '../services/PhoneService';
import { PostgresOrderRepository } from '../pgRepository/OrderRepository';
import { OrderService } from '../services/OrderService';
import { OrderController, IOrderController } from '../controllers/OrderController';
import { orderCreateDTO, orderPositionDTO, orderUpdatePositions, orderUpdateStatus } from '../dto/OrderDTO';
import { PostgresBasketRepository } from '../pgRepository/BasketRepository';
import { BasketService } from '../services/BasketService';
import { BasketController, IBasketController } from '../controllers/BasketController';
import { PostgresCommentRepository } from '../pgRepository/CommentRepository';
import { CommentService } from '../services/CommentService';
import { CommentController, ICommentController } from '../controllers/CommentController';
import { commentCreateDTO, commentUpdateRateDTO } from '../dto/CommentDTO';
import { PostgresPaymentRepository } from '../pgRepository/PaymentRepository';
import { PaymentService } from '../services/PaymentService';
import { IPaymentController, PaymentController } from '../controllers/PaymentController';
import { paymentUpdateDTO } from '../dto/PaymentDTO';
import { returnUserDTO } from '../dto/UserDTO';
import {logger} from '../logger';

let cur_user: returnUserDTO | null = null;

const rep = new PostgresUserRepository();
rep.initialize();
const userService = new UserService(rep);
const userController: IUserController = new UserController(userService);

const phoneRep = new PostgresPhoneRepository();
phoneRep.initialize();
const phoneService = new PhoneService(phoneRep);
const phoneController: IPhoneController = new PhoneController(phoneService);

const orderRep = new PostgresOrderRepository();
orderRep.initialize();
const orderService = new OrderService(orderRep);
const orderController: IOrderController = new OrderController(orderService);

const basketRep = new PostgresBasketRepository();
basketRep.initialize();
const basketService = new BasketService(basketRep);
const basketController: IBasketController = new BasketController(basketService);

const commentRep = new PostgresCommentRepository();
commentRep.initialize();
const commentService = new CommentService(commentRep);
const commentController: ICommentController = new CommentController(commentService);

const paymentRep = new PostgresPaymentRepository();
paymentRep.initialize();
const paymentService = new PaymentService(paymentRep);
const paymentController: IPaymentController = new PaymentController(paymentService);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function handleInput() {
    while (true) {
        console.log('1. Регистрация пользователя');
        console.log('2. Вход пользователя');
        console.log('3. Создание пользователя');
        console.log('4. Получение пользователя по ID');
        console.log('5. Получение пользователя по email');
        console.log('6. Обновление пользователя');
        console.log('7. Получить телефон по ID');
        console.log('8. Пагинация');
        console.log('9. Создание телефона');
        console.log('10. Обновить информацию о телефон');
        console.log('11. Создание заказа');
        console.log('12. Получение заказа по ID');
        console.log('13. Получение заказов пользователя');
        console.log('14. Обновление статуса заказа');
        console.log('15. Добавление позиций к заказу');
        console.log('16. Удаление позиций из заказа');
        console.log('17. Создание корзины');
        console.log('18. Получение корзины по ID пользователя');
        console.log('19. Очистка корзины');
        console.log('20. Рассчет общей стоимости корзины');
        console.log('21. Добавление товаров в корзину');
        console.log('22. Удаление товаров из корзины');
        console.log('23. Создать комментарий');
        console.log('24. Найти комментарии по ID продукта');
        console.log('25. Обновить рейтинг комментария');
        console.log('26. Удалить комментарий');
        console.log('27. Создать платеж');
        console.log('28. Обновить платеж');
        console.log('29. Найти платеж по ID');
        console.log('30. Найти платеж по ID заказа');
        console.log('31. Выйти из системы');
        console.log('0. Выход');

        const choice = await prompt('Выберите действие: ');

        switch (choice) {
            case '1':
                await handleRegistration();
                break;
            case '2':
                await handleLogin();
                break;
            case '3':
                await handleCreateUser();
                break;
            case '4':
                await handleFindUserById();
                break;
            case '5':
                await handleFindUserByEmail();
                break;
            case '6':
                await handleUpdateUser();
                break;
            case '7':
                await handleFindPhoneById();
                break;
            case '8':
                await handlePaginate();
                break;
            case '9':
                await handlePhoneCreate();
                break;
            case '10':
                await handlePhoneUpdate();
                break;
            case '11':
                await handleOrderCreate();
                break;
            case '12':
                await handleOrderFindById();
                break;
            case '13':
                await handleOrderFindByUserId();
                break;
            case '14':
                await handleOrderUpdateStatus();
                break;
            case '15':
                await handleOrderAddPositions();
                break;
            case '16':
                await handleOrderRemovePositions();
                break;
             case '17':
                await handleCreateBasket();
                break;
            case '18':
                await handleFindByUserId();
                break;
            case '19':
                await handleClearBasket();
                break;
            case '20':
                await handleCalculateTotalPrice();
                break;
            case '21':
                await handleAddProductsToBasket();
                break;
            case '22':
                await handleRemoveProductsFromBasket();
                break;
            case '23':
                await handleCommentCreate();
                break;
            case '24':
                await handleCommentFindByProductId();
                break;
            case '25':
                await handleCommentUpdateRate();
                break;
            case '26':
                await handleCommentDelete();
                break;
            case '27':
                await handleCreatePayment();
                break;
            case '28':
                await handleUpdatePayment();
                break;
            case '29':
                await handleFindPaymentById();
                break;
            case '30':
                await handleFindPaymentByOrderId();
                break;
            case '31':
                await handleLogout();
                break;
            case '0':
                console.log('Выход');
                return;
            default:
                console.log('Неправильный выбор, попробуйте ещё раз.');
                break;
        }
    }
}


const dummyRes = {
    status: () => dummyRes,
    json: (data: any) => console.log(data)
};


async function handleRegistration() {
    const email = await prompt('Введите email: ');
    const name = await prompt('Введите имя: ');
    const phone_number = await prompt('Введите номер телефона: ');
    const password = await prompt('Введите пароль: ');

    try {
        const id = await userController.handleRegistrationRequest({
            body: { email, name, phone_number, password }
        } as any, dummyRes as any);
        if (id != null){    
            await basketController.handleCreate({ body: { id } } as any, dummyRes as any);
            console.log('Пользователь зарегистрирован');
            logger.info("registration successful")
        }
        else {
            console.log('Ошибка регистрации');
            logger.info("registration is not successful")
        }
    } catch (error: any) {
        logger.error("err " + error.message);
        console.error('Ошибка:', error.message);
    }
}

async function handleLogin() {
    const email = await prompt('Введите email: ');
    const password = await prompt('Введите пароль: ');

    try {
        const user = await userController.handleLoginRequest({
            body: { email, password }
        } as any, dummyRes as any);
        if (user != null){
            console.log('Пользователь вошёл в систему:', user);
            logger.info(user.id + " login");
            cur_user = user;
        }
        else {
            logger.info("login failed");
        }
    } catch (error: any) {
        logger.error("err " + error.message);
        console.error('Ошибка:', error.message);
    }
}

async function handleLogout() {
        if (cur_user != null){
            console.log('Вы вышли из системы');
            logger.info(cur_user.id + " logout");
            cur_user = null;
        }
        else{
            console.log('Вы не авторизованы');
            logger.info("logout attempt, not authorized");
        }
}

async function handleCreateUser() {
    if (!cur_user || cur_user.role != 0){
        console.log("У вас недостаточно прав для создания пользователя.")
        logger.info("has no permission to create a user")
        return;
    }
    const email = await prompt('Введите email: ');
    const name = await prompt('Введите имя: ');
    const phone_number = await prompt('Введите номер телефона: ');
    const password = await prompt('Введите пароль: ');
    const role = await prompt('Введите роль пользователя (0 для админа, 1 для продавца, 2 для клиента): ');

    try {
        const user = await userController.handleCreateUserRequest({
            body: { email, name, phone_number, password, role: parseInt(role) }
        } as any, dummyRes as any);
        console.log('Пользователь создан:', user);
        logger.info(cur_user.id + " created new user");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error('err ' + error.message);
    }
}

async function handleFindUserById() {
    if (!cur_user || cur_user.role != 0){
        console.log("У вас недостаточно прав для поиска пользователя по ID.")
        logger.info("has no permission to find user by id")
        return;
    }
    const id = await prompt('Введите ID пользователя: ');

    try {
        const user = await userController.handleFindUserByIdRequest({
            params: { id }
        } as any, dummyRes as any);
        console.log('Найден пользователь:', user);
        logger.info(cur_user.id + " found user by id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleFindUserByEmail() {
    if (!cur_user || cur_user.role != 0){
        console.log("У вас недостаточно прав для поиска пользователя по email.")
        logger.info("has no permission to find user by email")
        return;
    }
    const email = await prompt('Введите email пользователя: ');

    try {
        const user = await userController.handleFindUserByEmailRequest({
            params: { email }
        } as any, dummyRes as any);
        console.log('Найден пользователь:', user);
        logger.info(cur_user.id + " found user by email");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleUpdateUser() {
    if (!cur_user){
        logger.info("has no permission to update user")
        return;
    }

    let id: string;
    let email: string;
    let name: string;
    let phone_number: string;
    let password: string;
    let role: number;
    if (cur_user.role == 1 || cur_user.role == 2){
        id = cur_user.id;
        email = await prompt('Введите новый email: ');
        name = await prompt('Введите новое имя: ');
        phone_number = await prompt('Введите новый номер телефона: ');
        password = await prompt('Введите новый пароль: ');
        role = cur_user.role;
    }
    else{
        id = await prompt('Введите ID пользователя, которого хотите обновить: ');
        email = await prompt('Введите новый email: ');
        name = await prompt('Введите новое имя: ');
        phone_number = await prompt('Введите новый номер телефона: ');
        password = await prompt('Введите новый пароль: ');
        role = parseInt(await prompt('Введите новую роль пользователя (0 для админа, 1 для продавца, 2 для клиента): '));
    }

    try {
        const user = await userController.handleUpdateUserRequest({
            body: { id, email, name, phone_number, password, role }
        } as any, dummyRes as any);
        console.log('Пользователь обновлен:', user);
        logger.info(cur_user.id + " updated user");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleFindPhoneById(): Promise<void> {
    const id = await prompt('Введите id телефона: ');
    try {
        const phone = await phoneController.handleFindByIdRequest({ params: { id } } as any, dummyRes as any);
        logger.info("phone find by id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function showPhones(phones: phoneFullDTO[]): Promise<void> {
    phones.forEach((phone, index) => {
        console.log(`${index + 1}. ${phone.name} (${phone.producername}) - ${phone.price}$`);
    });
}

async function handlePaginate(): Promise<void> {
    const pageNumber = +await prompt('Введите номер страницы: ');
    const pageSize = +await prompt('Введите размер страницы: ');
    const minPrice = +await prompt('Введите минимальную цену: ');
    const maxPrice = +await prompt('Введите максимальную цену: ');
    const minRamSize = +await prompt('Введите минимальный объем RAM: ');
    const maxRamSize = +await prompt('Введите максимальный объем RAM: ');
    const minMemSize = +await prompt('Введите минимальный объем памяти: ');
    const maxMemSize = +await prompt('Введите максимальный объем памяти: ');
    const minCamRes = +await prompt('Введите минимальное разрешение камеры: ');
    const maxCamRes = +await prompt('Введите максимальное разрешение камеры: ');
    const name = await prompt('Введите название телефона (необязательно): ');
    const producername = await prompt('Введите название производителя (необязательно): ');
    const osname = await prompt('Введите название операционной системы (необязательно): ');

    const props: phoneSearchDTO = {
        minramsize: minRamSize,
        maxramsize: maxRamSize,
        minmemsize: minMemSize,
        maxmemsize: maxMemSize,
        mincamres: minCamRes,
        maxcamres: maxCamRes,
        minPrice: minPrice,
        maxPrice: maxPrice,
        name: name || undefined,
        producername: producername || undefined,
        osname: osname || undefined
    };

    try {
        const phones = await phoneController.handlePaginateRequest({body: { pageNumber, pageSize, props }} as any, dummyRes as any);
        if (phones.length == 0){
            console.log("Ничего не найдено")
        }
        else{
            showPhones(phones);
        }
        logger.info("pagination successful");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handlePhoneCreate(): Promise<void> {
    if (!cur_user || cur_user.role != 0){
        console.log("У вас недостаточно прав добавления товара.")
        logger.info("has no permission to create a phone")
        return;
    }
    const name = await prompt('Введите название телефона: ');
    const producername = await prompt('Введите название производителя: ');
    const osname = await prompt('Введите название операционной системы: ');
    const ramsize = +await prompt('Введите объем RAM: ');
    const memsize = +await prompt('Введите объем памяти: ');
    const camres = +await prompt('Введите разрешение камеры: ');
    const price = +await prompt('Введите цену телефона: ');
    const phoneData: phoneCreateDTO = { name, producername, osname, ramsize, memsize, camres, price };
    try {
        const createdPhone = await phoneController.handleCreateRequest({ body: phoneData } as any, dummyRes as any);
        logger.info(cur_user.id + " created a phone");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handlePhoneUpdate(): Promise<void> {
    if (!cur_user || cur_user.role != 0){
        console.log("У вас недостаточно прав для обновления товара.")
        logger.info("has no permission to update a phone")
        return;
    }
    const id = await prompt('Введите id телефона для обновления: ');
    const name = await prompt('Введите новое название телефона: ');
    const producername = await prompt('Введите новое название производителя: ');
    const osname = await prompt('Введите новое название операционной системы: ');
    const ramsize = +await prompt('Введите новый объем RAM: ');
    const memsize = +await prompt('Введите новый объем памяти: ');
    const camres = +await prompt('Введите новое разрешение камеры: ');
    const price = +await prompt('Введите новую цену телефона: ');
    const phoneData: phoneFullDTO = { id, name, producername, osname, ramsize, memsize, camres, price };
    try {
        const updatedPhone = await phoneController.handleUpdateRequest({ body: phoneData } as any, dummyRes as any);
        logger.info(cur_user.id + " updated a phone");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleOrderCreate(): Promise<void> {
    if (!cur_user){
        console.log("Неавторизиованный пользователь не может оформить заказ.")
        logger.info("has no permission to create an order")
        return;
    }

    let userid: string;
    if (cur_user.role == 2){
        userid = cur_user.id;
    }
    else {
        userid = await prompt('Введите ID пользователя: ');
    }

    const address = await prompt('Введите адрес доставки: ');

    const positions: orderPositionDTO[] = [];
    while (true) {
        const productId = await prompt('Введите ID товара: ');
        const productsAmount = +await prompt('Введите количество товара: ');
        positions.push({productId, productsAmount });

        const continueAdding = await prompt('Добавить еще товар? (yes/no): ');
        if (continueAdding.toLowerCase() !== 'yes') {
            break;
        }
    }

    const orderData: orderCreateDTO = { userid, address, positions };
    try {
        const createdOrder = await orderController.handleCreateOrderRequest({ body: orderData } as any, dummyRes as any);
        console.log('Созданный заказ:', createdOrder);
        logger.info(cur_user.id + " created an order");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleOrderFindById(): Promise<void> {
    if (!cur_user || cur_user.role == 2){
        console.log("У вас недостаточно прав для поиска заказа по id.")
        logger.info("has no permission to create find an order by id")
        return;
    }
    const id = await prompt('Введите ID заказа: ');
    try {
        const order = await orderController.handleFindOrderByIdRequest({ params: { id } } as any, dummyRes as any);
        console.log('Найденный заказ:', order);
        logger.info(cur_user.id + " find order by id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleOrderFindByUserId(): Promise<void> {
    if (!cur_user){
        console.log("Неавторизиованный пользователь не может просматривать заказы.")
        logger.info("has no permission to create find an order by user id")
        return;
    }

    let userid: string;
    if (cur_user.role == 2){
        userid = cur_user.id;
    }
    else {
        userid = await prompt('Введите ID пользователя: ');
    }
    try {
        const orders = await orderController.handleFindOrdersByUserIdRequest({ params: { userid } } as any, dummyRes as any);
        console.log('Найденные заказы:', orders);
        logger.info(cur_user.id + " find order by user id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleOrderUpdateStatus(): Promise<void> {
    if (!cur_user || cur_user.role == 2){
        console.log("У вас недостаточно прав для обновления статуса заказа.")
        logger.info("has no permission to update order")
        return;
    }
    const id = await prompt('Введите ID заказа: ');
    const statusToParse = await prompt('Введите новый статус заказа (PLACED - 0, PROCESSING - 1, COMPLETED - 2, CANCELLED - 3): ');
    const status = parseInt(statusToParse);

    const updateData: orderUpdateStatus = { id, status };
    try {
        const updatedOrder = await orderController.handleUpdateOrderStatusRequest({ body: updateData } as any, dummyRes as any);
        console.log('Обновленный заказ:', updatedOrder);
        logger.info(cur_user.id + " updated order status");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleOrderAddPositions(): Promise<void> {
    if (!cur_user){
        console.log("Неавторизованный пользователь не может добавлять позиции в заказ.")
        logger.info("has no permission to update order")
        return;
    }
    const id = await prompt('Введите ID заказа: ');
    const positions: orderPositionDTO[] = [];
    while (true) {
        const productId = await prompt('Введите ID товара: ');
        const productsAmount = +await prompt('Введите количество товара: ');
        positions.push({productId, productsAmount });

        const continueAdding = await prompt('Добавить еще товар? (yes/no): ');
        if (continueAdding.toLowerCase() !== 'yes') {
            break;
        }
    }

    const updateData: orderUpdatePositions = { id, positions };
    try {
        const updatedOrder = await orderController.handleAddPositionsToOrderRequest({ body: updateData } as any, dummyRes as any);
        console.log('Обновленный заказ:', updatedOrder);
        logger.info(cur_user.id + " updated order");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleOrderRemovePositions(): Promise<void> {
    if (!cur_user){
        console.log("Неавторизованный пользователь не может удалять позиции из заказа.")
        logger.info("has no permission to update order")
        return;
    }
    const id = await prompt('Введите ID заказа: ');
    const positions: orderPositionDTO[] = [];
    while (true) {
        const productId = await prompt('Введите ID товара: ');
        const productsAmount = +await prompt('Введите количество товара: ');
        positions.push({productId, productsAmount });

        const continueAdding = await prompt('Удалить еще товар? (yes/no): ');
        if (continueAdding.toLowerCase() !== 'yes') {
            break;
        }
    }

    const updateData: orderUpdatePositions = { id, positions };
    try {
        const updatedOrder = await orderController.handleRemovePositionsFromOrderRequest({ body: updateData } as any, dummyRes as any);
        console.log('Обновленный заказ:', updatedOrder);
        logger.info(cur_user.id + " updated order");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleCreateBasket() {
    if (!cur_user || cur_user.role != 0){
        console.log("У вас недостаточно прав для создания корзины.")
        logger.info("has no permission to create a basket")
        return;
    }
    const userId = await prompt('Введите ID пользователя: ');
    try {
        const basket = await basketController.handleCreate({ body: { userId } } as any, dummyRes as any);
        console.log('Создана корзина:', basket);
        logger.info(cur_user.id + " createad a basket");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleFindByUserId() {
    if (!cur_user){
        console.log("Неавторизиованный пользователь не может просмотреть содержимое корзины.")
        logger.info("has no permission to find a basket by user id ")
        return;
    }

    let userId: string;
    if (cur_user.role == 2){
        userId = cur_user.id;
        console.log(userId);
    }
    else {
        userId = await prompt('Введите ID пользователя: ');
    }
    try {
        const basket = await basketController.handleFindByUserId({ params: { userId } } as any, dummyRes as any);
        console.log('Найденная корзина:', basket);
        logger.info(cur_user.id + " find basket by user id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleClearBasket() {
    if (!cur_user){
        console.log("Неавторизиованный пользователь не может очистить корзину.")
        logger.info("has no permission to clear basket")
        return;
    }

    let userId: string;
    if (cur_user.role == 2){
        userId = cur_user.id;
    }
    else {
        userId = await prompt('Введите ID пользователя: ');
    }
    let basketId;
    if (cur_user.role == 2){
        basketId = await basketController.handleFindByUserId({ params: { userId: cur_user.id } } as any, dummyRes as any);
    }
    else{
        basketId = await prompt('Введите ID корзины: ');
    }
    try {
        await basketController.handleClear({ params: { basketId } } as any, dummyRes as any);
        console.log('Корзина успешно очищена.');
        logger.info(cur_user.id + " clear basket");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleCalculateTotalPrice() {
    if (!cur_user){
        console.log("Неавторизиованный пользователь не может просмотреть содержимое корзины.")
        logger.info("has no permission to calculate total price")
        return;
    }

    let basketId;
    if (cur_user.role == 2){
        basketId = await basketController.handleFindByUserId({ params: { userId: cur_user.id } } as any, dummyRes as any);
    }
    else{
        basketId = await prompt('Введите ID корзины: ');
    }
    try {
        const totalPrice = await basketController.handleCalculateTotalPrice({ params: { basketId } } as any, dummyRes as any);
        console.log('Общая стоимость корзины:', totalPrice);
        logger.info(cur_user.id + " calculate total price");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleAddProductsToBasket() {
    if (!cur_user){
        console.log("Неавторизованный пользователь не может добавлять позиции в корзину.")
        logger.info("has no permission to update bakset")
        return;
    }
    let basketId;
    if (cur_user.role == 2){
        basketId = await basketController.handleFindByUserId({ params: { userId: cur_user.id } } as any, dummyRes as any);
    }
    else{
        basketId = await prompt('Введите ID корзины: ');
    }
    const productId = await prompt('Введите ID товара: ');
    const productsAmount = +await prompt('Введите количество товара: ');
    try {
        const basket = await basketController.handleAddProductsToBasket({ body: { id: basketId, positions: [{ productId, productsAmount }] } } as any, dummyRes as any);
        console.log('Товары успешно добавлены в корзину:', basket);
        logger.info(cur_user.id + " updated basket");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleRemoveProductsFromBasket() {
    if (!cur_user){
        console.log("Неавторизованный пользователь не может удалять позиции из корзины.")
        logger.info("has no permission to update bakset")
        return;
    }
    let basketId;
    if (cur_user.role == 2){
        basketId = await basketController.handleFindByUserId({ params: { userId: cur_user.id } } as any, dummyRes as any);
    }
    else{
        basketId = await prompt('Введите ID корзины: ');
    }
    const productId = await prompt('Введите ID товара: ');
    const productsAmount = +await prompt('Введите количество товара: ');
    try {
        const basket = await basketController.handleRemoveProductsFromBasket({ body: { id: basketId, positions: [{ productId, productsAmount }] } } as any, dummyRes as any);
        console.log('Товары успешно удалены из корзины:', basket);
        logger.info(cur_user.id + " updated basket");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleCommentCreate() {
    if (!cur_user){
        console.log("Неавторизованный пользователь не может добавлять комментарии.")
        logger.info("has no permission to create comment")
        return;
    }
    if (cur_user.role == 1){
        console.log("Продавец не может добавлять комментарии.")
        logger.info("has no permission to create comment")
        return;
    }
    let userid: string;
    if (cur_user.role == 2){
        userid = cur_user.id;
    }
    else{
        userid = await prompt('Введите ID пользователя: ');
    }
    const productId = await prompt('Введите ID продукта: ');
    const text = await prompt('Введите текст комментария: ');

    try {
        const comment: commentCreateDTO = { userid, productId, text };
        const createdComment = await commentController.create({ body: comment } as any, dummyRes as any);
        logger.info(cur_user.id + " created a comment");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleCommentFindByProductId() {
    const productId = await prompt('Введите ID продукта: ');

    try {
        const comments = await commentController.findByProductId({ params: { productId } } as any, dummyRes as any);
        console.log('Комментарии по продукту:', comments);
        logger.info("find comments by product id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleCommentUpdateRate() {
    if (!cur_user){
        console.log("Неавторизованный пользователь не может изменять рейтинг комментария");
        logger.info("has no permission to update comment")
        return;
    }
    if (cur_user && cur_user.role != 2){
        console.log("Только пользователь может оставлять комментарий")
        logger.info("has no permission to update comment")
        return;
    }
    const id = await prompt('Введите ID комментария: ');
    const rate = +await prompt('Введите новую оценку комментария: ');

    try {
        const updateData: commentUpdateRateDTO = { id, rate };
        const updatedComment = await commentController.updateRate({ body: updateData } as any, dummyRes as any);
        console.log('Обновленный комментарий:', updatedComment);
        logger.info(cur_user.id + " update comment");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleCommentDelete(){
    const commentId = await prompt('Введите ID комментария для удаления: ');

    try {
        const deleted = await commentController.delete({ params: { commentId } } as any, dummyRes as any);
        logger.info("comment deleted");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleCreatePayment() {
    const orderid = await prompt('Введите ID заказа: ');
    try {
        const createdPayment = await paymentController.handleCreatePaymentRequest({ body: { orderid } } as any, dummyRes as any);
        logger.info("payment created");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleUpdatePayment() {
    const id = await prompt('Введите ID платежа: ');
    const orderId = await prompt('Введите ID заказа: ');
    const statusInput = await prompt('Введите статус платежа (true/false): ');
    const sum = +await prompt('Введите сумму платежа: ');
    const status = statusInput === 'true';
    const paymentData: paymentUpdateDTO = {
        orderId, status, sum,
        id
    };
    try {
        const updatedPayment = await paymentController.handleUpdatePaymentRequest({ body: paymentData } as any, dummyRes as any);
        logger.info("payment updated");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleFindPaymentById() {
    const paymentId = await prompt('Введите ID платежа: ');
    try {
        const payment = await paymentController.handleFindPaymentByIdRequest({ params: { paymentId } } as any, dummyRes as any);
        logger.info("payment find by id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

async function handleFindPaymentByOrderId() {
    const orderId = await prompt('Введите ID заказа: ');
    try {
        const payment = await paymentController.handleFindPaymentByOrderIdRequest({ params: { orderId } } as any, dummyRes as any);
        logger.info("payment find by order id");
    } catch (error: any) {
        console.error('Ошибка:', error.message);
        logger.error("err " + error.message);
    }
}

handleInput().then(() => {
    console.log('Программа завершена.');
});
