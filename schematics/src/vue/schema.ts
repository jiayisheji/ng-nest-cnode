export interface VueComponentOptions {
  name: string;
  template: 'html' | 'pug';
  script: 'js' | 'ts';
  style: 'css' | 'sass' | 'scss' | 'less' | 'stylus' | 'postcss';
  pure: boolean;
  inlineStyle: boolean;
  inlineTemplate: boolean;
  inlineScript: boolean;
  scoped: boolean;
  module: boolean;
  moduleName: string[];
  spec: boolean;
  docs: boolean;
  custom: string[];
  type: string;
}
