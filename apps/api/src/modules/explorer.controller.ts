import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExplorerService } from './explorer.service';

@Controller()
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}

  @Get('blocks')
  async listBlocks(@Query('limit') limit?: string) {
    return this.explorerService.listBlocks(limit ? Number(limit) : undefined);
  }

  @Get('blocks/:heightOrHash')
  async getBlock(@Param('heightOrHash') heightOrHash: string) {
    return this.explorerService.getBlock(heightOrHash);
  }

  @Get('extrinsics')
  async listExtrinsics(@Query('limit') limit?: string) {
    return this.explorerService.listExtrinsics(limit ? Number(limit) : undefined);
  }

  @Get('events')
  async listEvents(@Query('limit') limit?: string) {
    return this.explorerService.listEvents(limit ? Number(limit) : undefined);
  }
}
