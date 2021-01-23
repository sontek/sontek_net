import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import { default as importHTTP } from "import-http/rollup";
import babel from "rollup-plugin-babel";
import html from "@web/rollup-plugin-html";

const assets = ["index"];

export default assets.map((name, index) => {
  let config;
  /* PROD CONFIG */
  if (process.env.NODE_ENV === "production") {
    config = {
      input: `app/js/${name}`.js,
      output: {
        dir: "dist",
        format: "esm",
        sourcemap: true,
        entryFileNames: "[name].[hash].js",
        chunkFileNames: "[name].[hash].js",
      },
      plugins: [
        resolve(),
        importHTTP(),
        postcss({
          extract: `app/css/${name}.css`,
          minimize: { preset: "default" },
        }),
        babel({
          exclude: "node_modules/**",
          presets: [["@babel/env", { modules: false }]],
        }),
        compiler(),
        terser(),
        html({ input: `app/${name}.html` }),
      ],
    };
  } else {
  /* DEV CONFIG */
    config = {
      input: `app/js/${name}`.js,
      output: {
        dir: "dist",
        format: "esm",
        sourcemap: "inline",
        entryFileNames: "[name].[hash].js",
        chunkFileNames: "[name].[hash].js",
      },
      plugins: [
        resolve(),
        importHTTP(),
        postcss({
          extract: `app/css/${name}.css`,
        }),
        babel({
          exclude: "node_modules/**",
          presets: [
            [
              "@babel/env",
              {
                targets: { esmodules: true },
                bugfixes: true,
              },
            ],
          ],
        }),
        html({ input: `app/${name}.html` }),
      ],
      watch: {
        exclude: ["node_modules/**"],
      },
    };
  }
  return config;
});

