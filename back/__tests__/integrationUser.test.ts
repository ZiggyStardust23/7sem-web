import bcrypt from 'bcrypt';
import { PostgresUserRepository } from '../src/pgRepository/UserRepository';
import { UserService } from '../src/services/UserService';
import { User } from '../src/models/UserModel';
import { userRole, returnUserDTO } from '../src/dto/UserDTO'
import { generateRandomString } from '../src/utils'
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env
dotenv.config();

// Создаем экземпляр репозитория
const userRepository = new PostgresUserRepository();
const userService = new UserService(userRepository);

describe('User Repository Tests', () => {
    let testuserid: string;
    let testUserEmail: string;

    test('createUser - создание пользователя', async () => {
        await userRepository.initialize();
        const newUser = new User('', 'Test User', generateRandomString(15), 'password', '0987654321', userRole.UserRoleSeller);
        await userService.createUser({email: newUser.email, name: 'Test User', password: 'password', phone_number: '0987654321', role: userRole.UserRoleSeller})
        .then((createdUser) => {
            if (createdUser instanceof Error){
                throw(createdUser);
            }
            expect(createdUser).toBeDefined();
            expect(createdUser?.id).toBeDefined();
            expect(createdUser?.name).toBe(newUser.name);
            expect(createdUser?.email).toBe(newUser.email);
            expect(createdUser?.phone_number).toBe(newUser.phone_number);
            expect(createdUser?.role).toBe(newUser.role);
            testuserid = createdUser!.id;
            testUserEmail = createdUser!.email;
        }).catch((error: Error) => {
            console.error(error.message);
            expect(false).toBe(true);
        })
    });

    test('login - авторизация пользователя', async () => {
        const newUser = new User('', 'Test User', testUserEmail, 'password', '0987654321', userRole.UserRoleSeller);
        await userService.login({email: testUserEmail, password: 'password'})
            .then((createdUser) => {
            if (createdUser instanceof Error){
                throw(createdUser);
                }
                expect(createdUser).toBeDefined();
                expect(createdUser?.id).toBeDefined();
                expect(createdUser?.name).toBe(newUser.name);
                expect(createdUser?.email).toBe(newUser.email);
                expect(createdUser?.phone_number).toBe('0987654321');
                expect(createdUser?.role).toBe(newUser.role);
                testuserid = createdUser!.id; // Сохраняем id созданного пользователя для использования в других тестах
                testUserEmail = createdUser!.email;
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('registration - регистрация пользователя', async () => {
        const newUser = new User('', 'Test User', generateRandomString(15), 'password', '0987654321', userRole.UserRoleCustomer);
        await userService.registration({email: newUser.email, name: 'Test User', password: 'password', phone_number: '0987654321'})
        .then((createdUser) => {
            if (createdUser instanceof Error){
                throw(createdUser);
                }
                expect(createdUser).toBeDefined();
                expect(createdUser?.id).toBeDefined();
                expect(createdUser?.name).toBe(newUser.name);
                expect(createdUser?.email).toBe(newUser.email);
                expect(createdUser?.phone_number).toBe(newUser.phone_number);
                expect(createdUser?.role).toBe(newUser.role);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('findUserById - получение пользователя по ID', async () => {
        await userService.findUserById(testuserid)
        .then((fetchedUser) => {
            if (fetchedUser instanceof Error){
                throw(fetchedUser);
                }
                expect(fetchedUser).toBeDefined();
                expect(fetchedUser?.id).toBe(testuserid);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });
    test('findUserById - получение пользователя по ID', async () => {
        await userService.findUserByEmail(testUserEmail)
        .then((fetchedUser) => {
            if (fetchedUser instanceof Error){
                throw(fetchedUser);
                }
                expect(fetchedUser).toBeDefined();
            expect(fetchedUser?.id).toBe(testuserid);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    test('updateUser - обновление данных пользователя', async () => {
        await userService.updateUser({id: testuserid, email: 'updated@example.com', name: 'Updated Name', password: 'password', phone_number: '9876543210', role: userRole.UserRoleAdmin})
        .then((updatedUser) => {
            if (updatedUser instanceof Error){
                throw(updatedUser);
                }
                expect(updatedUser).toBeDefined();
                expect(updatedUser?.id).toBe(testuserid);
                expect(updatedUser?.name).toBe('Updated Name');
                expect(updatedUser?.email).toBe('updated@example.com');
                expect(updatedUser?.phone_number).toBe('9876543210');
                expect(updatedUser?.role).toBe(userRole.UserRoleAdmin);
            }).catch((error: Error) => {
                console.error(error.message);
                expect(false).toBe(true);
            })
    });

    //Такого метода в service нет
    test('delete - удаление пользователя', async () => {
        const deleted = await userRepository.delete(testuserid);
        expect(deleted).toBeTruthy();
        const fetchedUser = await userRepository.getById(testuserid);
        expect(fetchedUser).toBeNull();
    });
});
