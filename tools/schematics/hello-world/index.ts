import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export interface SchemaOptions {
  name: string;
  content: string;
}

// tslint:disable-next-line: no-default-export
export default function(schema: SchemaOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // 拼接路径
    const path = `${schema.name}.md`;
    // 检查文件是否存在
    if (tree.exists(path)) {
      // 如果没有输入内容就删除文件
      if (!schema.content.trim()) {
        tree.delete(path);
        return tree;
      }
      // 读取文件
      const file = tree.read(path);
      // 可能是 null
      if (file) {
        // 解析文件
        let content = file.toString('utf-8');
        // 拼接字符串
        content += '\n' + schema.content;
        // 写入文件
        tree.overwrite(path, content);
        return tree;
      }
    } else {
      // 创建文件
      tree.create(path, schema.content);
      return tree;
    }
  };
}
