import { Body, Controller, Get, Req, Patch, Delete, UseGuards, NotFoundException, BadRequestException, Param, Query } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateMeDto } from '../auth/dto/updateme.dto'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() request: Request) {
        const user = request.user as {
            userId: string;
            email: string;
            role: string;
        }
        return this.usersService.findById(user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async updateMe(
        @Req() request: Request,
        @Body() body: UpdateMeDto,
    ) {
        const user = request.user as {
            userId: string;
            email: string;
            role: string;
        };
        return this.usersService.updateMe(user.userId, body);
    }

     @Get('verify-email-change')
       async verifyEmailChange(@Query('token') token: string){
        return this.usersService.confirmEmailChange(token);
       }


    @UseGuards(JwtAuthGuard)
    @Delete('me')
    async deleteMe(@Req() request: Request){
        const user = request.user as {
            userId: string;
            email: string;
            role: string;
        };
        await this.usersService.deleteMe(user.userId);
        return {
            message: 'Account deleted successfully',
        };
    }


    @UseGuards(JwtAuthGuard, AdminGuard)
    @Delete(':id')
    async deleteUser(@Param('id') id: string){
        const user = await this.usersService.deleteUser(id);

        if(!user){
            throw new NotFoundException('User not found')
        }
         return {
        message: 'User deleted successfully',
    };
    }


    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get()
    async getAllUsers(){
        return this.usersService.findAll();
    }


    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch(':id/role')
    async updateRole(
        @Param('id') id: string,
        @Body() body: { role: 'user' | 'admin' },
    ) {
        if (body.role !== 'user' && body.role !== 'admin'){
            throw new BadRequestException( 'Role must be user or admin');
        }
        const user = await this.usersService.updateRole( id, body.role,);

        if(!user){
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
