import { UserService, IUserService, hashPswd } from "../services/UserService";
import { registrationDTO, loginDTO, createDTO, updateDTO, returnUserDTO } from "../dto/UserDTO";
import { Request, Response } from "express";
import { User } from "../models/UserModel";

export interface IUserController {
    handleRegistrationRequest(req: Request, res: Response): Promise<string | null>;
    handleLoginRequest(req: Request, res: Response): Promise<returnUserDTO | null>;
    handleCreateUserRequest(req: Request, res: Response): Promise<void>;
    handleFindUserByIdRequest(req: Request, res: Response): Promise<void>;
    handleFindUserByEmailRequest(req: Request, res: Response): Promise<void>;
    handleUpdateUserRequest(req: Request, res: Response): Promise<void>;
}

export class UserController implements IUserController {
    private userService: IUserService;

    constructor(userService: IUserService) {
        this.userService = userService;
    }

    async handleRegistrationRequest(req: Request, res: Response): Promise<string | null> {
        try {
            const { email, name, phone_number, password } = req.body;
            const regDTO: registrationDTO = { email, name, phone_number, password };
            const user = await this.userService.registration(regDTO);
            if (user instanceof Error){
                throw user;
            }
            res.status(200).json(user);
            return user.id;
        } catch (error: any) {
            res.status(400).json({ error: error.message });
            return null;
        }
    }

    async handleLoginRequest(req: Request, res: Response): Promise<returnUserDTO | null> {
        try {
            const { email, password } = req.body;
            const logDTO: loginDTO = { email, password };
            const user = await this.userService.login(logDTO);
            res.status(200).json(user);
            if (user instanceof Error){
                throw user;
            }
            return Promise.resolve(user)
        } catch (error: any) {
            res.status(400).json({ error: error.message });
            return null
        }
    }

    async handleCreateUserRequest(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, phone_number, password, role } = req.body;
            const cDTO: createDTO = { email, name, phone_number, password, role };
            const user = await this.userService.createUser(cDTO);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async handleFindUserByIdRequest(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const user = await this.userService.findUserById(id);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async handleFindUserByEmailRequest(req: Request, res: Response): Promise<void> {
        try {
            const email = req.params.email;
            const user = await this.userService.findUserByEmail(email);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async handleUpdateUserRequest(req: Request, res: Response): Promise<void> {
        try {
            const { id, email, name, phone_number, password, role } = req.body;
            const upDTO: updateDTO = { id, email, name, phone_number, password, role };
            const user = await this.userService.updateUser(upDTO);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
