import * as path from "path";
import * as fs from "fs";
import dependencyTree, { DependencyObj } from "dependency-tree";
import {TypescriptParser, File, DefaultDeclaration} from "typescript-parser-deluxe";

export async function traceConcat(
  entry: string,
  include?: string | null
): Promise<string> {
  const tree = dependencyTree({
    filename: entry,
    directory: path.resolve(entry, "../"),
  });

  const moduleSources: string[] = [];
  const resolved: { [name: string]: boolean } = {};
  function concatFromFiles(fileMap: DependencyObj) {
    const filePaths = Object.keys(fileMap);
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      if (resolved[filePath]) continue;
      resolved[filePath] = true;
      if (Object.keys(fileMap[filePath]).length > 0) {
        concatFromFiles(fileMap[filePath]);
      }

      moduleSources.push(fs.readFileSync(filePath).toString());
    }
  }
  concatFromFiles(tree);
  if (include) {
    moduleSources.push(fs.readFileSync(include).toString());
  }
  const promises: Promise<File>[] = [];
  for (let i = 0; i < moduleSources.length; i++) {
    const parser = new TypescriptParser();
    promises.push(parser.parseSource(moduleSources[i]));
  }
  const files = await Promise.all(promises);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let totalRemoved = 0;
    if (file.imports) {
      file.imports.forEach(({ start, end }) => {
        if (start === undefined) return;
        if (end === undefined) return;
        const length = end - start;
        // @ts-ignore
        const { removed, source } = removeStatement({ length, totalRemoved, source: moduleSources[i], start });
        totalRemoved += removed;
        moduleSources[i] = source;
      });
    }
    if (file.exports) {
      file.exports.forEach(({ start, end }) => {
        if (start === undefined) return;
        if (end === undefined) return;
        const length = end - start;
        // @ts-ignore
        const { removed, source } = removeStatement({ length, totalRemoved, source: moduleSources[i], start });
        totalRemoved += removed;
        moduleSources[i] = source;
      });
    }
    if (file.declarations) {
      file.declarations.forEach((declaration) => {
        // @ts-ignore
        if (declaration && declaration.isExported) {
          let length = 0;
          let start = null;
          // @ts-ignore
          if (declaration instanceof DefaultDeclaration) {
            throw new Error("default exports incompatible with lofi-bundler");
          } else {
            length = "export ".length;
            start = declaration.start;
          }
          if (start === undefined) return;
          const { removed, source } = removeStatement({ length, totalRemoved, source: moduleSources[i], start });
          totalRemoved += removed;
          moduleSources[i] = source;
        }
      });
    }
  }

  // very lofi grouper of modules into single large module with no exports
  return moduleSources.join("\n");
}


interface IStatement {
  totalRemoved: number;
  length: number;
  start: number;
  source: string;
}

interface IRemovedResult {
  source: string;
  removed: number;
}

function removeStatement({ length, start, source, totalRemoved }: IStatement): IRemovedResult {
  const begin = start - totalRemoved;
  return {
    source: source.substr(0, begin)
      + source.substr(begin + length),
    removed: length
  };
}
