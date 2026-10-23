import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true})
export class Task {

    
    @Prop({required: true})
    title: string;


    @Prop()
    description: string;

    
    @Prop({ default: 'pending',
        enum: [ 'pending', 'in-progress', 'completed']
     })
    status: string;


    @Prop({ default: 'medium',
        enum: ['low', 'medium', 'high']
     })
    priority: string;

   @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
   projectId: Types.ObjectId;
}
export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ projectId: 1 });