import { Prop } from '@typegoose/typegoose';
import { BaseModel } from '@ng-nest-cnode/repository';
import { ObjectID } from 'mongodb';

export class RefreshToken extends BaseModel {
  /** token值 */
  @Prop({
    required: [true, 'Token value is required'],
    unique: true,
  })
  value: string;

  /** 关联用户id */
  @Prop()
  userId: ObjectID | string;

  /** token过期时间 */
  @Prop({ required: true })
  expiresAt: Date;

  /** 客户端id */
  @Prop()
  clientId: string;

  /** ip地址 */
  @Prop()
  ipAddress: string;
}
