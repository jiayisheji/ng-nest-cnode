import { buildSchema, prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

/**
 * 基础模型 BaseModel 配置 Schema，生成 Document
 * - Schema: 一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力
 * - Model: 由Schema发布生成的模型，具有抽象属性和数据库操作能力
 * - Document: 由Model创建的实例, 也能操作数据库
 * Schema、Model、Document 的关系请牢记
 * Schema 生成 Model，Model 创造 Document
 * Model 和 Document 都可对数据库操作造成影响
 * 但 Model 比 Document 更具操作性
 */
export abstract class BaseModel {
  @prop()
  created_at?: Date; // 创建时间
  @prop()
  updated_at?: Date; // 更新时间

  id?: string; // 实际上是 model._id getter

  // 如果需要，可以向基本模型添加更多内容。
  static get schema(): Schema {
    // tslint:disable-next-line: no-any
    return buildSchema(this as any, {
      versionKey: false,
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      toJSON: {
        virtuals: true,
        getters: true,
      },
      toObject: {
        virtuals: true,
        getters: true,
      },
    });
  }

  // 获取collection名字
  static get modelName(): string {
    return this.name;
  }
}
