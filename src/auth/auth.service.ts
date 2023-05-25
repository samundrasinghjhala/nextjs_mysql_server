import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { UserService } from "src/users/user.service";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService
    ) { }

    //* VALIDATE LOGIN CREDENTIALS
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }

        return null;
    }
}