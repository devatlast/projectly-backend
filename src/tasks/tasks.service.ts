import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name)
        private taskModel: Model<TaskDocument>,
        private projectsService: ProjectsService,
    ) {}


    async createTask(projectId: string, ownerId: string, title: string, description: string, status: string, priority: string, isAdmin: boolean){
        await this.projectsService.findById(
            projectId,
            ownerId,
            isAdmin,
        );
    return this.taskModel.create({
        projectId: new Types.ObjectId(projectId),
        title,
        description,
        status,
        priority,
    });
 }


 async getAllTasks(
    projectId: string,
    ownerId: string,
    isAdmin: boolean,
 ) {
    await this.projectsService.findById(projectId, ownerId, isAdmin);
    return this.taskModel.find({ projectId: new Types.ObjectId(projectId),}).exec();
 }



   async getTaskById(projectId: string, taskId: string, ownerId: string, isAdmin: boolean){
    await this.projectsService.findById(projectId, ownerId, isAdmin);
    const task = await this.taskModel.findOne({
        _id: new Types.ObjectId(taskId),
        projectId: new Types.ObjectId(projectId)
    }).exec();
    if(!task){
        throw new NotFoundException('Task not found')
    }
    return task;
   }


   async updateTask(
    projectId: string,
    ownerId: string,
    taskId: string,
    data: { title?: string, description?: string, status?: string, priority?: string},
    isAdmin: boolean,
   ) {
    await this.projectsService.findById(projectId, ownerId, isAdmin);
    const task = await this.taskModel.findOneAndUpdate(
        { _id: new Types.ObjectId(taskId), projectId: new Types.ObjectId(projectId) },
        { $set: data },
        { new: true, runValidators: true },
    ).exec();
    if(!task) {
        throw new NotFoundException('Task not found')
    }
    return task;
   }


   async deleteTask(
    projectId: string,
    ownerId: string,
    taskId: string,
    isAdmin: boolean,
   ){
    await this.projectsService.findById(projectId, ownerId, isAdmin);

    const task = await this.taskModel.findOneAndDelete({
        _id: new Types.ObjectId(taskId),
        projectId: new Types.ObjectId(projectId),
    }).exec();
    if(!task){
        throw new NotFoundException('Task not found');
    }

    return {
        message: 'task deleted successfully'
    };
   }
}



