import {Body, Controller, Post} from "@nestjs/common";
import {UserService} from "./user.service";
import {CreateUserDto} from "../dto/create-user.dto";
import UserEntity from "./user.entity";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Post()
    async createUser(@Body('user') user: CreateUserDto):Promise<UserEntity> {
        return await this.userService.createUser(user);

    }
}
