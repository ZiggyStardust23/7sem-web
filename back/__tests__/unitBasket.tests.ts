import { IBasketRepository } from '../src/pgRepository/BasketRepository'
import { BasketService } from '../src/services/BasketService'
import { Basket, BasketPosition} from '../src/models/BasketModel';
import { mock, instance, when, anything } from 'ts-mockito';
import { Phone } from "../src/models/PhoneModel"

describe('BasketService', () => {
    let basketService: BasketService;
    let basketRepository: IBasketRepository;

    beforeEach(() => {
        basketRepository = mock<IBasketRepository>();
        basketService = new BasketService(instance(basketRepository));
    });

    it('should create a basket', async () => {
        const userId = "test";
        const positions:BasketPosition[] = [];

        const basketCreated = new Basket(
            "test", 
            userId, 
            positions
        )
        when(basketRepository.create(userId)).thenResolve(basketCreated);
    
        basketService.create(userId).then((result) => {
            expect(result).toEqual({
                id: "test",
                userId: userId,
                positions: [],});
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('findByUserId: success', async () => {
        const userId = "test";
        const positions = [new BasketPosition("test1", "test", "p1", 3), new BasketPosition("test2", "test", "p2", 3)];

        const basketToFind = new Basket(
            "test", 
            userId, 
            positions
        )

        when(basketRepository.getByuserid("test")).thenResolve(basketToFind);
    
        basketService.findByUserId("test").then((result) => {
            expect(result).toEqual({
                id: "test",
                userId: userId,
                positions: [
                    {
                        id: "test1",
                        basketId: "test",
                        productId: "p1",
                        productsAmount: 3
                    },
                    {
                        id: "test2",
                        basketId: "test",
                        productId: "p2",
                        productsAmount: 3
                    }
                ]});
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('findByUserId: fail', async () => {

        when(basketRepository.getByuserid("badid")).thenResolve(null);
    
        basketService.findByUserId("badid").then((result) => {
            if (result instanceof Error) {
                throw result
            }
        }).catch((error: Error) => {
            expect(error.message).toEqual("basket not found by id");
        });
    });

    it('clear: success', async () => {
        const basketId = "test";
        when(basketRepository.clearBasket(basketId)).thenResolve(true);
    
        basketService.clear(basketId).then((result) => {
            expect(result).toEqual(true);
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
    it('clear: fail, basket not found', async () => {
        const basketId = "badid";
        when(basketRepository.clearBasket(basketId)).thenResolve(false);
    
        basketService.clear(basketId).then((result) => {
            expect(result).toEqual(false);
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
    it('calculateTotalPrice', async () => {
        const basketId = "test";
        const userid = "test";
        const positions = [new BasketPosition("test1", "test", "p1", 3), new BasketPosition("test2", "test", "p2", 3)];

        const basket = new Basket(
            "test", 
            userid, 
            positions
        )

        const phone1 = new Phone("p1", "test", "test", "test", 10, 10, 10, 100);
        const phone2 = new Phone("p1", "test", "test", "test", 10, 10, 10, 200);

        when(basketRepository.getById(basketId)).thenResolve(basket);
        when(basketRepository.calculateTotalPrice(basketId)).thenResolve(
            phone1.price * positions[0].productsAmount +
            phone2.price * positions[1].productsAmount
        );
    
        basketService.calculateTotalPrice(basketId).then((result) => {
            expect(result).toEqual(
                phone1.price * positions[0].productsAmount +
                phone2.price * positions[1].productsAmount
            );
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('should succesfully add positions to basket', async () => {
        const userId = "test";
        const positions = [new BasketPosition("test1", "test", "p1", 3), new BasketPosition("test2", "test", "p2", 3)];
        const positionsUpdated = [new BasketPosition("test1", "test", "p1", 3), new BasketPosition("test2", "test", "p2", 3), new BasketPosition("test3", "test", "p3", 3)];

        const basketToFind = new Basket(
            "test", 
            userId, 
            positions
        )

        const basketUpdated = new Basket(
            "test", 
            userId, 
            positionsUpdated
        )

        when(basketRepository.getById("test")).thenResolve(basketToFind);
        when(basketRepository.update(anything())).thenResolve(basketUpdated);
    
        basketService.addProductsToBasket({     
            id: "test",       
            positions: [
                {
                    productId: "p2",
                    productsAmount: 3,
                },
                {
                    productId: "p3",
                    productsAmount: 3,
                }
            ],
        }).then((result) => {
            expect(result).toEqual({
                id: "test",
                userId: userId,
                positions: [
                    {
                        id: "test1",
                        basketId: "test",
                        productId: "p1",
                        productsAmount: 3
                    },
                    {
                        id: "test2",
                        basketId: "test",
                        productId: "p2",
                        productsAmount: 3
                    },
                    {
                        id: "test3",
                        basketId: "test",
                        productId: "p3",
                        productsAmount: 3
                    }
                ]});
        }).catch((error: Error) => {
            console.error(error.message);
        })
    });
    it('should succesfully remove positions from basket', async () => {
        const userId = "test";
        const positions = [new BasketPosition("test1", "test", "p1", 3), new BasketPosition("test2", "test", "p2", 3)];
        const positionsToRemove = [new BasketPosition("", "", "p2", 3)];
        const positionsUpdated = [new BasketPosition("test1", "test", "p1", 3)];

        const basketToFind = new Basket(
            "test", 
            userId, 
            positions
        )

        const basketUpdated = new Basket(
            "test", 
            userId, 
            positionsUpdated
        )

        when(basketRepository.getById("test")).thenResolve(basketToFind);
        when(basketRepository.update(anything())).thenResolve(basketUpdated);
    
        basketService.removeProductsFromBasket({     
            id: "test",       
            positions: [
                {
                    productId: "p2",
                    productsAmount: 3,
                },
            ]}).then((result) => {
                expect(result).toEqual({
                    id: "test",
                    userId: userId,
                    positions: [
                        {
                            id: "test1",
                            basketId: "test",
                            productId: "p1",
                            productsAmount: 3
                        },
                    ]});
            }).catch((error: Error) => {
                console.error(error.message);
            })
    });
});
