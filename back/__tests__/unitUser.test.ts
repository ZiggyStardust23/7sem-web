import { UserService } from '../src/services/UserService'
import { IUserRepository } from '../src/pgRepository/UserRepository';
import { User } from '../src/models/UserModel';
import { mock, instance, when, anything } from 'ts-mockito';
import { userRole } from '../src/dto/UserDTO';
import { hashPswd } from '../src/services/UserService';

describe('UserService', () => {
    let userService: UserService;
    let userRepository: IUserRepository;

    beforeEach(() => {
        userRepository = mock<IUserRepository>();
        userService = new UserService(instance(userRepository));
    });

    it('should create user by registration', async () => {
        const createdUser = new User('1', 'Vanya', 'test@example.com', 'ITSHASHEDPASSWORD', '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getByEmail('test@example.com')).thenResolve(null);
        when(userRepository.create(anything())).thenResolve(createdUser);
    
        userService.registration({
                                name: 'Vanya', 
                                email: 'test@example.com', 
                                password: 'password', 
                                phone_number: '1234567890', 
                                }).then((result) => {
                                    expect(result).toEqual({id: '1', name: 'Vanya', email: 'test@example.com', phone_number: '1234567890', role: userRole.UserRoleCustomer});
                                }).catch((error: Error) => {
                                    console.error(error.message);
                                })
    });

    it('should not create user by registration, this email already in db', async () => {

        when(userRepository.getByEmail('test@example.com')).thenResolve(null);
    

        userService.registration({
                                name: 'Vanya', 
                                email: 'test@example.com', 
                                password: 'password', 
                                phone_number: '1234567890', 
                                }).then((result) => {
                            }).catch((error: Error) => {
                                expect(error.message).toEqual("This email is already in db");
                            })
    });

    it('login: success', async () => {
        const hashed = await hashPswd("password");
        const loginUser = new User('1', 'Vanya', 'test@example.com', hashed, '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getByEmail('test@example.com')).thenResolve(loginUser);
    

        userService.login({email: 'test@example.com', 
                            password: 'password', 
                            }).then((result) => {
                            expect(result).toEqual({id: '1', name: 'Vanya', email: 'test@example.com', phone_number: '1234567890', role: userRole.UserRoleCustomer});
                        }).catch((error: Error) => {
                            console.error(error.message);
                        })

    });

    it('login: this email not in db', async () => {

        when(userRepository.getByEmail('someemail@example.com')).thenResolve(null);
    

        userService.login({email: 'someemail@example.com', 
                            password: 'password', 
                            }).then((result) => {
                        }).catch((error: Error) => {
                            expect(error.message).toEqual("wrong email");
                        });
    });

    it('login: bad password', async () => {
        
        const hashed = await hashPswd("password");
        const loginUser = new User('1', 'Vanya', 'test@example.com', hashed, '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getByEmail('test@example.com')).thenResolve(loginUser);
    

        userService.login({email: 'test@example.com', 
                           password: 'badpassword', 
                                }).then((result) => {
                            }).catch((error: Error) => {
                                expect(error.message).toEqual("wrong password");
                            });

    });

    it('should create user', async () => {
        const createdUser = new User('1', 'Vanya', 'test@example.com', 'ITSHASHEDPASSWORD', '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getByEmail('test@example.com')).thenResolve(null);
        when(userRepository.create(anything())).thenResolve(createdUser);
    
        userService.createUser({
                                name: 'Vanya', 
                                email: 'test@example.com', 
                                password: 'password', 
                                phone_number: '1234567890', 
                                role: userRole.UserRoleCustomer}
                                ).then((result) => {   
                                    expect(result).toEqual({id: '1',
                                        name: 'Vanya', 
                                        email: 'test@example.com', 
                                        phone_number: '1234567890', 
                                        role: userRole.UserRoleCustomer});})
                                .catch((error: Error) => {
                                    console.error(error.message);
                                })
    });

    it('should not create user, this email already in db', async () => {
        const createdUser = new User('1', 'Vanya', 'test@example.com', 'password', '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getByEmail('test@example.com')).thenResolve(createdUser);
    
        userService.createUser({name: 'Vanya', 
                                email: 'test@example.com', 
                                password: 'password', 
                                phone_number: '1234567890', 
                                role: userRole.UserRoleCustomer})
                                .then((result) => {
                                }).catch((error: Error) => {
                                    expect(error.message).toEqual("this email is already in db");
                                });
    });

    it('should find user by id', async () => {
        const userid = '1';
        const user = new User(userid, 'Vanya', 'test@example.com', 'password', '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getById(userid)).thenResolve(user);

        userService.findUserById(userid)
                .then((result) => {   
                    expect(result).toEqual({id: '1',
                    name: 'Vanya', 
                    email: 'test@example.com', 
                    phone_number: '1234567890', 
                    role: userRole.UserRoleCustomer});})
                .catch((error: Error) => {
                    console.error(error.message);
                })
    });

    it('should find user by email', async () => {
        const userEmail = 'test@example.com';
        const user = new User('1', 'Vanya', 'test@example.com', 'password', '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getByEmail(userEmail)).thenResolve(user);

        userService.findUserByEmail(userEmail).then((result) => {   
            expect(result).toEqual({id: '1',
                            name: 'Vanya', 
                            email: 'test@example.com', 
                            phone_number: '1234567890', 
                            role: userRole.UserRoleCustomer})})
        .catch((error: Error) => {
            console.error(error.message);
        })
    });

    it('should update user', async () => {
        const userid = '1';
        const userToUpdate = new User(userid, 'Vanya', 'test@example.com', 'password', '1234567890', userRole.UserRoleCustomer);
        const updatedUser = new User(userid, 'Ivan', 'test@example.com', 'password', '1234567890', userRole.UserRoleCustomer);

        when(userRepository.getById(userid)).thenResolve(userToUpdate);
        when(userRepository.update(anything())).thenResolve(updatedUser);

        userService.updateUser({id: '1',
                                name: 'Vanya', 
                                email: 'test@example.com', 
                                password: 'password', 
                                phone_number: '1234567890', 
                                role: userRole.UserRoleCustomer}).then((result) => {   
                                    expect(result).toEqual({id: '1',
                                    name: 'Ivan', 
                                    email: 'test@example.com', 
                                    phone_number: '1234567890', 
                                    role: userRole.UserRoleCustomer});})
                                .catch((error: Error) => {
                                    console.error(error.message);
                                })
    });

    it('should not update user, because there is no such user in db', async () => {
        const userid = '1';
        const userToUpdate = new User(userid, 'Vanya', 'test@example.com', 'password', '1234567890', userRole.UserRoleCustomer);

        when(userRepository.update(anything())).thenResolve(null);

        userService.updateUser({id: '1',
                                name: 'Vanya', 
                                email: 'test@example.com', 
                                password: 'password', 
                                phone_number: '1234567890', 
                                role: userRole.UserRoleCustomer}).then((result) => {
                                }).catch((error: Error) => {
                                    expect(error.message).toEqual("user to update not found by id");
                                });
    });
});
