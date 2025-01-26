import { Module } from '@nestjs/common';
import { TokenRedefinitionService } from './token-redefinition.service';
import { TokenRedefinitionController } from './token-redefinition.controller';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: process.env.MAIL_TRANSPORT,
        defaults: {
          from: '"Meu Projeto" <ppedoros@gmail.com>',
        },
        template: {
          dir: __dirname + '/../../../src/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [TokenRedefinitionService, PrismaService],
  controllers: [TokenRedefinitionController]

})
export class TokenRedefinitionModule {}
