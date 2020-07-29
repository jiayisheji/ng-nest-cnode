import { strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  Tree,
  url
} from '@angular-devkit/schematics';
import { parse } from 'path';
import { VueComponentOptions } from './schema';

export function vueComponent(_options: VueComponentOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // 先获取文件存放路径和文件名
    const { path, name } = parsePathName(_options.name);
    // 模板语言
    const template = ['html', 'pug'].includes(_options.template) ? _options.template : 'html';
    // 脚本语言
    const script = ['js', 'ts'].includes(_options.script) ? _options.script : 'js';
    // 样式语言
    const style = ['css', 'scss', 'sass', 'less', 'stylus', 'postcss'].includes(_options.style) ? _options.style : 'css';
    //
    const module = _options.scoped && _options.module && _options.moduleName.length;
    const scoped = !module && _options.scoped;

    // 是否多文件
    const notInline = [_options.inlineScript, _options.inlineTemplate, _options.inlineStyle].every(Boolean);
    console.log(_options, {
      ..._options,
      ...{ name, template, script, style, module, scoped, path, notInline },
    });

    const templateSource = apply(url('./files'), [
      notInline ? filter(f => !f.endsWith('vue.__script__.template')) : filter(f => !f.endsWith('.vue.template')),
      !_options.inlineTemplate ? noop() : filter(f => !f.endsWith('.__template__.template')),
      !_options.inlineStyle ? noop() : filter(f => !f.endsWith('.__style__.template')),
      !_options.inlineScript ? noop() : filter(f => !f.endsWith('__type@camelize__.__script__.template')),
      _options.spec ? noop() : filter(f => !f.endsWith('.spec.__script__.template')),
      applyTemplates({
        ...strings,
        ..._options,
        ...{ name, template, script, style, module, scoped },
      }),
      move(!notInline ? `${path}/${name}` : path),
    ]);

    const rule = chain([branchAndMerge(chain([mergeWith(templateSource)]))]);

    return rule(tree, _context);
  };
}

/**
 * 解析路径名称
 * @param pathName
 */
function parsePathName(pathName: string): { path: string; name: string } {
  const parseObj = parse(pathName);
  return {
    path: parseObj.dir,
    name: parseObj.base,
  };
}
