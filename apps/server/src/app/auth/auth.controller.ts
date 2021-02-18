import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginEntity } from './dto/user.entity';
import { TokenService } from './token.service';
@Controller()
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly tokenService: TokenService) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, type: LoginEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: LoginEntity })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  login(@Body() loginDto: LoginDto, @Ip() ipAddress: string) {
    return this.authService.login(loginDto, ipAddress);
  }

  /** github登录提交 */
  @Get('/github')
  @UseGuards(AuthGuard('github'))
  async github(@Req() req: Request, @Res() res: Response) {
    console.log(req, res);
    return null;
  }

  /** github登录成功回调地址 */
  @Get('/github/callback')
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    console.log(req, res);
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  logout(@Query('refresh_token') token?: string) {
    if (!token) {
      throw new BadRequestException('未提供刷新令牌');
    }
    return this.authService.logout(token);
  }

  @Post('/access-token')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: BadRequestException })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, type: UnauthorizedException })
  @ApiQuery({ name: 'refresh_token', required: true, description: '刷新令牌' })
  @ApiOperation({ description: '获取刷新token' })
  async refreshToken(@Req() req: Request, @Ip() ip: string, @Query('refresh_token') token?: string) {
    if (!token) {
      throw new BadRequestException('未提供刷新令牌');
    }
    try {
      const oldAccessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      const res = await this.tokenService.getAccessTokenFromRefreshToken(token, oldAccessToken, ip);
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  @Post('/activate')
  @ApiOperation({ description: '激活账号' })
  activate() {
    return this.authService.activate();
  }
}
