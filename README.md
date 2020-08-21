# lofi-bundler
A simple typescript bundler utility for projects with zero dependencies.

## What does it do?
Walk through all files in your project (and only your project, sorry no node_modules or other folders) and concatenates a single copy of all files together in one typescript bundle.

## Why?
* Node isn't the only cool guy around, there is this thing called the "browser", and we need an intermediate step (ie, this project's output) to get there. 
* Typescript doesn't support anything outside of AMD and System for the browser.
* Because sometimes a project is simple enough, and we'd like to package it for a browser, in addition to node.
* No worrying about babel configs, AMD, or System, just good old-fashioned `tsc`ing to a single file, and transform to browser.
* Because I can. 

## Getting Started
1. install using `yarn add lofi-bundler`
2. add config to your package.json:
  ```json
    {
      "config": {
        "lofi-bundler": {
          "entry": "entry-file.ts",
          "target": "target-file.ts",
          "include": "optional-include-file.ts"
        }
      }
    }
  ```
3. run the cli `lofi-bundler`
4. use output ts file... Perhaps as a temporary file to run `tsc` on?
5. congratulate yourself on going lofi!


## API
You can as well use the methods provided from the cli programmatically:
```ts
import { traceConcat } from 'logi-bundler';
traceConcat(file)
  .then(src => fs.writeFileSync('bundle.ts', src));
```

## Recipes
This was taken from a project (thaw.js), which is a small utility that can be used in both node and the browser.
```json
{
  scripts: {
    "test": "jest",
    "dist": "tsc --outDir dist",
    "browser": "lofi-bundler; tsc browser.ts --target es5 --module commonjs; rm browser.ts",
    "build": "rm -rf ./dist; npm run dist; git add ./dist; npm run browser"
  }
}
```


## Warnings
* Default exports: Not supported, don't use them.  Naming isn't guaranteed.
