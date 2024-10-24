import express, { Express, Request, Response } from "express";
import { Pool } from "pg";
import * as conf from '../../config'
import swaggerUi from "swagger-ui-express";
import YAML from 'yamljs';
import { UserController } from "../controllers/UserContoller";
import { PhoneController } from "../controllers/PhoneController";
import { OrderController } from "../controllers/OrderController";
import { BasketController } from "../controllers/BasketController";
import { PaymentController } from "../controllers/PaymentController";
import { WishController } from "../controllers/WishController";
import { CommentController } from "../controllers/CommentController";

const app: Express = express();
const PORT = 3000;

app.use(express.json());

const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Controllers

const userController = new UserController();
const phoneContoller = new PhoneController();
const orderController = new OrderController();
const basketController = new BasketController();
const paymentController = new PaymentController();
const wishController = new WishController();
const commentController = new CommentController();


const pool = new Pool({
        user: conf.user,
        password: conf.password,
        host: conf.host,
        port: conf.port,
        database: conf.database
    });

//USERS
app.get('/api/users/:id/basket', async (req: Request, res: Response) => {
    userController.getUserBasket(req, res);
});

app.get('/api/users/:id/orders', async (req: Request, res: Response) => {
    userController.getUserOrders(req, res);
});

app.get('/api/users/:id/wishes', async (req: Request, res: Response) => {
    userController.getUserWishes(req, res);
});

app.post('/api/users/login', async (req, res) => {
    userController.login(req, res);
});

app.post('/api/users/reg', async (req: Request, res: Response) => {
    userController.register(req, res);
});

app.post('/api/users/', async (req: Request, res: Response) => {
    userController.createUser(req, res);
});

app.patch('/api/users/:id', async (req: Request, res: Response) => {
    userController.updateUser(req, res);
});

//PHONES
app.get('/api/phones/:id', async (req: Request, res: Response) => {
    phoneContoller.getPhone(req, res);
});

app.get('/api/phones/:id/comments', async (req: Request, res: Response) => {
    phoneContoller.getPhoneComments(req, res);
});

app.post('/api/phones', async (req: Request, res: Response) => {
    phoneContoller.getPhones(req, res);
});

app.patch('/api/phones/:id', async (req: Request, res: Response) => {
    phoneContoller.updatePhone(req, res);
});

app.delete('/api/phones/:id', async (req: Request, res: Response) => {
    phoneContoller.deletePhone(req, res);
});

//ORDERS
app.patch('/api/orders/:id', async (req: Request, res: Response) => {
    orderController.updateOrder(req, res);
});

app.delete('/api/orders/:id', async (req: Request, res: Response) => {
    orderController.deleteOrder(req, res);
});

app.post('/api/orders/', async (req: Request, res: Response) => {
    orderController.createOrder(req, res);
});

app.get('/api/orders/:id', async (req: Request, res: Response) => {
    orderController.getOrder(req, res);
});

app.get('/api/orders/:id/payment', async (req: Request, res: Response) => {
    orderController.getOrderPayment(req, res);
});

//PAYMENTS

app.post('/api/payments', async (req: Request, res: Response) => {
    paymentController.createPayment(req, res);
});

app.get('/api/payments/:id', async (req: Request, res: Response) => {
    paymentController.getPaymentById(req, res);
});

app.patch('/api/payments/:id', async (req: Request, res: Response) => {
    paymentController.updatePayment(req, res);
});

app.delete('/api/payments/:id', async (req: Request, res: Response) => {
    paymentController.deletePayment(req, res);
});

//BASKETS

app.post('/api/baskets', async (req: Request, res: Response) => {
    basketController.createBasket(req, res);
});

app.delete('/api/baskets/:id', async (req: Request, res: Response) => {
    basketController.removeProductsFromBasket(req, res);
});

app.get('/api/baskets/:id/price', async (req: Request, res: Response) => {
    basketController.calculateTotalPrice(req, res);
});

app.post('/api/baskets/:id', async (req: Request, res: Response) => {
    basketController.addProductsToBasket(req, res);
});

//COMMENTS

app.post('/api/comments', async (req: Request, res: Response) => {
    commentController.createComment(req, res);
});

app.patch('/api/comments/:id/rate', async (req: Request, res: Response) => {
    commentController.rateComment(req, res);
});

app.delete('/api/comments/:id', async (req: Request, res: Response) => {
    commentController.deleteComment(req, res);
});

//WISHES
app.post('/api/wishes', async (req: Request, res: Response) => {
    wishController.createWish(req, res);
});

app.delete('/api/wishes/:id', async (req: Request, res: Response) => {
    wishController.deleteWish(req, res);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});