import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchemaDefinition>;

@Schema({ timestamps: true, collection: 'users' })
export class UserSchemaDefinition {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['admin', 'client'], required: true })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaDefinition);

UserSchema.index({ email: 1 });
UserSchema.index({ name: 1 });
UserSchema.index({ role: 1 });