/**
 * 角色类型
 * - root 超级管理员
 * - admin 管理员
 * - user 用户
 */
export type Role = 'root' | 'admin' | 'user';

export interface User {
  /** 唯一标识 */
  id: string;
  /** 用户名 */
  username: string;
  /** 头像 */
  avatar: string;
  /** 角色 */
  roles: Role[];
}
