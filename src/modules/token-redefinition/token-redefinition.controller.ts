import { Body, Controller, Post } from '@nestjs/common';
import { TokenRedefinitionService } from './token-redefinition.service';
import { PasswordRedefinition } from './dto/token.dto';

@Controller('token-redefinition')
export class TokenRedefinitionController {
    constructor(private readonly tokenRedefinitionService: TokenRedefinitionService){}

    @Post()
    create(@Body() body: PasswordRedefinition){
        return this.tokenRedefinitionService.createToken(body)
    }
}
