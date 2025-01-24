import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { userCreateDto } from './dto/user.create.dto';
import { userUpdateDto } from './dto/user.update.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post()
    create(@Body() body: userCreateDto ){
        return this.userService.createUser(body)
    }

    @Get()
    findAll(){
        return this.userService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.userService.findOne(id)
    }

    @Patch()
    update(@Param('id') id: string, @Body() body: userUpdateDto){
        return this.userService.update(id, body)
    }

    @Delete()
    delete(@Param() id: string){
        return this.userService.delete(id)
    }
}
