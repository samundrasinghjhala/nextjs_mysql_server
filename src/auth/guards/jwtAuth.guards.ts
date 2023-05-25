import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entity/user.entity';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/users/user.service';

//* JWT AUTH GUARD
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const user = await this.jwtService.verifyAsync<User>(token);
                req.user = user;
                return true;
            } catch (err) {
                throw new UnauthorizedException('jwt expired');
            }
        } else {
            throw new UnauthorizedException('token not found');
        }
    }
}

//* ROLE AUTH GUARD
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector,
        private readonly userService: UserService
    ) { }

    async canActivate(context: ExecutionContext): Promise<any> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const req = context.switchToHttp().getRequest();
        const user = await req.user;
        const userData = await this.userService.findByEmail(user.email);
        if (!userData.isAdmin) {
            throw new UnauthorizedException('User is not authorized to perform this action.');
        }
        return true;
    }
}
