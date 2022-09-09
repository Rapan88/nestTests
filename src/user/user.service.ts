import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {CreateUserDto} from "./dto/create-user.dto";
import UserEntity from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {sign} from "jsonwebtoken";
import {JWT_SECRET} from "../config";
import {UserResponseInterface} from "../types/userResponse.interface";
import {LoginUserDto} from "./dto/login-user.dto";
import {compare} from 'bcrypt'
import {UpdateUserDto} from "./dto/updateUser.dto";


@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOneBy({
            email: createUserDto.email,
        });
        const userByUsername = await this.userRepository.findOneBy({
            username: createUserDto.username,
        });
        if (userByEmail || userByUsername) {
            throw new HttpException('Email or username are taken', HttpStatus.UNPROCESSABLE_ENTITY)
        }
        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        console.log(newUser)
        return await this.userRepository.save(newUser);
    }

    findById(id: number): Promise<UserEntity>{
        return this.userRepository.findOneBy({id})
    }

    generateJwt(user: UserEntity): any {
        return sign({user}, JWT_SECRET)
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity>{
        const user = await this.findById(userId)
        Object.assign(user, updateUserDto)
        return await this.userRepository.save(user)
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user)
            }
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {

        const user = await this.userRepository.findOneBy(
            {email: loginUserDto.email})
        if (!user) {
            throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const isPasswordCorrect = await compare(loginUserDto.password, user.password)
        if (!isPasswordCorrect) {
            throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        delete user.password;

        return user;
    }
}