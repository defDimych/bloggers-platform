import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AccountData, AccountDataSchema } from './account-data.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirmation.schema';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './password-recovery.schema';
import { CreateUserDomainDto } from './dto/CreateUserDomainDto';
import { HydratedDocument, Model } from 'mongoose';
import { add } from 'date-fns';

@Schema()
export class User {
  @Prop({ type: AccountDataSchema, required: true })
  accountData: AccountData;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, required: true })
  passwordRecovery: PasswordRecovery;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.accountData = {
      login: dto.login,
      email: dto.email,
      passwordHash: dto.passwordHash,
      createdAt: new Date(),
      deletedAt: null,
    };

    user.emailConfirmation = {
      confirmationCode: crypto.randomUUID(),
      expirationDate: new Date(),
      isConfirmed: false,
    };

    user.passwordRecovery = {
      recoveryCode: crypto.randomUUID(),
      expirationDate: new Date(),
    };

    return user as UserDocument;
  }

  confirmEmail() {
    this.emailConfirmation.isConfirmed = true;
  }

  makeDeleted() {
    if (this.accountData.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.accountData.deletedAt = new Date();
  }

  setConfirmationCode(confirmCode: string) {
    this.emailConfirmation.confirmationCode = confirmCode;
    this.emailConfirmation.expirationDate = add(new Date(), {
      minutes: 5,
    });
  }

  setConfirmationCodeForPasswordRecovery(confirmCode: string) {
    this.passwordRecovery.recoveryCode = confirmCode;
    this.passwordRecovery.expirationDate = add(new Date(), {
      minutes: 5,
    });
  }

  setNewPassword(passwordHash: string) {
    this.accountData.passwordHash = passwordHash;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
