import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JwtConfig } from "src/config/jwt.config";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync(JwtConfig)
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService, TypeOrmModule]
})
export class UserModule { }