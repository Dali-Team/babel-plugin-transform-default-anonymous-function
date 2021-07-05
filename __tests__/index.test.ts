import * as babel from "@babel/core";
import pluginTransformDefaultAnonymousFunction, {
  TRANSFORMED_DEFAULT_NAME,
} from "../src/index";

describe("babel-plugin-transform-default-anonymous-function", () => {
  it("should work with simple arrow function", () => {
    const actual = transform(`export default (a,b,c) => {};
`);
    expect(actual).toMatchSnapshot();
  });

  it("should work with arrow function with short form", () => {
    const actual = transform(`export default () => null;
`);
    expect(actual).toMatchSnapshot();
  });

  it("should work with simple anonymous function", () => {
    const actual = transform(`export default function() { return null };
`);
    expect(actual).toMatchSnapshot();
  });

  it("should work with high order component", () => {
    const actual = transform(`const Component = () => null;
export default memo(Component);
`);
    expect(actual).toMatchSnapshot();
  });

  it("should work with no conflict name", () => {
    const actual = transform(`const ${TRANSFORMED_DEFAULT_NAME} = '1';
export default () => {};
`);
    expect(actual).toMatchSnapshot();
  });
});

function transform(input: string, options: any = {}) {
  return babel.transform(input, {
    babelrc: false,
    configFile: false,
    envName: options.envName,
    presets: ["@babel/preset-react"],
    plugins: [
      [
        pluginTransformDefaultAnonymousFunction,
        {
          skipEnvCheck:
            options.skipEnvCheck === undefined ? true : options.skipEnvCheck,
          // To simplify debugging tests:
          ...options.freshOptions,
        },
      ],
      ...(options.plugins || []),
    ],
  })!.code!;
}
