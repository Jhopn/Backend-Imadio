import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PasswordRedefinition } from './dto/token.dto';
import { randomInt } from 'node:crypto';

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

        })
        .then(async () => { 
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
                status: HttpStatus.NO_CONTENT,
            }
        
        })
        .catch((error) => {
            return {
                message: 'Ocorreu algum erro e o token não foi enviado!',
                error,
            }
         });
    }

    async confirmToken(){
        
    }
    
}
