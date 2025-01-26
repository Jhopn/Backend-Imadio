import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './database/prisma/prisma.service';
import { HistoryConversionModule } from './modules/history-conversion/history-conversion.module';
import { TokenRedefinitionModule } from './modules/token-redefinition/token-redefinition.module';

@Module({
  imports: [UserModule, HistoryConversionModule, TokenRedefinitionModule],
  providers: [PrismaService],
})

export class AppModule {}
