import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsOptional } from 'class-validator';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({ unique: true })
    @IsNotEmpty()
    username: string;

    @Column({ unique: true })
    @IsNotEmpty()
    email: string;

    @Column()
    @IsNotEmpty()
    password: string;

    @Column({ default: false })
    isAdmin: boolean;

    @Column()
    @IsNotEmpty()
    createdById: string;

    @Column({ default: '' })
    @IsOptional()
    UpdatedById: string;

    @Column({ default: '' })
    @IsOptional()
    pfxFilepath: string;

    @Column({ default: '' })
    @IsOptional()
    pfxFileName: string;

    @Column({ default: '' })
    @IsOptional()
    pfxUpdatedBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}