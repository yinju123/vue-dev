/* @flow */

import { noop, extend } from "shared/util";
import { warn as baseWarn, tip } from "core/util/debug";
import { generateCodeFrame } from "./codeframe";

type CompiledFunctionResult = {
  render: Function,
  staticRenderFns: Array<Function>,
};

function createFunction(code, errors) {
  try {
    return new Function(code);
  } catch (err) {
    errors.push({ err, code });
    return noop;
  }
}

export function createCompileToFunctionFn(compile: Function): Function {
  const cache = Object.create(null);

  return function compileToFunctions(
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    // 这里用三个点可以实现
    /* 
      outputSourceRange: false,
      // 属性是否会 编码字符 即 \n 会被编译成&#10;
      shouldDecodeNewlines: false,
      // href 是否会被编译
      shouldDecodeNewlinesForHref:true,
      delimiters: undefined,
      comments: undefined
    */
    options = extend({}, options);
    // debugger
    const warn = options.warn || baseWarn;
    delete options.warn;

    /* istanbul ignore if */
    /* 不知道这个干吗的 */
    if (process.env.NODE_ENV !== "production") {
      // detect possible CSP restriction
      try {
        new Function("return 1");
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            "It seems you are using the standalone build of Vue.js in an " +
            "environment with Content Security Policy that prohibits unsafe-eval. " +
            "The template compiler cannot work in this environment. Consider " +
            "relaxing the policy to allow unsafe-eval or pre-compiling your " +
            "templates into render functions."
          );
        }
      }
    }

    // check cache
    // key = template
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key];
    }

    // compile
    // template options 是传入的值
    /* 
    主要是执行生成编译器的方法的构造器里面执行的baseCompile
    他的入场也是template, options，只是在这过程中会做一些处理
    baseCompile 最主要执行的是parse方法，得到ast
    */
    const compiled = compile(template, options);

    // check compilation errors/tips
    if (process.env.NODE_ENV !== "production") {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach((e) => {
            warn(
              `Error compiling template:\n\n${e.msg}\n\n` +
              generateCodeFrame(template, e.start, e.end),
              vm
            );
          });
        } else {
          warn(
            `Error compiling template:\n\n${template}\n\n` +
            compiled.errors.map((e) => `- ${e}`).join("\n") +
            "\n",
            vm
          );
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach((e) => tip(e.msg, vm));
        } else {
          compiled.tips.forEach((msg) => tip(msg, vm));
        }
      }
    }

    // turn code into functions
    const res = {};
    const fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map((code) => {
      return createFunction(code, fnGenErrors);
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== "production") {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          `Failed to generate render function:\n\n` +
          fnGenErrors
            .map(({ err, code }) => `${err.toString()} in\n\n${code}\n`)
            .join("\n"),
          vm
        );
      }
    }

    return (cache[key] = res);
  };
}
