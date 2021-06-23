import { Controller, Get, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserInfoEntity } from './dto/user-info.entiey';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/info')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserInfoEntity })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  info() {
    return this.userService.info();
  }
}
