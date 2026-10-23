import { Body, Controller, Post, Inject, Req, Res, HttpException, HttpStatus, HttpCode, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import type { Request, Response } from'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ){}

     @Post('register')
     register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
       }



   @Post('login')
   async login(@Body() loginDto: LoginDto, @Req() request: Request, @Res({passthrough: true}) response: Response) {
   const ip = request.ip;
   const ipKey = `login:ip:${ip}`;
   const accountKey = `login:account:${loginDto.email}`;

   const ipAttempts = await this.cacheManager.get<number>(ipKey);
   const accountAttempts = await this.cacheManager.get<number>(accountKey);

   if( (ipAttempts && ipAttempts >= 5) || ( accountAttempts && accountAttempts >= 5 ) ){
    throw new HttpException(
     'Too many login attempts. Please try again in 60 seconds.', HttpStatus.TOO_MANY_REQUESTS
    );
   }
   const newIpAttempts = (ipAttempts || 0) + 1;
   const newAccountAttempts = (accountAttempts || 0)+ 1;
   
   await this.cacheManager.set(ipKey, newIpAttempts, 60000);
   await this.cacheManager.set(accountKey, newAccountAttempts, 60000);
   
   const result = await this.authService.login(loginDto);
   response.cookie('access_token', result.access_token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
   });
   return {
    message: 'Login successful'
   }
   }
    
   @Get('verify-email')
   async verifyEmail(@Query('token') token: string){
    return this.authService.verifyEmail(token);
   }

   @Post('logout')
   @HttpCode(HttpStatus.OK)
   logout(@Res({passthrough: true})response:Response){
    response.clearCookie('access_token',{
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
    });
    return{
        message: 'Logout successful'
    }
   }


}
