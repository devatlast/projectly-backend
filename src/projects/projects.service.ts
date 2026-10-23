import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, model, Types } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name)
        private projectModel: Model<ProjectDocument>,
    ) {}

    async createProject( name: string, description: string, ownerId: string){
        const project = await this.projectModel.create({
            name,
            description, 
            ownerId: new Types.ObjectId(ownerId),
        });
        return project;
    }


    async findAll(ownerId?: string, isAdmin: boolean  = false){
        if(isAdmin) {
            return this.projectModel.find().exec();
        }
        return this.projectModel.find({
            ownerId: new Types.ObjectId(ownerId),
        }).exec();
    }


    async findById(projectId: string, ownerId: string, isAdmin:boolean = false){
        const query: any = {
            _id:  new Types.ObjectId(projectId),
        };
        if(!isAdmin){
            query.ownerId = new Types.ObjectId(ownerId);
        }

        const project = await this.projectModel.findOne(query).exec();

        if(!project){
            throw new NotFoundException('Project not found');
        }
        return project;
    }


    async updateProject(projectId: string, ownerId: string, data: {name?: string, description?: string, status?: string}, isAdmin: boolean = false){
        const query: any = {
            _id: new Types.ObjectId(projectId),
        };

        if(!isAdmin){
            query.ownerId = new Types.ObjectId(ownerId);
        }

        const project = await this.projectModel.findOneAndUpdate(
            query, 
            { $set: data },
            { new: true, runValidators: true},
        ).exec();

        if(!project){
            throw new NotFoundException('Project not found');
        }
        return project;
    }


    async deleteProject(
        projectId: string, 
        ownerId: string,
        isAdmin: boolean = false
    ){
        const query: any = {_id: new Types.ObjectId(projectId),};

        if(!isAdmin){
            query.ownerId = new Types.ObjectId(ownerId);
        }
        const project = await this.projectModel.findOneAndDelete(query).exec();

        if(!project){
            throw new NotFoundException('Project not found ')
        }
        return {
            message: 'Project deleted successfully',
        };
    }
}
