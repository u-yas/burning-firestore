import { generateFirestoreClientCode } from "./lib/code.ts";
import { generateFirestoreSecurityRules } from "./lib/rules.ts";
import { Collection, Document } from "./interface.ts";

export {
  type Collection,
  type Document,
  generateFirestoreClientCode,
  generateFirestoreSecurityRules,
};
