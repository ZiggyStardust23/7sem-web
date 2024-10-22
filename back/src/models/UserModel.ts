import { returnUserDTO, userRole } from "../dto/UserDTO";

export class User {
    private _id = "";
    get id(): string{
        return this._id;
    }
    set id(idToSet: string){
        this._id = idToSet;
    }

    private _email = "";
    get email(): string{
        return this._email;
    }
    set email(nameToSet: string){
        this._email = nameToSet;
    }

    private _phone_number = "";
    get phone_number(): string{
        return this._phone_number;
    }
    set phone_number(phone_numberToSet: string){
        this._phone_number = phone_numberToSet;
    }

    private _name = "";
    get name(): string{
        return this._name;
    }
    set name(nameToSet: string){
        this._name = nameToSet;
    }

    private _password = "";
    get password(): string{
        return this._password;
    }
    set password(passwordToSet: string){
        this._password = passwordToSet;
    }

    private _role: userRole = userRole.UserRoleCustomer;
    get role(): userRole{
        return this._role;
    }
    set role(userRoleToSet: userRole){
        this._role = userRoleToSet;
    }

    constructor(id: string, name: string, email: string, password: string, phone_number: string,
    role: userRole){
        this._id = id;
        this._name = name;
        this._email = email;
        this._password = password;
        this._phone_number = phone_number;
        this._role = role;
    }

    public toDTO(): returnUserDTO{
        return {
            id: this.id,
            email: this.email,
            phone_number: this.phone_number,
            name: this.name,
            role: this.role,
        }
    }
}