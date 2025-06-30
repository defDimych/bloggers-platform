import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';

@Global()
@Module({
  providers: [CoreConfig],
})
export class CoreModule {}
