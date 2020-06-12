import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { HelloWorldOptions } from './schema';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function helloWorld(_options: HelloWorldOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // 拼接路径
    const path = `${_options.name}.md`;
    // 检查文件是否存在
    if (tree.exists(path)) {
      // 如果没有输入内容就删除文件
      if (!_options.content.trim()) {
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
        content += '\n' + _options.content;
        // 写入文件
        tree.overwrite(path, content);
        return tree;
      }
    } else {
      // 创建文件
      tree.create(path, _options.content);
      return tree;
    }
  };
}
