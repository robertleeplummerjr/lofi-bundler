import * as fs from "fs";
import * as path from "path";

import { traceConcat } from "./concat";
let mockProjectPath: string = ".mock-project";
function setupMockProject() {
  if (!fs.existsSync(mockProjectPath)) {
    fs.mkdirSync(mockProjectPath);
  }
  fs.writeFileSync(".mock-project/foo.ts", `
  export class Foo {
    constructor() {
      console.log("Foo exists!");
    }
  }`);
  fs.writeFileSync(".mock-project/bar.ts", `
  import { Foo } from "./foo";
  export class Bar {
    constructor() {
      new Foo();
      console.log("Bar exists!");
    }
  }`);
  fs.writeFileSync(".mock-project/bat.ts", `
  export class Bat {
    constructor() {
      console.log("Bat exists!");
    }
  }`);
}

describe("concat", () => {
  describe("traceConcat()", () => {
    const cwd = process.cwd();
    beforeEach(() => {
      setupMockProject();
      process.chdir(".mock-project");
    });
    afterEach(() => {
      process.chdir(cwd);
    });
    describe("when ran on package entry and dependent files", () => {
      it("bundles everything together", async () => {
        const rawSource = await traceConcat(
          path.resolve("bar.ts"),
          path.resolve("bat.ts")
        );
        expect(rawSource.length).not.toBe(0);
        expect(rawSource.indexOf("Foo exists")).not.toBe(-1);
        expect(rawSource.indexOf("Bar exists")).not.toBe(-1);
        expect(rawSource.indexOf("Bat exists")).not.toBe(-1);
      });
      describe("when include path is not provided",  () => {
        it("bundles everything together", async () => {
          const rawSource = await traceConcat("bar.ts");
          expect(rawSource.length).not.toBe(0);
          expect(rawSource.indexOf("Foo exists")).not.toBe(-1);
          expect(rawSource.indexOf("Bar exists")).not.toBe(-1);
          expect(rawSource.indexOf("Bat exists")).toBe(-1);
        });
      });
    });
    describe("when used on hypothetical files", () => {
      describe("when imports exist", () => {
        beforeEach(() => {
          fs.writeFileSync("foo1.ts",
            `
            export class Foo1 {
              constructor() {
                console.log('I exist!');
              }
            };
          `
          );
          fs.writeFileSync(
            "foo2.ts",
            `
            import { Foo1 } from './foo1';
            export class Foo2 extends Foo1 {
              bar() {}
            }
          `
          );
          fs.writeFileSync(
            "foo3.ts",
            `
            import { Foo1 } from '${path.resolve("foo1")}';
            export class Foo3 extends Foo1 {
              bas() {}
            }
          `
          );
          fs.writeFileSync(
            "entry.ts",
            `
            import { Foo3 } from './foo3';
            import { Foo2 } from './foo2';
            
            new Foo2();
            new Foo3();
          `
          );
          fs.writeFileSync(
            "include.ts",
            `
            import { Foo3 } from './foo3';
            
            new Foo3();
          `
          );
        });
        it("they are removed", async () => {
          const rawSource = await traceConcat(
            path.resolve( "bat.ts"),
            path.resolve("include.ts")
          );
          expect(rawSource.split("class Foo3").length).toBe(1);
          expect(rawSource.match("import")).toBe(null);
        });
      });
    });
    describe("when exporting a class", () => {
      beforeEach(() => {
        fs.writeFileSync("foo1.ts",
  `export class Foo1 {
  constructor() {
    console.log('I exist!');
  }
}`
        );
      });
      it("removes the export", async () => {
        const rawSource = await traceConcat("foo1.ts");
        expect(rawSource).toBe(
          `class Foo1 {
  constructor() {
    console.log('I exist!');
  }
}`);
      });
    });
    describe("when importing a class", () => {
      beforeEach(() => {
        fs.writeFileSync("foo1.ts",
          `export class Foo1 extends {
  constructor() {}
}`
        );
        fs.writeFileSync("foo2.ts",
          `
import { Foo1 } from "./foo1.ts";
export class Foo2 extends Foo1 {
  constructor() {}
}`
        );
      });
      it("They are concatenated and import is removed", async () => {
        const rawSource = await traceConcat("foo2.ts");
        expect(rawSource).toBe(
          `class Foo1 extends {
  constructor() {}
}


class Foo2 extends Foo1 {
  constructor() {}
}`);
      });
    });
    describe("when exporting multiple classes", () => {
      beforeEach(() => {
        fs.writeFileSync("foos.ts",
          `export class Foo1 {
  constructor() {}
}

export class Foo2 {
  constructor() {}
}

export class Foo3 {
  constructor() {}
}`
        );
      });
      it("removes each export", async () => {
        const rawSource = await traceConcat("foos.ts");
        expect(rawSource).toBe(
          `class Foo1 {
  constructor() {}
}

class Foo2 {
  constructor() {}
}

class Foo3 {
  constructor() {}
}`);
      });
    });
    describe("when exporting a default class", () => {
      beforeEach(() => {
        fs.writeFileSync("foo1.ts",
          `export default class Foo1 {
  constructor() {
    console.log('I exist!');
  }
}`
        );
      });
      it("removes the default export", async () => {
        const rawSource = await traceConcat("foo1.ts");
        expect(rawSource).toBe(
          `class Foo1 {
  constructor() {
    console.log('I exist!');
  }
}`);
      });
    });
    describe("when exporting a default class and other classes", () => {
      beforeEach(() => {
        fs.writeFileSync("foos.ts",
          `export default class Foo1 {
  constructor() {}
}

export class Foo2 {
  constructor() {}
}

export class Foo3 {
  constructor() {}
}`
        );
      });
      it("removes the default export", async () => {
        const rawSource = await traceConcat("foos.ts");
        expect(rawSource).toBe(
          `class Foo1 {
  constructor() {}
}

class Foo2 {
  constructor() {}
}

class Foo3 {
  constructor() {}
}`);
      });
    });
    describe("when exporting interfaces", () => {
      beforeEach(() => {
        fs.writeFileSync("foos.ts",
          `export interface IFoo1 {
  value: string;
}

export interface IFoo2 {
  value: string;
}

export interface IFoo3 {
  value: string;
}`
        );
      });
      it("removes each export", async () => {
        const rawSource = await traceConcat("foos.ts");
        expect(rawSource).toBe(
          `interface IFoo1 {
  value: string;
}

interface IFoo2 {
  value: string;
}

interface IFoo3 {
  value: string;
}`);
      });
    });
  });
  describe("when exporting index", () => {
      beforeEach(() => {
        fs.writeFileSync("index.ts",
          `export { Thaw, thaw } from './thaw';
export { Block } from './block';

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Thaw = Thaw;
  // @ts-ignore
  window.thaw = thaw;
  // @ts-ignore
  window.Thaw.Block = Block;
}`
        );
      });
      it("removes each export", async () => {
        const rawSource = await traceConcat("index.ts");
        expect(rawSource).toBe(
          `




if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Thaw = Thaw;
  // @ts-ignore
  window.thaw = thaw;
  // @ts-ignore
  window.Thaw.Block = Block;
}`);
    });
  });
});
