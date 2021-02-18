import { ApiProperty } from '@nestjs/swagger';

export class LoginEntity {
  @ApiProperty({
    description: '昵称',
  })
  nickname: string;
}
