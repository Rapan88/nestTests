import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export default class UserEntity {
    @PrimaryGeneratedColumn()
    private id: number

    @Column()
    name: string

    @Column()
    surname: string
}