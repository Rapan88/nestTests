import {BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {hash} from 'bcrypt'
import {ArticleEntity} from "../article/article.entity";

@Entity()
export default class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column({default: ''})
    username: string

    @Column({default: ''})
    bio: string

    @Column({default: ''})
    image: string

    @Column()
    password: string

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10)
    }

    @OneToMany(() => ArticleEntity, (article) => article.author)
    articles: ArticleEntity []
}