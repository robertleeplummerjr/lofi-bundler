#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var concat_1 = require("./concat");
var _package = require(path.resolve(process.cwd(), "package.json"));
if (!_package)
    throw new Error("No package.json file");
var config = _package.config;
if (!config)
    throw new Error("No package.config object");
var lofiBundler = require(path.resolve(process.cwd(), "package.json")).config["lofi-bundler"];
if (!lofiBundler)
    throw new Error("No package.config.lofi-bundler object");
var entryFile = lofiBundler["entry"];
if (!entryFile)
    throw new Error("No package.config.lofi-bundler.entry");
var targetFile = lofiBundler["target"];
if (!targetFile)
    throw new Error("No package.config.lofi-bundler.target");
var includeFile = lofiBundler["include"];
if (includeFile) {
    console.log("Using package.config.lofi-bundler.include");
}
concat_1.traceConcat(path.resolve(entryFile), includeFile ? path.resolve(process.cwd(), includeFile) : null)
    .then(function (bundle) {
    fs.writeFileSync(path.resolve(targetFile), bundle);
    process.exit(0);
})
    .catch(function (err) {
    console.warn(err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map