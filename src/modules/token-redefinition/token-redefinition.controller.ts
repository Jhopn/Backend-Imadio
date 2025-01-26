import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TokenRedefinitionService } from './token-redefinition.service';
import { NewPassword, PasswordRedefinition, TokenConfirmed } from './dto/token.dto';

@Controller('token-redefinition')
export class TokenRedefinitionController {
    constructor(private readonly tokenRedefinitionService: TokenRedefinitionService){}

    @Post()
    create(@Body() body: PasswordRedefinition){
        return this.tokenRedefinitionService.createToken(body)
    }

    @Get(':userId')
    findAllTokens(@Param('userId') userId: string){
        return this.tokenRedefinitionService.findAllTokens(userId)
    }

    @Post('confirmed')
    confirmToken(@Body() body: TokenConfirmed){
        return this.tokenRedefinitionService.confirmToken(body)
    }

    @Post('new-credentials')
    updatePassword(@Body() body: NewPassword){
        return this.tokenRedefinitionService.updatePassword(body)
    }

}
