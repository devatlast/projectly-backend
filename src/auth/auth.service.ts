import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser =
      await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.usersService.createUser({
      name,
      email: normalizedEmail,
      passwordHash,
    });
    const verificationToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.usersService.saveEmailVerificationToken(
      user._id.toString(),
      tokenHash,
      expiresAt,
    );
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );
    } catch {
      await this.usersService.deleteMe(user._id.toString());
      throw new InternalServerErrorException(
        'Unable to send the verification email. Please try again later.',
      );
    }
    return {
      message:
        'Registration successful. Check your email for a verification link.',
      email: user.email,
    };
  }

  async verifyEmail(token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Verification token is required');
    }
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');
    const user =
      await this.usersService.findByEmailVerificationToken(tokenHash);
    if (!user) {
      throw new BadRequestException(
        'Verification link is invalid or has expired',
      );
    }
    await this.usersService.verifyEmail(user._id.toString());
    return {
      message: 'Email verified successfully. You can now log in.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(
      email.trim().toLowerCase(),
    );
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}