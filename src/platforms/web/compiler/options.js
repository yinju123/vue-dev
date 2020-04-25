/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace,
} from "../util/index";

import modules from "./modules/index";
import directives from "./directives/index";
import { genStaticKeys } from "shared/util";
import { isUnaryTag, canBeLeftOpenTag } from "./util";

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  // class style module: 指令处理， v-if v-model
  modules,
  directives,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules),
};
