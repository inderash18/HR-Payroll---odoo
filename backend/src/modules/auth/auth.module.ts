import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DevFixedAuthService } from './dev-fixed-auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DevFixedAuthService],
  exports: [AuthService, DevFixedAuthService],
})
export class AuthModule {}
