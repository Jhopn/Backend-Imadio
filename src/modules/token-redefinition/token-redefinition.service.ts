import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { NewPassword, PasswordRedefinition, TokenConfirmed } from './dto/token.dto';
import { randomInt } from 'crypto';
import * as bcript from 'bcryptjs';

@Injectable()
export class TokenRedefinitionService {
    constructor(private readonly prismaService: PrismaService, private readonly mailerService: MailerService) { }

    async createToken(body: PasswordRedefinition) {
        const userCheck = await this.prismaService.user.findUnique({
            where: {
                email: body.email
            }
        });

        if (!userCheck)
            throw new HttpException(`Usuário inexistente!`, HttpStatus.NOT_FOUND);

        const randomToken = String(randomInt(1000, 9999));

        this.mailerService.sendMail({
            to: userCheck.email,
            from: process.env.EMAIL,
            subject: 'Recuperação de Senha',
            template: 'recovery',
            context: {
                username: userCheck.name,
                code: randomToken,
            },
        });
        try {
            const passwordRedefinition = await this.prismaService.tokenRedefinition.create({
                data:{
                    token: randomToken,
                    expirationAt: new Date(Date.now() + 20 * 60 * 1000),
                    userId: userCheck.id,
                }
            });

            if(!passwordRedefinition)
                throw new HttpException(`Erro ao criar token de recuperação de usuário!`, HttpStatus.EXPECTATION_FAILED);

            return {
                message: 'Token de redefinição enviado com sucesso! O tempo de expiração dele é de 20 minutos!',
                passwordRedefinition
            }
        
        }
        catch(error){
            return {
                message: 'Ocorreu algum erro e o token não foi enviado!',
                error,
            }
         };
    }

    async confirmToken(body: TokenConfirmed){
        const userCheck = await this.prismaService.user.findUnique({
            where:{
                id: body.userId,
            }
        });

        if(!userCheck)
            throw new HttpException(`Usuário inexistente!`, HttpStatus.NOT_FOUND);

        const tokenRedefinition = await this.prismaService.tokenRedefinition.findUnique({
            where: {
                id: body.tokenId,
                used: false,
            },
            select:{
                id: true,
                token: true,
                used: true,
                expirationAt: true
            }
        });
        
        if(!tokenRedefinition)
            throw new HttpException(`Token inexistente!`, HttpStatus.NOT_FOUND);

        if (tokenRedefinition.expirationAt.getTime() < new Date().getTime()) {
            throw new HttpException(`O token está expirado!`, HttpStatus.NOT_FOUND);
        }

        if (tokenRedefinition.used) 
            throw new HttpException(`O token já foi utilizado!`, HttpStatus.BAD_REQUEST);
        

        if(tokenRedefinition.token !== body.token){
            throw new HttpException(
                `O token enviado não corresponde ao enviado ao email! Tente novamente com outro token de redefinição.`,
                HttpStatus.UNAUTHORIZED
            );
        }
        
        const tokenConfirmed = await this.prismaService.tokenRedefinition.update({
            where:{
                id: tokenRedefinition.id,
            },
            data:{
                used: true
            }
        });

        return {
            message: 'O token foi enviado corretamente, agora digite sua nova senha!',
            tokenConfirmed
        }
        
    }

    async updatePassword(body: NewPassword){
        const userCheck = await this.prismaService.user.findUnique({
            where:{
                id: body.userId,
            }
        });

        if(!userCheck)
            throw new HttpException(`Usuário inexistente!`, HttpStatus.NOT_FOUND);

        const tokenCheck = await this.prismaService.tokenRedefinition.findUnique({
            where:{
                id: body.tokenId,
                userId: body.userId,
            }
        });

        if (tokenCheck.expirationAt.getTime() < new Date().getTime()) {
            throw new HttpException(`O token está expirado!`, HttpStatus.NOT_FOUND);
        }

        if(!tokenCheck)
            throw new HttpException(`Token inexistente ou o Token não está associado ao usuário especificado!`, HttpStatus.NOT_FOUND)

        if(tokenCheck.used !== true)
            throw new HttpException(`Token inválido!`,HttpStatus.UNAUTHORIZED)

        const ramdomSalt = randomInt(10, 16);
        const hashPassword = await bcript.hash(body.password, ramdomSalt)

        const userUpdate = await this.prismaService.user.update({
            where:{
                id: body.userId,
            },
            data:{
                password: hashPassword
            }
        });

        if(!userUpdate)
            throw new HttpException(`O usuário não pode ser atualizado!`, HttpStatus.EXPECTATION_FAILED)

        return{
            message: 'Senha atualizada com sucesso!'
        }

    }

    async findAllTokens(userId: string){
        const userCheck = await this.prismaService.user.findUnique({
            where:{
                id: userId,
            }
        });

        if(!userCheck)
            throw new HttpException(`Usuário inexistente!`, HttpStatus.NOT_FOUND);

        const tokens = await this.prismaService.tokenRedefinition.findMany({
            where:{
                id: userId
            }
        });

        if(!tokens)
            throw new HttpException(`Não foi possivel encontrar os tokens desse usuário!`, HttpStatus.EXPECTATION_FAILED)

        return{
            tokens,
        }

    }
    
}
