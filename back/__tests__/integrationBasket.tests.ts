import { PostgresBasketRepository } from '../src/pgRepository/BasketRepository';
import { BasketService } from '../src/services/BasketService';
import { Basket, BasketPosition } from '../src/models/BasketModel';

// Создаем экземпляр репозитория
const basketRepository = new PostgresBasketRepository();
const basketService = new BasketService(basketRepository);

describe('Basket Service Integration Tests', () => {
    let testBasketId: string;

    beforeAll(async () => {
        // Инициализация базы данных перед началом тестов
        await basketRepository.initialize();
    });

    test('create - создание корзины', async () => {
        const newBasket = await basketService.create('2');
        expect(newBasket).toBeDefined();
        expect(newBasket.userId).toBe('2');
        expect(newBasket.positions).toHaveLength(0);
        testBasketId = newBasket.id;
    });

    test('findByuserid - получение корзины по userId', async () => {
        await basketService.findByUserId('2')
        .then((fetchedBasket) => {
            if (fetchedBasket instanceof Error){
                throw(fetchedBasket);
                }
                expect(fetchedBasket).toBeDefined();
                expect(fetchedBasket?.userId).toBe('2');
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('clear - очистка корзины', async () => {
        const result = await basketService.clear(testBasketId);
        expect(result).toBeTruthy();
    });

    test('addProductsToBasket - добавление товаров в корзину', async () => {
        // Создаем новую корзину без позиций
        const newBasket = await basketService.create('2');
        
        // Добавляем товары в корзину
        await basketService.addProductsToBasket({
            id: newBasket.id,
            positions: [
                {productId: '1', productsAmount: 2 },
                {productId: '2', productsAmount: 2 },
            ]
        }).then((updatedBasket) => {
            if (updatedBasket instanceof Error){
                throw(updatedBasket);
                }
                expect(updatedBasket).toBeDefined();
                expect(updatedBasket?.id).toBe(newBasket.id);
                expect(updatedBasket?.userId).toBe('2');
                expect(updatedBasket?.positions).toHaveLength(2);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
            // Проверяем, что общая сумма расчитывается корректно
            await basketService.calculateTotalPrice(newBasket.id)
            .then((total) => {
                if (total instanceof Error){
                    throw(total);
                    }
                    expect(total).toBeGreaterThan(0);
                }).catch((error: Error) => {
                    console.error(error.message);
                    expect(false).toBe(true);
                })
    });

    test('removeProductsFromBasket - удаление товаров из корзины', async () => {
        // Создаем новую корзину с позициями
        const newBasket = await basketService.create('2');
        await basketService.addProductsToBasket({
            id: newBasket.id,
            positions: [
                {productId: '1', productsAmount: 2 },
                {productId: '2', productsAmount: 2 },
            ]
        }).then((total) => {
            if (total instanceof Error){
                throw(total);
                }
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })

        // Удаляем товар из корзины
        const updatedBasket = await basketService.removeProductsFromBasket({
            id: newBasket.id,
            positions: [
                {productId: '1', productsAmount: 2 },
            ]
        }).then((updatedBasket) => {
            if (updatedBasket instanceof Error){
                throw(updatedBasket);
                }
                expect(updatedBasket).toBeDefined();
                expect(updatedBasket?.id).toBe(newBasket.id);
                expect(updatedBasket?.userId).toBe('2');
                expect(updatedBasket?.positions).toHaveLength(1);        
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
        // Проверяем, что общая сумма расчитывается корректно
        await basketService.calculateTotalPrice(newBasket.id)
        .then((total) => {
            if (total instanceof Error){
                throw(total);
                }
                expect(total).toBeGreaterThan(0);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });
});
