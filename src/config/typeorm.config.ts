import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypeOrmModuleAsyncOptions, TypeOrmModuleOptions} from '@nestjs/typeorm'

export class TypeOrmConfig {
    static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
        return {
            type: "postgres",
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '1111',
            database: 'testNodeNest',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: true,
        }
    }
}

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    useFactory: async (
        configService: ConfigService,): Promise<TypeOrmModuleOptions> => TypeOrmConfig.getOrmConfig(configService),
    inject: [ConfigService]
}