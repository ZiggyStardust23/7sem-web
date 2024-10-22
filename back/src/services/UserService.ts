import { User } from "../models/UserModel";
import { IUserRepository } from "../pgRepository/UserRepository";
import { createDTO, loginDTO, registrationDTO, returnUserDTO, updateDTO, userRole } from "../dto/UserDTO";
import * as bcrypt from 'bcrypt';
import { BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from "../errors/requestErrors";

export interface IUserService {
    registration(regDTO: registrationDTO): Promise<returnUserDTO | Error>
    login(logDTO: loginDTO): Promise<returnUserDTO | Error>
    createUser(cDTO: createDTO): Promise<returnUserDTO | Error>
    findUserById(id: string): Promise<returnUserDTO | Error> 
    findUserByEmail(email: string): Promise<returnUserDTO | Error>
    updateUser(upDTO: updateDTO): Promise<returnUserDTO | Error>
}

export async function hashPswd(pswdToHash: string): Promise<string>{
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(pswdToHash, salt);
    return Promise.resolve(hashedPassword)
}

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) {}

    async registration(user: User): Promise<User> {
        const checkEmail = await this.userRepository.getByEmail(user.email);
        if (checkEmail != null){
            throw new BadRequestError("This email is already in db");
        }
        user.password = await hashPswd(user.password);
        const userCreated = await this.userRepository.create(user);
        return Promise.resolve (userCreated)
    }

    async login(logDTO: loginDTO): Promise<User> {
        const checkEmail = await this.userRepository.getByEmail(logDTO.email);
        if (checkEmail == null){
            throw new NotFoundError("User not found by email");
        }

        const result = await bcrypt.compare(logDTO.password, checkEmail.password);
        if (!result)
            throw new UnauthorizedError();
        return Promise.resolve (checkEmail);
    }

    async createUser(user: User): Promise<User>{
        const checkEmail = await this.userRepository.getByEmail(user.email);
        if (checkEmail != null){
            throw new BadRequestError("This email is already in db");
        }
        user.password = await hashPswd(user.password);
        const userCreated = await this.userRepository.create(user);
        return Promise.resolve (userCreated)
    }

    async findUserById(id: string): Promise<User> {
        const userGetted = await this.userRepository.getById(id);
        if (userGetted == null){
            throw new NotFoundError("User not found by id");
        }
        return Promise.resolve (userGetted)
    }

    async findUserByEmail(email: string): Promise<returnUserDTO | Error> {
        const userGetted = await this.userRepository.getByEmail(email);
        if (userGetted == null){
            return Promise.reject(new Error("user not found by this email"));
        }
        return Promise.resolve (userGetted.toDTO())
    }

    async updateUser(user: User): Promise<User> {
        if (user.password){
            user.password = await hashPswd(user.password); 
        }
        const userUpdated = await this.userRepository.update(user);
        if (userUpdated == null){
            throw new NotFoundError("User not found");
        }
        return Promise.resolve(userUpdated)
    }
}