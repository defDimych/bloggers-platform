import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: true })
export class AccountData {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  createdAt: Date;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
