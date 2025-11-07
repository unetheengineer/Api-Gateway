import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 * Protects routes by requiring a valid JWT token in Authorization header
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected-route')
 * async protectedRoute(@Req() req: Request) {
 *   const user = req.user; // User data from JWT payload
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // You can add custom logic here before calling the parent
    // For example: check if user is active, check permissions, etc.
    return super.canActivate(context);
  }
}
