import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { JwtService } from "@nestjs/jwt";

@Controller('auth')
export class AuthController {
    constructor(
        private authservice: AuthService,
        private jwtService: JwtService
    ) { }

    //* LOGIN A USER 
    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto
    ) {
        const user = await this.authservice.validateUser(loginUserDto.email, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid Credentials!')
        }
        const payload = { email: user.email, userId: user.userId, isAdmin: user.isAdmin, sub: user.id };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }


}