import { BaseCommonEntity } from './base-common.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class UuidBaseEntity extends BaseCommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
