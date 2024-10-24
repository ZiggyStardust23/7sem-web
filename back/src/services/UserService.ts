import { User } from "../models/UserModel";
import { IUserRepository } from "../pgRepository/UserRepository";
import { createDTO, loginDTO, registrationDTO, returnUserDTO, updateDTO, userRole } from "../dto/UserDTO";
import * as bcrypt from 'bcrypt';
import { BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from "../errors/requestErrors";

export interface IUserService {
    registration(regDTO: registrationDTO): Promise<returnUserDTO>
    login(logDTO: loginDTO): Promise<returnUserDTO>
    createUser(cDTO: createDTO): Promise<returnUserDTO>
    findUserById(id: string): Promise<returnUserDTO> 
    findUserByEmail(email: string): Promise<returnUserDTO>
    updateUser(upDTO: updateDTO): Promise<returnUserDTO>
}

export async function hashPswd(pswdToHash: string): Promise<string>{
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(pswdToHash, salt);
    return Promise.resolve(hashedPassword)
}

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) {}

    async registration(user: User): Promise<returnUserDTO> {
        const checkEmail = await this.userRepository.getByEmail(user.email);
        if (checkEmail != null){
            throw new BadRequestError("This email is already in db");
        }
        user.password = await hashPswd(user.password);
        const userCreated = await this.userRepository.create(user);
        return Promise.resolve(userCreated.toDTO())
    }

    async login(logDTO: loginDTO): Promise<returnUserDTO> {
        const checkEmail = await this.userRepository.getByEmail(logDTO.email);
        if (checkEmail == null){
            throw new NotFoundError("User not found by email");
        }

        const result = await bcrypt.compare(logDTO.password, checkEmail.password);
        if (!result)
            throw new UnauthorizedError();
        return Promise.resolve (checkEmail.toDTO());
    }

    async createUser(user: User): Promise<returnUserDTO>{
        const checkEmail = await this.userRepository.getByEmail(user.email);
        if (checkEmail != null){
            throw new BadRequestError("This email is already in db");
        }
        user.password = await hashPswd(user.password);
        const userCreated = await this.userRepository.create(user);
        return Promise.resolve(userCreated.toDTO())
    }

    async findUserById(id: string): Promise<returnUserDTO> {
        const userGetted = await this.userRepository.getById(id);
        if (userGetted == null){
            throw new NotFoundError("User not found by id");
        }
        return Promise.resolve(userGetted.toDTO())
    }

    async findUserByEmail(email: string): Promise<returnUserDTO> {
        const userGetted = await this.userRepository.getByEmail(email);
        if (userGetted == null){
            return Promise.reject(new Error("user not found by this email"));
        }
        return Promise.resolve(userGetted.toDTO())
    }

    async updateUser(user: User): Promise<returnUserDTO> {
        if (user.password){
            user.password = await hashPswd(user.password); 
        }
        const userUpdated = await this.userRepository.update(user);
        if (userUpdated == null){
            throw new NotFoundError("User not found");
        }
        return Promise.resolve(userUpdated.toDTO())
    }
}