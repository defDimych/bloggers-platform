import { BaseCommonEntity } from './base-common.entity';
import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class NumericBaseEntity extends BaseCommonEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
