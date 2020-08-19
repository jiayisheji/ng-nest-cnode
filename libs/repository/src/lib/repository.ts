import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
import { CreateQuery, FilterQuery, ModelOptions, ModelPopulateOptions, ModelUpdateOptions, QueryFindOptions, Types, UpdateQuery } from 'mongoose';

/**
 * 将T中的所有属性设为可选
 */
export type ModelPartial<T> = {
  [P in keyof T]?: T[P] extends Types.ObjectId ? string : T[P];
};

/**
 * 用于查找操作
 */
export type FindConditions<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<FindConditions<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<FindConditions<U>>
    : T[P] extends Types.ObjectId
    ? string | Types.ObjectId
    : FindConditions<T[P]>;
};

/**
 * 指定要包含或排除哪些 document字段(也称为查询“投影”)。
 * 在 mongoose 中有两种指定方式，字符串指定和对象形式指定。
 * 1. 字符串指定时在排除的字段前加 `-` 号，只写字段名的是包含。
 * 2. 对象形式指定时，`1` 是包含，`0` 是排除。
 */
export type Projection<T> =
  | {
      [P in keyof T]?: number;
    }
  | string;

/**
 * 排序
 * 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1
 */
export type OrderByCondition<T> =
  | {
      [P in keyof T]?: 'asc' | 'desc' | 'ascending' | 'descending' | number;
    }
  | string;

export interface FindOneOptions<T> {
    lean?: boolean;
    populate?: ModelPopulateOptions | ModelPopulateOptions[];
    projection?: Projection<T>;
  }

export interface FindManyOptions<T> extends FindOneOptions<T> {
  sort?: OrderByCondition<T>;
  limit?: number;
  skip?: number;
  batchSize?: number;
  tailable?: {
    bool?: boolean;
    opts?: {
      numberOfRetries?: number;
      tailableRetryInterval?: number;
    };
  };
  maxscan?: number;
  comment?: string;
  snapshot?: boolean;
  readPreference?: {
    pref: string;
    tags?: T[];
  };
  hint?: T;
}

/**
 * 让T中的所有属性都是可选的。深的版本。
 */
export type QueryDeepPartialEntity<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<QueryDeepPartialEntity<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<QueryDeepPartialEntity<U>>
    : T[P] extends Types.ObjectId
    ? string
    : QueryDeepPartialEntity<T[P]>;
};

export type DocumentPartial<T> = DocumentType<T> | CreateQuery<T>;

export interface Repository<Entity> {
  /**
   * 返回由该存储库管理的对象。
   */
  target: ReturnModelType<AnyParamConstructor<Entity>>;

  /**
   * 创建一个新的模型实例。
   */
  create(): Entity;

  /**
   * 保存给定的实体
   * 1. 如果该实体已经存在于数据库中，则会对其进行更新。
   * 2. 如果该实体在数据库中不存在，则将其插入。
   * @param entity
   */
  save(entity: DocumentType<Entity> | CreateQuery<Entity>): Promise<DocumentType<Entity>>;

  /**
   * 查找与给定选项匹配的实体
   * @param conditions 给定条件
   * @param projection 查询“投影” 参考 `Query.prototype.select()`。
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  find(conditions: FilterQuery<Entity>, projection?: Projection<Entity>, options?: QueryFindOptions): Promise<DocumentType<Entity>[]>;

  /**
   * 查找与某些ID或查找选项匹配的第一个实体
   * @param conditions 给定条件 可以是字符串id 也可以是ObjectId 也可以是匹配选项
   * @param projection 查询“投影”，参考 `Query.prototype.select()`。
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  findOne(
    conditions: FilterQuery<Entity>,
    projection: Projection<Entity>,
    options?: QueryFindOptions,
  ): Promise<DocumentType<Entity> | null>;

  /**
   * 查找与给定查找选项匹配的实体。
   * 还计算符合给定条件但忽略分页设置（`skip`和 `limit`选项）的所有实体。
   * @param conditions
   * @param projection
   * @param options
   */
  findAndCount(
    conditions: FilterQuery<Entity>,
    projection: Projection<Entity>,
    options?: QueryFindOptions,
  ): Promise<[DocumentType<Entity>[], number]>;

  /**
   * 计算与给定选项匹配的实体数量。对分页有用。
   * @param conditions 给定条件
   */
  count(conditions: FilterQuery<Entity>): Promise<number>;

  /**
   * 通过给定的更新选项或实体ID部分更新实体。
   * @param conditions 给定条件
   * @param partialEntity 更新实体内容
   * @param options 配置 参考 `Query.prototype.setOptions()`
   */
  update(conditions: FilterQuery<Entity>, partialEntity: UpdateQuery<Entity>, options?: ModelUpdateOptions): Promise<DocumentType<Entity>>;

  /**
   * 删除一个或多个给定的实体
   * 物理删除
   * `Delete`意味着擦除(即呈现为不存在或不可恢复)
   */
  delete(
    conditions: FilterQuery<Entity>,
    options?: ModelOptions & { single?: boolean },
  ): Promise<
    {
      ok?: number;
      n?: number;
    } & {
      deletedCount?: number;
    }
  >;

  /**
   * 按实体id或给定条件删除实体(通常说的软删除)
   * 逻辑删除 标记deleted字段
   * `Remove`则表示删除并留出(但保持存在)
   * @param conditions 给定条件
   * @param deletedPath deleted字段映射
   */
  remove(conditions: FilterQuery<Entity>, deletedPath?: string): Promise<DocumentType<Entity>>;

  /**
   * 按实体id或给定条件恢复软删除的实体
   * @param conditions 给定条件
   * @param deletedPath deleted字段映射
   */
  recover(conditions: FilterQuery<Entity>, deletedPath?: string): Promise<DocumentType<Entity>>;

  /**
   * 清除给定表中的所有数据（将其截断/删除）
   */
  clear(): Promise<number>;

  /**
   * 根据提供的与给定选项匹配的实体的值来递增某个字段
   * @param conditions 给定条件
   * @param propertyPath 要递增字段
   * @param value 递增值 默认`1`
   */
  increment(conditions: FilterQuery<Entity>, propertyPath: string, value?: number): Promise<DocumentType<Entity>>;

  /**
   * 根据提供的与给定选项匹配的值递减某个字段
   * @param conditions 给定条件
   * @param propertyPath 要递减字段
   * @param value 递减值 默认`1`
   */
  decrement(conditions: FilterQuery<Entity>, propertyPath: string, value?: number): Promise<DocumentType<Entity>>;
}
