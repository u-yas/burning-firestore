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

function renderScheme(
  templateData: ReturnType<typeof generateSchemaTemplateData>,
): string {
  const t = templateData;
  const pascalCaseName = t.entityName.charAt(0).toUpperCase() +
    t.entityName.slice(1);
  const camelCaseName = t.entityName.charAt(0).toLowerCase() +
    t.entityName.slice(1);

  const template =
    `import { DocumentReference,Timestamp } from 'firebase/firestore';
${
      t.imports.map((imp) =>
        `import { ${imp.name} } from '../${imp.file}/scheme'`
      ).join("\n")
    }


export interface ${pascalCaseName} {
${
      t.fields.map((field) =>
        `\t${field.name}${field.required ? "" : "?"}: ${field.type};`
      ).join("\n")
    }
}

export type Ref = (${t.refParams}) => string;

export const ${camelCaseName}Ref: Ref = ${t.collectionPath};
`;
  return template;
}

function renderFirestore(
  templateData: ReturnType<typeof generateSchemaTemplateData>,
): string {
  const t = templateData;
  const pascalCaseName = t.entityName.charAt(0).toUpperCase() +
    t.entityName.slice(1);
  const camelCaseName = t.entityName.charAt(0).toLowerCase() +
    t.entityName.slice(1);

  const template =
    `import { Firestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, QueryFieldFilterConstraint, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { ${pascalCaseName}, ${camelCaseName}Ref, Ref } from './scheme';

// Collection reference
export const ${camelCaseName}Collection = (db: Firestore, ...params: Parameters<Ref>) => 
  collection(db, ${camelCaseName}Ref(...params));

// Document reference
export const ${camelCaseName}Doc = (db: Firestore, ...params: Parameters<Ref>) => 
  doc(db, ${camelCaseName}Ref(...params));

// Get a document
export const get${pascalCaseName} = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = ${camelCaseName}Doc(db, ...params);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as ${pascalCaseName} : null;
};

// Get all documents in a collection
export const getAll${pascalCaseName}s = async (db: Firestore, ...params: Parameters<Ref>) => {
  const collectionRef = ${camelCaseName}Collection(db, ...params);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map(doc => doc.data() as ${pascalCaseName});
};

// Add a new document
export const add${pascalCaseName} = async (db: Firestore, data: ${pascalCaseName}, ...params: Parameters<Ref>) => {
  const collectionRef = ${camelCaseName}Collection(db, ...params);
  return await addDoc(collectionRef, data);
};

// Set a document
export const set${pascalCaseName} = async (db: Firestore, data: ${pascalCaseName}, ...params: Parameters<Ref>) => {
  const docRef = ${camelCaseName}Doc(db, ...params);
  await setDoc(docRef, data);
};

// Update a document
export const update${pascalCaseName} = async (db: Firestore, data: Partial<${pascalCaseName}>, ...params: Parameters<Ref>) => {
  const docRef = ${camelCaseName}Doc(db, ...params);
  await updateDoc(docRef, data);
};

// Delete a document
export const delete${pascalCaseName} = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = ${camelCaseName}Doc(db, ...params);
  await deleteDoc(docRef);
};

export const query${pascalCaseName}s = 
  (db: Firestore, ...refParams: Parameters<Ref>) =>
  async (...queries: QueryFieldFilterConstraint[]) => {
    const collectionRef = ${camelCaseName}Collection(db, ...refParams);
    const q = query(collectionRef, ...queries);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as ${pascalCaseName});
  };
`;

  return template;
}
export function generateWebTsClientCode(options: {
  outputDir: string;
}, ...collections: Collection[]) {
  const { outputDir } = options;
  collections.forEach((collection) => {
    const templateData = generateSchemaTemplateData(collection, collections);

    const resScheme = renderScheme(templateData);
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
    const resFirestore = renderFirestore(templateData);
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
