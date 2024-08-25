import { Eta } from "eta";
import { Collection, Parameter, Scheme } from "../../../interface.ts";
import { join } from "@std/path";
export function generateSchemaTemplateData(
  currentCollection: Collection,
  allCollections: Collection[],
) {
  const imports = new Set<string>();
  const importedRefs = new Set<string>();

  function getParentChain(coll: Collection): Collection[] {
    const chain: Collection[] = [];
    let current: Collection | undefined = coll;
    while (current) {
      chain.unshift(current);
      current = current.parent;
    }
    return chain;
  }

  const parentChain = getParentChain(currentCollection);

  function generateRefAndPath() {
    const params = parentChain
      .map((c, index) =>
        `${c.name}DocId${index === parentChain.length - 1 ? "?" : ""}: string`
      )
      .join(", ");

    const pathParts = parentChain.map((c, index) => {
      if (index === parentChain.length - 1) {
        return `/${c.collectionName}\${${c.name}DocId ? \`/\${${c.name}DocId}\` : ''}`;
      } else {
        return `/${c.collectionName}/\${${c.name}DocId}`;
      }
    });

    const pathExpression = "`" + pathParts.join("") + "`";

    return {
      refParams: params,
      collectionPath: `(${params}) => ${pathExpression}`,
    };
  }
  function generateFields(
    scheme: Scheme,
    parentField?: string,
  ): Array<{ name: string; type: string; required: boolean }> {
    return Object.entries(scheme).map(([key, value]) => {
      const fullFieldName = parentField ? `${parentField}.${key}` : key;
      let type: string;
      let required: boolean;

      if (Array.isArray(value)) {
        type = generateFieldType(value, fullFieldName);
        required = true;
      } else if ("type" in value) {
        type = generateFieldType(value, fullFieldName);
        required = value.required as boolean;
      } else {
        type = generateFieldType(value, fullFieldName);
        required = true;
      }

      return { name: key, type, required };
    });
  }

  function generateFieldType(
    field: Parameter | Scheme | Scheme[],
    parentField?: string,
  ): string {
    if (Array.isArray(field)) {
      const arrayType = generateFieldType(field[0], parentField);
      return `Array<${arrayType}>`;
    } else if ("type" in field) {
      switch (field.type) {
        case "string":
        case "number":
        case "boolean":
          return field.type;
        case "object":
          return generateFieldType(field.fields, parentField);
        case "array":
          return `Array<${generateFieldType(field.fields, parentField)}>`;
        case "timestamp":
          return "Timestamp";
        case "reference": {
          const referencedCollection = allCollections.find((c) =>
            c.collectionName === field.collection
          );
          if (referencedCollection) {
            const referencedName =
              referencedCollection.name.charAt(0).toUpperCase() +
              referencedCollection.name.slice(1);
            imports.add(referencedName);
            importedRefs.add(referencedCollection.name.toLowerCase() + "Ref");
            return `DocumentReference<${referencedName}>`;
          }
          return `DocumentReference<unknown>`;
        }
        default:
          return "any";
      }
    } else {
      const nestedFields = generateFields(field, parentField);
      return `{\n${
        nestedFields.map((f) =>
          `    ${f.name}${f.required ? "" : "?"}: ${f.type};`
        ).join("\n")
      }\n  }`;
    }
  }

  const fields = generateFields(currentCollection.document.data);

  const importStatements = Array.from(imports).map((name) => ({
    name,
    refName: `${name.toLowerCase()}Ref`,
    file: name.toLowerCase(),
  }));

  const { refParams, collectionPath } = generateRefAndPath();

  return {
    collectionName: currentCollection.collectionName,
    entityName: currentCollection.name,
    fields,
    imports: importStatements,
    importedRefs: Array.from(importedRefs),
    refParams,
    collectionPath,
    isSubcollection: parentChain.length > 1,
  };
}

export function generateWebTsClientCode(options: {
  outputDir: string;
}, ...collections: Collection[]) {
  const scriptDir = Deno.cwd();
  const eta = new Eta({
    views: join(scriptDir, "templates/web"),
    autoEscape: false,
  });
  const { outputDir } = options;
  collections.forEach((collection) => {
    const templateData = generateSchemaTemplateData(collection, collections);
    const resScheme = eta.render("schema", templateData);
    const dir = join(outputDir, templateData.entityName);
    Deno.mkdirSync(dir, { recursive: true });
    Deno.writeFileSync(
      `${dir}/scheme.ts`,
      new TextEncoder().encode(resScheme),
      {
        create: true,
        append: false,
      },
    );

    // firestore
    const resFirestore = eta.render("firestore", templateData);
    Deno.writeFileSync(
      `${dir}/firestore.ts`,
      new TextEncoder().encode(resFirestore),
      {
        create: true,
        append: false,
      },
    );
  });
}
