import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

@Schema({ _id: false, timestamps: true })
export class AccountData {
  @Prop({ type: String, required: true, ...loginConstraints, unique: true })
  login: string;

  @Prop({ type: String, required: true, ...emailConstraints, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  createdAt: Date;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
