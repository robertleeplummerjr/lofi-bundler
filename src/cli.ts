#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { traceConcat } from "./concat";

const _package = require(path.resolve(process.cwd(), "package.json"));
if (!_package) throw new Error("No package.json file");
const config = _package.config;
if (!config) throw new Error("No package.config object");
const lofiBundler = require(path.resolve(process.cwd(), "package.json")).config["lofi-bundler"];
if (!lofiBundler) throw new Error("No package.config.lofi-bundler object");

const entryFile: string = lofiBundler["entry"];
if (!entryFile) throw new Error("No package.config.lofi-bundler.entry");
const targetFile: string = lofiBundler["target"];
if (!targetFile) throw new Error("No package.config.lofi-bundler.target");
const includeFile: string = lofiBundler["include"];

if (includeFile) {
  console.log("Using package.config.lofi-bundler.include");
}

traceConcat(
  path.resolve(entryFile),
  includeFile ? path.resolve(process.cwd(), includeFile) : null
)
  .then((bundle: string) => {
    fs.writeFileSync(path.resolve(targetFile), bundle);
    process.exit(0);
  })
  .catch(err => {
    console.warn(err);
    process.exit(1);
  });
