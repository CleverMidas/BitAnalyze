import { Injectable } from '@nestjs/common';
import { queryClient } from '@bitanalyze/db/client';

@Injectable()
export class AppService {
  async getHealth() {
    const [row] = await queryClient<{ now: string }[]>`select now()::text as now`;

    return {
      ok: true,
      service: 'api',
      database: 'connected',
      databaseTime: row?.now ?? null,
      timestamp: new Date().toISOString(),
    };
  }
}
