import { Exclude } from "class-transformer";
import { IsEmail } from "class-validator";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { recentSearchEntity } from "./recentSearch.entity";

@Entity()
export class UserEntity{

    @PrimaryGeneratedColumn()
    id : number;

    @Column({length : 64})
    name : string

    @Column({unique : true, length : 24})
    username : string

    @Column({unique : true})
    @IsEmail()
    email : string

    @Exclude()
    @Column({nullable : true, length : 128})
    password : string

    @BeforeInsert()
    async hashPassword(): Promise<void> {
        if (this.password) this.password = await bcrypt.hash(this.password, 10);
    }
    
    async validatePassword(password: string): Promise<boolean> {
        if (this.isOAuthAccount) return true;
        return bcrypt.compare(password, this.password);
    }

    @Exclude()
    @Column({nullable : true, select : false})
    hashedRefreshtoken : string


    @Column({default : false})
    isTwoFactorEnable : boolean

    @Exclude()
    @Column({nullable : true, select : false})
    twoFactorSecret : string

    @Column({nullable : true})
    locale : string

    @Column({default : true})
    isActive : boolean

    @Column({default: false})
    isEmailConfirmed : boolean

    @Column({default : false})
    isOAuthAccount: boolean;
    
    @Exclude()
    @Column({ default : false})
    isGoogleAccount : boolean

    @Exclude()
    @Column({default : false})
    isGithubAccount : boolean

    @Column({default : '#b3e6ff'})
    color : string




    @Column({ length: 1024, nullable: true })
    description: string;
    
    @Column({ length: 512, nullable: true })
    website: string;
    
    @Column({ length: 64, nullable: true })
    phone: string;
    
    @Column({ length: 64, nullable: true })
    gender: string;


    @OneToMany(()=> recentSearchEntity, (r)=>r.user,{
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    recentSearch : recentSearchEntity[]

}