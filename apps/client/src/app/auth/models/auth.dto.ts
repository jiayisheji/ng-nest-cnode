export interface LoginDto {
  password: string;
  username: string;
}

export interface RegisterDto extends LoginDto {}
