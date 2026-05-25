import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';

@Module({
  controllers: [AppController, ExplorerController],
  providers: [AppService, ExplorerService],
})
export class AppModule {}
