import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { UpdateMeDto } from '../auth/dto/updateme.dto'
import * as bcrypt from 'bcrypt';
import {  Project, ProjectDocument } from '../projects/project.schema';
import {  Task, TaskDocument } from '../tasks/task.schema';
import { randomBytes, createHash} from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        private readonly emailService: EmailService,
        @InjectModel(Project.name)
        private readonly projectModel: Model<Project>,
        @InjectModel(Task.name)
        private readonly taskModel: Model<Task>,
    ) {}

    async findByGithubId(githubId: string) {
        return this.userModel.findOne({ githubId }).exec();
    }

    async findByEmail(email: string){
        return this.userModel.findOne({ email }).exec();
    }

     async findById(id: string){
        return this.userModel.findById(id).select('-passwordHash -emailVerificationToken -emailVerificationExpires').exec();
     }

    async createUser({
       name, email, passwordHash
    }: {name: string, email: string, passwordHash: string}){
        return this.userModel.create({
            name,
            email,
            ...(passwordHash ? { passwordHash } : {}),
        })
    }
    
    async saveEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date){
        return this.userModel.findByIdAndUpdate(
            userId,
            {$set: {
                emailVerificationExpires: expiresAt,
                emailVerificationToken: tokenHash
            }},
            { new: true}
        ).exec()
    }

    async findByEmailVerificationToken(tokenHash: string){
        return this.userModel.findOne({
            emailVerificationToken: tokenHash,
            emailVerificationExpires: { $gt: new Date()}
        }).select('+enailVerificationToken +emailVerificationExpires').exec();
    }


    async verifyEmail(userId: string){
        return this.userModel.findByIdAndUpdate(
            userId,
            { $set: {isEmailVerified: true},
            $unset: {
                emailVerificationToken: 1,
                emailVerificationExpires: 1
            }
        }, {new: true}
     ).exec();
    }

    async requestEmailChange(id: string, newEmail: string){
        const normalizedEmail = newEmail.trim().toLowerCase();
        const existingUser = await this.userModel.findOne({ email: normalizedEmail, _id: {$ne: id}}).exec();

        if(existingUser){
            throw new ConflictException('Email is aleady registered');
        }
        const user = await this.userModel.findById(id).exec();
        if(!user){
            throw new NotFoundException('user not found');
        }
        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');

        user.pendingEmail = normalizedEmail;
        user.emailChangeVerificationToken = tokenHash;
        user.emailChangeverificatonExpires = new Date( Date.now() + 15 * 60 * 1000,);

        await user.save();
        try{
            await this.emailService.sendEmailChangeVerification(normalizedEmail, user.name, token);
        } catch(error){
            user.pendingEmail = undefined;
            user.emailChangeVerificationToken = undefined;
            user.emailChangeverificatonExpires = undefined;
            await user.save();
            throw error;
        }
        return{
            message: 'verification email requested'
        };
    }

    async confirmEmailChange(token: string){
        const tokenHash = createHash('sha256').update(token).digest('hex');

        const user = await this.userModel.findOne({
            emailChangeVerificationToken: tokenHash, 
            emailChangeverificatonExpires: { $gt: new Date()},
        }).exec();
        if(!user || !user.pendingEmail){
            throw new BadRequestException('invalid or expired email verification link');
        }

        const existingUser = await this.userModel.findOne({
            email: user.pendingEmail,
            _id: {$ne: user._id},
        }).exec();
        if(existingUser){
            throw new ConflictException('Email is already registered');
        }
        user.email = user.pendingEmail;
        user.isEmailVerified = true;
        user.pendingEmail = undefined;
        user.emailVerificationToken = undefined;
        user.emailChangeverificatonExpires = undefined;
        await user.save();

        return {
            message: 'Email address updated successfully'
        };
    }

    async updateMe(
        id: string,
        data: UpdateMeDto
    ) {
        const { name, email, password  } = data;
        const updates: Record<string, string> = {};

        if(name !== undefined){
            updates.name = name;
        }
        if(email !== undefined){
           await this.requestEmailChange(id, email);
        }

        if(password !== undefined){
            updates.passwordHash = await bcrypt.hash(password, 10);
        }
        return this.userModel.findByIdAndUpdate(
            id, 
            {$set: updates},
            {new: true, runValidators: true},
        ).select('-passwordHash').exec()
    }


    async deleteMe(id: string){
        console.log('deleteMe called with:', id);
        const projects = await this.projectModel.find({ ownerId: id}).select('_id').exec();
        console.log('projects found:', projects.length);
        const projectIds = projects.map((project) => project._id);

        if(projectIds.length > 0 ){
            await this.taskModel.deleteMany({
                projectId: { $in: projectIds },
            }).exec();

            await this.projectModel.deleteMany({
                ownerId: id,
            }).exec();
        }

        return this.userModel.findByIdAndDelete(id).exec();
    }


    async deleteUser(id: string){
        return this.userModel.findByIdAndDelete(id).exec();
    }


    async findAll(){
        return this.userModel.find().select('-passwordHash').exec();
    }


    async updateRole(id: string, role: 'user' | 'admin'){
        return this.userModel.findByIdAndUpdate(
            id, 
            {$set: {role}},
            { new: true, runValidators: true }
        ).select('-passwordHash').exec();
    }
}

