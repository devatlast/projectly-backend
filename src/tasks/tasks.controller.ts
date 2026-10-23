import { Body, Controller, Get, Param, Patch,Req, UseGuards, Post, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type  { Request } from 'express';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}


    @Post()
    createTask(
        @Param('projectId') projectId: string,
        @Req() request: Request,
        @Body() body: { title: string, description?: string, status?: string, priority?: string},
    ) {
       const user = request.user as { userId: string; email: string; role: string;};
       const isAdmin = user.role === 'admin';

       return this.tasksService.createTask(
        projectId,
        user.userId,
        body.title,
        body.description ?? '',
        body.status ?? 'pending',
        body.priority ?? 'medium',
        isAdmin,
       );
    }

    
    @Get()
    getAllTasks(
        @Param('projectId') projectId: string,
        @Req() request: Request,
    ) {
        const user = request.user as { userId: string, email: string, role: string};
        const isAdmin = user.role === 'admin';

        return this.tasksService.getAllTasks( projectId,
            user.userId,
            isAdmin,);
    }


    @Get(':taskId')
    getTaskById(
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Req() request: Request,
    ){
        const user = request.user as { userId: string, email: string, role: string};
        const isAdmin = user.role === 'admin';

        return this.tasksService.getTaskById( projectId, taskId, user.userId, isAdmin);
    }


    @Patch(':taskId')
    updateTask(
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Req() request: Request,
        @Body() body: { title?: string; description?: string; status?: string; priority: string;}
    ) {
        const user = request.user as { userId: string, email: string, role: string};
        const isAdmin = user.role === 'admin';
        return this.tasksService.updateTask(projectId, user.userId, taskId, body, isAdmin);
    }


    @Delete(':taskId')
    deleteTask(
        @Param('projectId') projectId: string,
        @Param('taskId') taskId: string,
        @Req() request: Request,
    ) {
        const user = request.user as { userId: string, email: string, role: string};
        const isAdmin = user.role === 'admin';

        return this.tasksService.deleteTask(projectId, user.userId, taskId, isAdmin)
    }

}
