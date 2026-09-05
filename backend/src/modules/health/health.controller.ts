import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { HealthService } from './health.service';

@ApiTags('Health & Probes')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe to check if API container is running' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  getLiveness() {
    return this.healthService.checkLiveness();
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe to check database and dependencies' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  @ApiResponse({ status: 503, description: 'Service is degraded or dependency down' })
  async getReadiness(@Res() res: FastifyReply) {
    const result = await this.healthService.checkReadiness();
    const status = result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(status).send(result);
  }
}
