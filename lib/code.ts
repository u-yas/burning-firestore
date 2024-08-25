import { Collection, GenerateFirestoreCodeOptions } from "../interface.ts";
import { generateWebTsClientCode } from "./lang/web-ts/client_code.ts";

export function generateFirestoreClientCode(
  options: GenerateFirestoreCodeOptions,
  ...collections: Collection[]
) {
  const { lang } = options;

  if (lang === "web-ts") {
    generateWebTsClientCode(options, ...collections);
  }
  return;
}
