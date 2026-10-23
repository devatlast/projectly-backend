import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './task.schema';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ProjectsModule } from '../projects/projects.module';
import { PassportModule } from '@nestjs/passport'

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: Task.name,
            schema: TaskSchema
        },
    ]),
    PassportModule.register({
        defaultStrategy: 'jwt'
    }),
    ProjectsModule,
    ],
    providers: [TasksService],
    controllers: [TasksController],
})
export class TasksModule {}
