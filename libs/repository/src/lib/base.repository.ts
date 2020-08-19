import { InternalServerErrorException } from '@nestjs/common';
import { DocumentType, isDocument, ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { MongoError } from 'mongodb';
import {
  CreateQuery,
  DocumentQuery,
  FilterQuery,
  ModelOptions,
  ModelPopulateOptions,
  ModelUpdateOptions,
  QueryFindOptions,
  Types,
  UpdateQuery
} from 'mongoose';
import { Projection, Repository } from './repository';

export abstract class BaseRepository<T> implements Repository<T> {
  /**
   * 返回由该存储库管理的对象。
   */
  get target() {
    return this._model;
  }

  /**
   * 抛出mongodb异常
   * @param err MongoError
   */
  protected static throwMongoError(err: MongoError): void {
    throw new InternalServerErrorException(err, err.errmsg);
  }

  /**
   * @description 将字符串转换成ObjectId
   * @param id ObjectId字符串
   */
  protected static toObjectId(id: string): Types.ObjectId {
    try {
      return Types.ObjectId(id);
    } catch (e) {
      this.throwMongoError(e);
    }
  }

  constructor(protected _model: ReturnModelType<AnyParamConstructor<T>>) {}

  /**
   * 创建一个新的模型实例。
   */
  create(): DocumentType<T> {
    return new this._model();
  }

  /**
   * 保存给定的实体或实体数组。
   * 1. 如果该实体已经存在于数据库中，则会对其进行更新。
   * 2. 如果该实体在数据库中不存在，则将其插入。
   * @param entity 实体
   */
  async save(entity: DocumentType<T> | CreateQuery<T>): Promise<DocumentType<T>> {
    if (isDocument(entity)) {
      return (await entity.save()) as DocumentType<T>;
    }
    return await this._model.create(entity as CreateQuery<T>);
  }

  /**
   * 查找与给定选项匹配的实体
   * @param conditions 给定条件
   * @param projection 查询“投影” 参考 `Query.prototype.select()`。
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  async find(conditions: FilterQuery<T>, projection?: Projection<T>, options?: QueryFindOptions): Promise<DocumentType<T>[]> {
    try {
      const docsQuery = this._model.find(conditions as any, projection, options);
      return await this.populates<Array<DocumentType<T>>>(docsQuery, options?.populate).exec();
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 查找与某些ID或查找选项匹配的第一个实体
   * @param conditions 给定条件 可以是字符串id 也可以是ObjectId 也可以是匹配选项
   * @param projection 查询“投影”，参考 `Query.prototype.select()`。
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  async findOne(conditions: FilterQuery<T>, projection?: Projection<T>, options?: QueryFindOptions): Promise<DocumentType<T>> {
    try {
      const docsQuery = this._model.findOne(conditions as any, projection, options);
      return await this.populates<DocumentType<T>>(docsQuery, options?.populate).exec();
    } catch (e) {
      console.log(e);
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 查找与给定查找选项匹配的实体。
   * 还计算符合给定条件但忽略分页设置（`skip` 和 `take`选项）的所有实体。
   * @param conditions
   * @param projection
   * @param options
   */
  async findAndCount(
    conditions: FilterQuery<T>,
    projection?: Projection<T>,
    options?: QueryFindOptions,
  ): Promise<[DocumentType<T>[], number]> {
    try {
      // 返回分页结果
      return Promise.all([await this.find(conditions, projection, options), await this.count(conditions)]);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 计算与给定选项匹配的实体数量。对分页有用。
   * @param conditions 给定条件
   */
  async count(conditions: FilterQuery<T>): Promise<number> {
    try {
      return this._model.countDocuments(conditions as any).exec();
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 按实体id或给定条件删除实体(通常说的软删除)
   * 逻辑删除 标记deleted字段
   * `Remove`则表示删除并留出(但保持存在)
   * @param conditions 给定条件
   * @param deletedPath deleted字段映射
   */
  async remove(conditions: FilterQuery<T>, deletedPath = 'deleted'): Promise<DocumentType<T>> {
    try {
      return await this.update(conditions, {
        $set: {
          [deletedPath]: true,
        },
      } as any);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 按实体id或给定条件恢复软删除的实体
   * @param conditions 给定条件
   * @param deletedPath deleted字段映射
   */
  async recover(conditions: FilterQuery<T>, deletedPath = 'deleted'): Promise<DocumentType<T>> {
    try {
      return await this.update(conditions, {
        $set: {
          [deletedPath]: false,
        },
      } as any);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 按实体id或给定条件删除实体
   * 物理删除
   * `Delete`意味着擦除(即呈现为不存在或不可恢复)
   * @param conditions
   * @param options
   */
  async delete(
    conditions: FilterQuery<T>,
    options?: ModelOptions & { single?: boolean },
  ): Promise<
    {
      ok?: number;
      n?: number;
    } & {
      deletedCount?: number;
    }
  > {
    try {
      const { single, ...option } = options;
      const deleteMethod = single ? 'deleteOne' : 'deleteMany';
      return await this._model[deleteMethod](conditions as any, options).exec();
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 通过给定的更新选项或实体ID部分更新实体。
   * @param conditions 给定条件
   * @param partialEntity 更新实体内容
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  async update(conditions: FilterQuery<T>, partialEntity: UpdateQuery<T>, options?: ModelUpdateOptions) {
    try {
      return await this._model.update(conditions as any, partialEntity, options).exec();
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 删除所有匹配条件的文档集合
   */
  clear(): Promise<number> {
    try {
      return Promise.resolve(0);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 根据提供的与给定选项匹配的实体的值来递增某个字段
   * @param conditions 给定条件
   * @param propertyPath 要递增字段
   * @param value 递增值 默认`1` 递减值 默认`-1`
   */
  async increment(conditions: FilterQuery<T>, propertyPath: Projection<T>, value = 1) {
    let property: { [key: string]: number } = {};
    if (typeof propertyPath === 'string') {
      property = {
        [propertyPath]: value,
      };
    } else if (typeof propertyPath === 'object' && propertyPath != null) {
      property = propertyPath;
    }

    try {
      return await this.update(conditions, { $inc: property } as any);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 根据提供的与给定选项匹配的值递减某个字段
   * @param conditions 给定条件
   * @param propertyPath 要递减字段
   * @param value 递减值 默认`-1`
   */
  async decrement(conditions: FilterQuery<T>, propertyPath: Projection<T>, value = -1) {
    try {
      return await this.increment(conditions, propertyPath, value);
    } catch (e) {
      BaseRepository.throwMongoError(e);
    }
  }

  /**
   * 填充其他模型
   * @param docsQuery
   * @param populates
   */
  private populates<D>(
    docsQuery: DocumentQuery<D, DocumentType<T>, {}>,
    populates: string | ModelPopulateOptions,
  ): DocumentQuery<D, DocumentType<T>, {}> {
    if (populates) {
      [].concat(populates).forEach((item: ModelPopulateOptions) => {
        docsQuery.populate(item);
      });
    }
    return docsQuery;
  }
}
