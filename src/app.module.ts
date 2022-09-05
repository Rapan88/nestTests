import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {typeOrmConfigAsync} from "./config/typeorm.config";
import {TagModule} from "./tag/tag.module";
import {UserModule} from "./user/user.module";
import {AuthMiddleware} from "./user/middlewares/auth.middleware";

@Module({
    imports: [ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRootAsync(typeOrmConfigAsync), TagModule, UserModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: '*',
            method: RequestMethod.ALL,
        });
    }
}
