import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { userCreateDto } from './dto/user.create.dto';
import { randomInt } from 'crypto';
import * as bcript from 'bcryptjs';
import { userUpdateDto } from './dto/user.update.dto';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) { }

    async createUser(body: userCreateDto) {
        if (body.role && body.role === 'ADMIN') {
            throw new BadRequestException(
                'Não é permitido definir o papel como ADMIN.',
            );
        }
        
        const emailCheck = await this.prismaService.user.findUnique({ where: { email: body.email } })

        if (emailCheck)
            throw new HttpException(`Email já cadastrado!`, HttpStatus.CONFLICT);
        
        const ramdomSalt = randomInt(10, 16);
        const hashPassword = await bcript.hash(body.password, ramdomSalt)
        const user = await this.prismaService.user.create({
            data: {
                ...body,
                password: hashPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });


        if (!user) {
            throw new HttpException(
                `Erro ao criar usuário`,
                HttpStatus.EXPECTATION_FAILED,
            );
        }

        return user;
    }

    async findAll() {
        const users = await this.prismaService.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                TokenRedefinition: true
            }
        });

        if (!users)
            throw new HttpException(`Erro ao encontrar usuários`, HttpStatus.EXPECTATION_FAILED)

        return users;

    }

    async findOne(id: string) {
        const idCheck = await this.prismaService.user.findUnique({
            where:{
                id,
            }
        });

        if(!idCheck)
            throw new HttpException(`Usuário inexistente!`, HttpStatus.NOT_FOUND);

        const user = await this.prismaService.user.findFirst({
            where:{
                id,
            }
        });

        if (!user)
            throw new HttpException(`Erro ao encontrar usuário`, HttpStatus.EXPECTATION_FAILED)
        
        return user;
    }

    async update(id: string, body: userUpdateDto){
        const idCheck = await this.prismaService.user.findUnique({
            where:{
                id,
            }
        });

        if(!idCheck)
            throw new HttpException(`Usuário inexistente!`, HttpStatus.NOT_FOUND);

        const emailCheck = await this.prismaService.user.findUnique({
            where:{
                email: body.email,
            }
        });

        if(emailCheck)
            throw new HttpException(`Email já cadastrado!`, HttpStatus.CONFLICT);

        const user = await this.prismaService.user.update({
            where:{
                id,
            },
            data:{
                ...body
            }
        });

        if(!user)
            throw new HttpException(`Erro ao atualizar usuário`, HttpStatus.EXPECTATION_FAILED);

        return user;
    }

    async delete(id: string){
        const idCheck = await this.prismaService.user.findUnique({
            where:{
                id,
            }
        });

        if(!idCheck)
            throw new HttpException(`Usuário inexistente!`, HttpStatus.NOT_FOUND);

        await this.prismaService.user.delete({
            where:{
                id,
            }
        });

        return {
            message: 'Usuário deletado com sucesso!',
            status: HttpStatus.NO_CONTENT,
        };

    }
}
