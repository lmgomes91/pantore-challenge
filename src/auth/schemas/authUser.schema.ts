import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthUserDocument = HydratedDocument<AuthUserSchemaDefinition>;

@Schema({ timestamps: true, collection: 'users' })
export class AuthUserSchemaDefinition {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['admin', 'client'], required: true })
  role: string;
}

export const AuthUserSchema = SchemaFactory.createForClass(AuthUserSchemaDefinition);

AuthUserSchema.index({ name: 1 });
AuthUserSchema.index({ role: 1 });