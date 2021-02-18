import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty({
    description: '昵称',
  })
  nickname: string;

  @ApiProperty({
    description: '邮箱',
  })
  @IsEmail({}, { message: '邮箱是无效的' })
  email: string;
}
