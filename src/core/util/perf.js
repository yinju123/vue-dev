import { inBrowser } from "./env";

export let mark;
export let measure;

if (process.env.NODE_ENV !== "production") {
  // 如果在浏览器里面perf = window.performance。window.performance用来计算性能
  const perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = tag => perf.mark(tag);
    measure = (name, startTag, endTag) => {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      // perf.clearMeasures(name)
    };
  }
}
