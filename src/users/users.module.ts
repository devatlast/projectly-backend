import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import {  Project, ProjectSchema } from '../projects/project.schema';
import {  Task, TaskSchema } from '../tasks/task.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
      {name: Task.name, schema: TaskSchema},
      {name: Project.name, schema: ProjectSchema}
    ]),
    EmailModule,
  ],
  controllers: [UsersController],
  exports: [UsersService],
  providers: [UsersService]
})
export class UsersModule {}
