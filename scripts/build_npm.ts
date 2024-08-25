// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  test: false,
  typeCheck: false,
  declaration: "separate",
  scriptModule: "cjs",
  entryPoints: ["./main.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "burning-firestore",
    version: Deno.args[0],
    description:
      "Generate Firestore Client Code and Security Rules and Indexes From Typescript Objects",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/u-yas/burning-firestore.git",
    },
    bugs: {
      url: "https://github.com/u-yas/burning-firestore/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
