import { Body, Inject, Controller, Get, Post,UseGuards, Req, Param, Delete, Patch } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

interface AuthenticatedRequest extends Request{
    user: {
        userId: string,
        email: string,
        role: string,
    };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService, 
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}


    @Post()
    async createProject(
        @Req() request: AuthenticatedRequest,
        @Body() body: { name: string, description: string},
    ){
        const user = request.user as { userId: string; email: string; role: string;};
        const project = await this.projectsService.createProject(
            body.name,
            body.description,
            request.user.userId
        );
        await this.cacheManager.del(`projects:user:${user.userId}`);
        return project;
    }


    @Get()
    async getProjects( @Req() request: AuthenticatedRequest){
        const user = request.user as { userId: string; email: string; role: string;};

        const isAdmin = request.user.role === 'admin';

        const cacheKey = isAdmin? 'projects: admin': `projects:user:${user.userId}`;
        const cachedProjects = await this.cacheManager.get(cacheKey);

        if(cachedProjects){
            return{
                source: 'redis',
                projects: cachedProjects,
            };
        }

        const projects = await this.projectsService.findAll(
            user.userId,
            isAdmin
        );

        await this.cacheManager.set(cacheKey, projects, 60000);
        return {
            source: 'mongodb',
            projects,
        };
    }


    @Get(':id')
    async getProject(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ) {
        const user = request.user as { userId: string; email: string; role: string;};
        const isAdmin = request.user.role === 'admin';
        return this.projectsService.findById(id, user.userId, isAdmin, );
    }


    @Patch(':id')
    async updateProject(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
        @Body() body: { name?: string, description?: string, status?: string},
    ){
        const user = request.user as { userId: string; email: string; role: string;};
        const isAdmin = request.user.role === 'admin';
        
        const project = await this.projectsService.updateProject(
            id,
            user.userId,
            body,
            isAdmin
        );
        await this.cacheManager.del(`projects:user:${user.userId}`,);
        return project;
    }


    @Delete(':id')
    async deleteProject(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ) {
        const user = request.user as { userId: string; email: string; role: string;};

        const isAdmin = request.user.role === 'admin';

        const result = await this.projectsService.deleteProject(
            id, user.userId, isAdmin
        );
        await this.cacheManager.del(`projects:user:${user.userId}`,);
        return result;
    }
}
