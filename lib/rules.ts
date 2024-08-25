import {
  Collection,
  PresetSecurityRules,
  Rule,
  SecurityRules,
} from "../interface.ts";

export function generateFirestoreSecurityRules(
  options: {
    outputDir: string;
  },
  ...collections: Collection[]
) {
  const rules = firestoreSecurityRules(...collections);

  Deno.writeTextFileSync(`${options.outputDir}/firestore.rules`, rules);
}

const validFirestoreTypes = [
  "bool",
  "bytes",
  "float",
  "int",
  "list",
  "latlng",
  "number",
  "path",
  "map",
  "string",
  "timestamp",
] as const;
type ValidFirestoreType = (typeof validFirestoreTypes)[number];

export function firestoreSecurityRules(
  ...collections: Collection[]
): string {
  function generateRulesForCollection(
    collection: Collection,
    indent: string = "",
  ): string {
    const rules: string[] = [];
    const { collectionName, security, document } = collection;

    rules.push(`${indent}match /${collectionName}/{documentId} {`);

    // Generate isValidData function
    const requiredFields: string[] = [];
    const allFields: string[] = [];
    const fieldValidations: string[] = [];

    Object.entries(document.data).forEach(([field, schema]) => {
      allFields.push(field);
      if ("required" in schema && schema.required) {
        requiredFields.push(field);
      }

      let validation = "";
      if (
        "type" in schema &&
        validFirestoreTypes.includes(schema.type as ValidFirestoreType)
      ) {
        validation = `request.resource.data.${field} is ${schema.type}`;
      }

      if (validation) {
        fieldValidations.push(validation);
      }
    });

    // Define preset rules
    const presetRules: Record<PresetSecurityRules, string> = {
      isOwner:
        "request.auth != null && request.auth.uid == resource.data.authorId",
      isAuthenticated: "request.auth != null",
      isPublic: "true",
      isValidData: "isValidData()",
    };

    function resolveRule(rule: Rule): string {
      if ("preset" in rule) {
        return presetRules[rule.preset];
      } else {
        return rule.rule;
      }
    }

    function generateRuleForOperation(operation: keyof SecurityRules) {
      const operationRules = security[operation];
      if (operationRules && operationRules.length > 0) {
        const resolvedRules = operationRules.map(resolveRule);
        const combinedRule = resolvedRules.join(" && ");
        rules.push(`${indent}  allow ${operation}: if ${combinedRule};`);
      }
    }

    // Generate rules for each operation
    ["read", "write", "create", "update", "delete"].forEach((op) =>
      generateRuleForOperation(op as keyof SecurityRules)
    );

    function isUsedValidDataPreset() {
      return Object.values(security).some((rules: Rule[]) =>
        rules.some((rule) => {
          return "preset" in rule && rule.preset === "isValidData";
        })
      );
    }
    if (isUsedValidDataPreset()) {
      rules.push(`${indent}  function isValidData() {`);
      rules.push(
        `${indent}    return request.resource.data.keys().hasAll(${
          JSON.stringify(requiredFields)
        }) &&`,
      );
      rules.push(
        `${indent}           request.resource.data.keys().hasOnly(${
          JSON.stringify(allFields)
        })${fieldValidations.length > 0 ? " &&" : ""}`,
      );
      if (fieldValidations.length > 0) {
        rules.push(`${indent}           (${fieldValidations.join(" && ")});`);
      } else {
        rules.push(`${indent}           true;`);
      }
      rules.push(`${indent}  }`);
    }
    // Nested collections
    const nestedCollections = collections.filter((c) =>
      c.parent?.collectionName === collectionName
    );
    nestedCollections.forEach((nestedCollection) => {
      rules.push(generateRulesForCollection(nestedCollection, indent + "  "));
    });

    rules.push(`${indent}}`);

    return rules.join("\n");
  }

  const rootCollections = collections.filter((c) => !c.parent);
  const rules = rootCollections.map((c) => generateRulesForCollection(c));

  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
${rules.join("\n\n")}
  }
}
`;
}
