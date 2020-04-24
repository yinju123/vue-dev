/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {
  // template 是src\platforms\web\entry-runtime-with-compiler.js 中传入值模板进行了trim方法后的值。options 是 传入的options和baseOptions进行合并的结果
  /* 
    options
    {
      comments: undefined
      delimiters: undefined
      outputSourceRange: true
      shouldDecodeNewlines: false
      shouldDecodeNewlinesForHref: false,
      warn
    }

  */
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
