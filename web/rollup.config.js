import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import { default as importHTTP } from "import-http/rollup";
import babel from "rollup-plugin-babel";
import copy from "rollup-plugin-copy-watch";


const assets = ["index"];

export default assets.map((name, index) => {
  let config;
  /* PROD CONFIG */
  if (process.env.NODE_ENV === "production") {
    config = {
      input: `app/js/${name}.js`,
      output: {
        dir: "dist",
        format: "esm",
        sourcemap: true,
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
        copy({
          watch: 'app/public/**/*',
          targets: [
            { src: 'app/public/**/*', dest: 'dist' },
          ]
        }),
      ],
    };
  } else {
    /* DEV CONFIG */
    config = {
      input: `app/js/${name}.js`,
      output: {
        dir: "dist",
        format: "esm",
        sourcemap: "inline",
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
        copy({
          watch: 'app/public/**/*',
          targets: [
            { src: 'app/public/**/*', dest: 'dist' },
          ]
        }),
      ],
      watch: {
        exclude: ["node_modules/**"],
      },
    };
  }
  return config;
});

