import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop()
    githubId?: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true})
    passwordHash?: string;

    @Prop()
    avatarUrl?: string;
    
    @Prop({ default: 'user', enum: ['user', 'admin'] })
    role: string;

    @Prop({ default: false})
    isEmailVerified: boolean;

    @Prop({ select: false})
    emailVerificationToken?: string;

    @Prop({ select: false })
    emailVerificationExpires?: Date;

    @Prop()
    pendingEmail?: string;

    @Prop({ select: false})
    emailChangeVerificationToken?: string;
    
    @Prop()
    emailChangeverificatonExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);