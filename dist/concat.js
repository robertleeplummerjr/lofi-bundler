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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceConcat = void 0;
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var dependency_tree_1 = __importDefault(require("dependency-tree"));
var typescript_parser_deluxe_1 = require("typescript-parser-deluxe");
function traceConcat(entry, include) {
    return __awaiter(this, void 0, void 0, function () {
        function concatFromFiles(fileMap) {
            var filePaths = Object.keys(fileMap);
            for (var i = 0; i < filePaths.length; i++) {
                var filePath = filePaths[i];
                if (resolved[filePath])
                    continue;
                resolved[filePath] = true;
                if (Object.keys(fileMap[filePath]).length > 0) {
                    concatFromFiles(fileMap[filePath]);
                }
                moduleSources.push(fs.readFileSync(filePath).toString());
            }
        }
        var tree, moduleSources, resolved, promises, i, parser, files, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tree = dependency_tree_1.default({
                        filename: entry,
                        directory: path.resolve(entry, "../"),
                    });
                    moduleSources = [];
                    resolved = {};
                    concatFromFiles(tree);
                    if (include) {
                        moduleSources.push(fs.readFileSync(include).toString());
                    }
                    promises = [];
                    for (i = 0; i < moduleSources.length; i++) {
                        parser = new typescript_parser_deluxe_1.TypescriptParser();
                        promises.push(parser.parseSource(moduleSources[i]));
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    files = _a.sent();
                    _loop_1 = function (i) {
                        var file = files[i];
                        var totalRemoved = 0;
                        if (file.imports) {
                            file.imports.forEach(function (_a) {
                                var start = _a.start, end = _a.end;
                                if (start === undefined)
                                    return;
                                if (end === undefined)
                                    return;
                                var length = end - start;
                                // @ts-ignore
                                var _b = removeStatement({ length: length, totalRemoved: totalRemoved, source: moduleSources[i], start: start }), removed = _b.removed, source = _b.source;
                                totalRemoved += removed;
                                moduleSources[i] = source;
                            });
                        }
                        if (file.exports) {
                            file.exports.forEach(function (_a) {
                                var start = _a.start, end = _a.end;
                                if (start === undefined)
                                    return;
                                if (end === undefined)
                                    return;
                                var length = end - start;
                                // @ts-ignore
                                var _b = removeStatement({ length: length, totalRemoved: totalRemoved, source: moduleSources[i], start: start }), removed = _b.removed, source = _b.source;
                                totalRemoved += removed;
                                moduleSources[i] = source;
                            });
                        }
                        if (file.declarations) {
                            file.declarations.forEach(function (declaration) {
                                // @ts-ignore
                                if (declaration && declaration.isExported) {
                                    var length_1 = 0;
                                    var start = null;
                                    // @ts-ignore
                                    if (declaration instanceof typescript_parser_deluxe_1.DefaultDeclaration) {
                                        throw new Error("default exports incompatible with lofi-bundler");
                                    }
                                    else {
                                        length_1 = "export ".length;
                                        start = declaration.start;
                                    }
                                    if (start === undefined)
                                        return;
                                    var _a = removeStatement({ length: length_1, totalRemoved: totalRemoved, source: moduleSources[i], start: start }), removed = _a.removed, source = _a.source;
                                    totalRemoved += removed;
                                    moduleSources[i] = source;
                                }
                            });
                        }
                    };
                    for (i = 0; i < files.length; i++) {
                        _loop_1(i);
                    }
                    // very lofi grouper of modules into single large module with no exports
                    return [2 /*return*/, moduleSources.join("\n")];
            }
        });
    });
}
exports.traceConcat = traceConcat;
function removeStatement(_a) {
    var length = _a.length, start = _a.start, source = _a.source, totalRemoved = _a.totalRemoved;
    var begin = start - totalRemoved;
    return {
        source: source.substr(0, begin)
            + source.substr(begin + length),
        removed: length
    };
}
//# sourceMappingURL=concat.js.map