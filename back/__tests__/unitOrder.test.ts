import { IOrderRepository } from '../src/pgRepository/OrderRepository'
import { OrderService } from '../src/services/OrderService'
import { Order, OrderPosition, OrderStatus } from '../src/models/OrderModel';
import { mock, instance, when, anything } from 'ts-mockito';

describe('OrderService', () => {
    let orderService: OrderService;
    let orderRepository: IOrderRepository;

    beforeEach(() => {
        orderRepository = mock<IOrderRepository>();
        orderService = new OrderService(instance(orderRepository));
    });

    it('should create an order', async () => {
        const userid = "test";
        const adress = "someaddress";
        const positions = [new OrderPosition("test1", "", "p1", 3), new OrderPosition("test2", "", "p2", 3)];

        const someDate = new Date();
        const orderCreated = new Order(
            "test", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positions
        )
        when(orderRepository.create(anything())).thenResolve(orderCreated);
    
        orderService.create({            
            userid: userid,
            address: adress,
            positions: [{
                productId: "p1",
                productsAmount: 3
            },
            {
                productId: "p2",
                productsAmount: 3
            }
        ]
        }).then((result) => {
            expect(result).toEqual({
                id: "test",
                userid: userid,
                status: OrderStatus.PLACED,
                date: someDate,
                address: adress,
                positions: [{
                    id: "test1",
                    orderId: "",
                    productId: "p1",
                    productsAmount: 3
                },
                {
                    id: "test2",
                    orderId: "",
                    productId: "p2",
                    productsAmount: 3
                }
            ]
            });   
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('findById: success', async () => {
        const userid = "test";
        const adress = "someaddress";
        const positions = [new OrderPosition("test1", "", "p1", 3), new OrderPosition("test2", "", "p2", 3)];

        const someDate = new Date();
        const orderToFind = new Order(
            "test", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positions
        )

        when(orderRepository.getById("test")).thenResolve(orderToFind);
    
        orderService.findById("test")
        .then((result) => {
            expect(result).toEqual({
                id: "test",
                userid: userid,
                status: OrderStatus.PLACED,
                address: adress,
                date: someDate,
                positions: [{
                    id: "test1",
                    orderId: "",
                    productId: "p1",
                    productsAmount: 3
                },
                {
                    id: "test2",
                    orderId: "",
                    productId: "p2",
                    productsAmount: 3
                }
            ]
            });
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('findById: fail', async () => {

        when(orderRepository.getById("test")).thenResolve(null);
    
        orderService.findById("test").then((result) => {
        }).catch((error: Error) => {
            expect(error.message).toEqual("not found in db by id");
        });
    });

    it('findByUserId: success', async () => {
        const userid = "test";
        const adress = "someaddress";
        const positions = [new OrderPosition("test1", "", "p1", 3), new OrderPosition("test2", "", "p2", 3)];

        const someDate = new Date();
        const ordersToFind = [
            new Order(
            "test1", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positions
        ),
        new Order(
            "test2", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positions
        )
        ]

        when(orderRepository.getByUserId("test")).thenResolve(ordersToFind);
    
        orderService.findByUserId("test")
        .then((result) => {
            expect(result).toEqual([
                {
                id: "test1",
                userid: userid,
                status: OrderStatus.PLACED,
                address: adress,
                date: someDate,
                positions: [{
                    id: "test1",
                    orderId: "",
                    productId: "p1",
                    productsAmount: 3
                },
                {
                    id: "test2",
                    orderId: "",
                    productId: "p2",
                    productsAmount: 3
                }
                ]
                },
                {
                id: "test2",
                userid: userid,
                status: OrderStatus.PLACED,
                address: adress,
                date: someDate,
                positions: [{
                    id: "test1",
                    orderId: "",
                    productId: "p1",
                    productsAmount: 3
                },
                {
                    id: "test2",
                    orderId: "",
                    productId: "p2",
                    productsAmount: 3
                }
            ]
            }]);
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
    it('findByUserId: fail', async () => {

        when(orderRepository.getByUserId("test")).thenResolve([]);
    
        orderService.findByUserId("test").then((result) => {
        }).catch((error: Error) => {
            expect(error.message).toEqual("not found in db by id");
        });
    });
    
    it('should succesfully update the status of order', async () => {
        const userid = "test";
        const adress = "someaddress";
        const positions = [new OrderPosition("test1", "", "p1", 3), new OrderPosition("test2", "", "p2", 3)];

        const someDate = new Date();
        const orderToFind = new Order(
            "test", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positions
        )

        const orderUpdated = new Order(
            "test", 
            userid, 
            OrderStatus.PROCESSING,
            adress,
            someDate,
            positions
        )

        when(orderRepository.getById("test")).thenResolve(orderToFind);
        when(orderRepository.update(anything())).thenResolve(orderUpdated);
    
        orderService.updateOrderStatus({     
            id: "test",       
            status: OrderStatus.PROCESSING,
        }).then((result) => {
            expect(result).toEqual({
                id: "test",
                userid: userid,
                status: OrderStatus.PROCESSING,
                address: adress,
                date: someDate,
                positions: [{
                    id: "test1",
                    orderId: "",
                    productId: "p1",
                    productsAmount: 3
                },
                {
                    id: "test2",
                    orderId: "",
                    productId: "p2",
                    productsAmount: 3
                }
            ]
            });
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('update fail: order not found', async () => {
        when(orderRepository.getById("failtest")).thenResolve(null);
    
        orderService.updateOrderStatus({     
            id: "failtest",
            status: OrderStatus.PROCESSING,
        }).then((result) => {
        }).catch((error: Error) => {
            expect(error.message).toEqual("not found in db by id");
        });
    });

    it('should succesfully add positions to order', async () => {
        const userid = "test";
        const adress = "someaddress";
        const positions = [new OrderPosition("test1", "", "p1", 3), new OrderPosition("test2", "", "p2", 3)];
        const positionsToAdd = [new OrderPosition("test2", "", "p2", 3), new OrderPosition("test3", "", "p3", 3)];
        const positionsUpdated = [new OrderPosition("test1", "", "p1", 3), new OrderPosition("test2", "", "p2", 3), new OrderPosition("test3", "", "p3", 3)];

        const someDate = new Date();
        const orderToFind = new Order(
            "test", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positions
        )

        const orderUpdated = new Order(
            "test", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positionsUpdated
        )

        when(orderRepository.getById("test")).thenResolve(orderToFind);
        when(orderRepository.update(anything())).thenResolve(orderUpdated);
    

        orderService.addPositionsToOrder({     
            id: "test",       
            positions: positionsToAdd,
        }).then((result) => {
            expect(result).toEqual({
                id: "test",
                userid: userid,
                status: OrderStatus.PLACED,
                address: adress,
                date: someDate,
                positions: [{
                    id: "test1",
                    orderId: "",
                    productId: "p1",
                    productsAmount: 3
                },
                {
                    id: "test2",
                    orderId: "",
                    productId: "p2",
                    productsAmount: 3
                },
                {
                    id: "test3",
                    orderId: "",
                    productId: "p3",
                    productsAmount: 3
                }
            ]
            });
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
    it('should succesfully remove positions from order', async () => {
        const userid = "test";
        const adress = "someaddress";
        const positions = [new OrderPosition("test1", "", "p1", 3), new OrderPosition("test2", "", "p2", 3)];
        const positionsToRemove = [new OrderPosition("test2", "", "p2", 3)];
        const positionsUpdated = [new OrderPosition("test1", "", "p1", 3)];

        const someDate = new Date();
        const orderToFind = new Order(
            "test", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positions
        )

        const orderUpdated = new Order(
            "test", 
            userid, 
            OrderStatus.PLACED,
            adress,
            someDate,
            positionsUpdated
        )

        when(orderRepository.getById("test")).thenResolve(orderToFind);
        when(orderRepository.update(anything())).thenResolve(orderUpdated);
    
        orderService.removePositionsFromOrder({     
            id: "test",       
            positions: positionsToRemove,
        }).then((result) => {
            expect(result).toEqual({
                id: "test",
                userid: userid,
                status: OrderStatus.PLACED,
                address: adress,
                date: someDate,
                positions: [{
                    id: "test1",
                    orderId: "",
                    productId: "p1",
                    productsAmount: 3
                },
            ]
            });
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
});
