type ParameterLiteral = {
  type: "string" | "number" | "boolean";
  required: boolean;
};

type ParameterObject = {
  type: "object";
  required: boolean;
  fields: Parameter | Scheme | Scheme[];
};

type ParameterTimeStamp = {
  type: "timestamp";
  required: boolean;
};

type ParameterReference = {
  type: "reference";
  required: boolean;
  collection: string;
};

type ParameterArray = {
  type: "array";
  required: boolean;
  fields: Parameter | Scheme | Scheme[];
};
export type Parameter =
  | ParameterLiteral
  | ParameterObject
  | ParameterArray
  | ParameterTimeStamp
  | ParameterReference;

export interface Scheme {
  [key: string]: Parameter | Scheme | Scheme[];
}

export interface Document {
  data: Scheme;
}

export type PresetSecurityRules =
  | "isOwner"
  | "isAuthenticated"
  | "isPublic"
  | "isValidData";

export type Rule = {
  preset: PresetSecurityRules;
} | {
  rule: string;
};
export interface SecurityRules {
  read: Rule[];
  write: Rule[];
  create: Rule[];
  update: Rule[];
  delete: Rule[];
}

interface FieldValidation {
  [fieldName: string]: string;
}

export interface Collection {
  name: string;
  collectionName: string;
  parent?: Collection;
  document: Document;
  security: SecurityRules;
  fieldValidations?: FieldValidation;
}

export interface GenerateFirestoreCodeOptions {
  /**
   * only support "typescript" for now
   * but can be extended to other languages
   * e.g. "admin-ts", "go", "flutter"
   */
  lang: "web-ts";
  /**
   * absolute path to the output directory
   */
  outputDir: string;
}
