import * as babel from "@babel/core";
import * as t from "@babel/types";
import type { NodePath } from "@babel/core";

/**
 * The first character must be upper case.
 */
export const TRANSFORMED_DEFAULT_NAME = "Transformed_default_name_";

/**
 * export () => {}
 * maybe is a react function component, but it doesn't has a name...
 * This plugin transform it to export function <$no_conflict_default_name>() {}
 */
export default function (_: any, opts: any = {}): babel.PluginItem {
  if (typeof (babel as any).env === "function") {
    // Only available in Babel 7.
    const env = (babel as any).env();
    if (env !== "development" && !opts.skipEnvCheck) {
      throw new Error(
        "Default arrow function transform should only be enabled in development environment. " +
          'Instead, the environment is: "' +
          env +
          '". If you want to override this check, pass {skipEnvCheck: true} as plugin options.'
      );
    }
  }

  return {
    visitor: {
      ExportDefaultDeclaration: (
        path: NodePath<Extract<t.ExportDefaultDeclaration, { type: any }>>
      ) => {
        const declaration = path.node.declaration;
        const transformedDefaultIdentifier = getUniqIdentifier(
          path,
          TRANSFORMED_DEFAULT_NAME
        );
        let transformed: t.FunctionDeclaration | null = null;

        if (t.isArrowFunctionExpression(declaration)) {
          const body = declaration.body;

          if (t.isBlockStatement(body)) {
            // export default () => {}
            transformed = t.functionDeclaration(
              transformedDefaultIdentifier,
              declaration.params,
              body
            );
          } else if (t.isExpression(body)) {
            // export default () => null
            transformed = t.functionDeclaration(
              transformedDefaultIdentifier,
              declaration.params,
              t.blockStatement([t.returnStatement(body)])
            );
          }
        }

        if (t.isFunctionDeclaration(declaration)) {
          if (!declaration.id) {
            // export default function() {}

            const body = declaration.body;

            transformed = t.functionDeclaration(
              transformedDefaultIdentifier,
              declaration.params,
              body
            );
          }
        }

        if (transformed) {
          path.replaceWith(t.exportDefaultDeclaration(transformed));
        }

        // export default Memo(Component);
        if (t.isCallExpression(declaration)) {
          // const uid = Memo(Component);
          const varDeclartion = t.variableDeclaration("const", [
            t.variableDeclarator(transformedDefaultIdentifier, declaration),
          ]);
          // export default uid;
          const exportDefaultDeclartion = t.exportDefaultDeclaration(
            transformedDefaultIdentifier
          );
          path.replaceWithMultiple([varDeclartion, exportDefaultDeclartion]);
        }
        // end
      },
    },
  };
}

function getUniqIdentifier(path: any, id: string) {
  let name = id;
  let retry = 0;
  while (path.scope.hasOwnBinding(name)) {
    if (retry >= 10) {
      throw new Error("getUniqIdentifier retry max");
    }
    name += `${id}_${retry}`;
    retry++;
  }
  return t.identifier(name);
}
