import { Controller, Post, Body, Get, Delete, Param, Put, UseGuards, UseInterceptors, Req, UploadedFile, ParseFilePipeBuilder, HttpStatus } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "src/auth/dto/create-user.dto";
import { UpdateUserDto } from "src/auth/dto/update-user.dto";
import { JwtAuthGuard, RolesGuard } from "src/auth/guards/jwtAuth.guards";
import { Roles } from "src/auth/decorators/roles.decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from 'path';



@Controller('users')
export class UserController {
    constructor(
        private readonly userservice: UserService,
    ) { }

    //*1 GET ALL UERS DETAILS FROM DATABASE
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getUseres() {
        const usersData = await this.userservice.findAll();
        const users = usersData.map((user) => {
            const { password, ...rest } = user;
            return rest;
        });
        return users;
    }

    //*2 GET SINGLE USER FROM DATABASE
    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async findOne(@Param('id') id: string): Promise<any> {
        const user = await this.userservice.findOne(id);
        const { password, ...rest } = user;
        return rest;
    }

    //*3 CREATE A USER IN DATABASE
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async create(
        @Body() createUserDto: CreateUserDto,
        @Req() req
    ): Promise<any> {
        const userId = await req.user.userId;
        const user = await this.userservice.create(createUserDto, userId);
        return `A new user with username ${user.username} created successfully!`
    }

    //*4 UPDATE USER
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req
    ): Promise<any> {
        const reqUser = await req.user;
        const result = await this.userservice.update(id, updateUserDto, reqUser);
        return `User with userId ${reqUser.userId} updated successfully.`;
    }

    //*5 DELETE A USER
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async delete(@Param('id') id: string): Promise<any> {
        const result = this.userservice.remove(id);
        return `User with userId ${id} deleted successfully.`;
    }

    //*6 UPLOAD PFX FILE 
    @Post('pfx')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
                },
            }),
        }),
    )
    async uploadPfx(
        @Req() req,
        @Body('userId') userId: string,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'x-pkcs12',
                })
                .addMaxSizeValidator({
                    maxSize: 5000
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                }),
        )
        file: Express.Multer.File,
    ): Promise<any> {
        const reqUser = await req.user;
        const result = await this.userservice.uploadPfx(reqUser, userId, file);
        return { msg: 'Your pfx file uploaded successfully.' };
    }

    //*7 DELETE PFX FILE
    @Delete('pfx/:filename')
    @UseGuards(JwtAuthGuard)
    async deletePfx(
        @Param('filename') filename: string,
        @Body('userId') userId: string,
        @Req() req
    ) {
        const reqUser = await req.user;
        const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
        const result = await this.userservice.deletePfx(reqUser, userId, filePath);
        return `${filename} is deleted successfully.`;
    }

}