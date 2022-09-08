import {Body, Controller, Get, Post, UsePipes, ValidationPipe} from "@nestjs/common";
import {UserService} from "./user.service";
import {CreateUserDto} from "../dto/create-user.dto";
import {UserResponseInterface} from "../types/userResponse.interface";
import {LoginUserDto} from "../dto/login-user.dto";
import {User} from "./decorators/user.decorator";
import UserEntity from "./user.entity";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Post('createUser')
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
        const user = await this.userService.createUser(createUserDto);
        return this.userService.buildUserResponse(user)
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
        const user = await this.userService.login(loginUserDto)
        return this.userService.buildUserResponse(user)
    }

    @Get()
    async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
        return this.userService.buildUserResponse(user)
    }


}
