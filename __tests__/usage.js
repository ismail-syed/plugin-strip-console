const swc = require("@swc/core");
const ConsoleStripper = require("../lib").default;

it("should strip console call", () => {
  const code = `console.log('Foo')`;
  console.log("before: ", code);
  const output = swc.transformSync(code, {
    plugin: (m) => new ConsoleStripper().visitModule(m),
  });

  console.log("after:", output.code);

  expect(output.code.replace(/\n/g, "")).toBe("void 0;");
});
