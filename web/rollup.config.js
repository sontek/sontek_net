import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import { default as importHTTP } from "import-http/rollup";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy-watch";
import filesize from "rollup-plugin-filesize";
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';


const assets = ["index", "resume"];

export default assets.map((name, index) => {
  let config;
  const production = process.env.NODE_ENV === "production";
  let devSettings = {
      'watch': {
        'exclude': ["node_modules/**"],
      },
  };
  config = {
    input: `app/js/${name}.js`,
    output: {
      dir: "dist/js/",
      format: "esm",
      sourcemap: production ? true : "inline",
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      resolve({
        browser: true,
        dedupe: ["preact"],
        extensions: [".js", ".jsx"],
      }),
      importHTTP(),
      production && postcss({
        extract: `app/css/${name}.css`,
        minimize: { preset: "default" },
      }),
      !production && postcss({
        extract: `app/css/${name}.css`,
      }),
      babel({
        exclude: "node_modules/**",
        babelHelpers: 'runtime',
      }),
      commonjs({
        include: ['node_modules/**']
      }),
      production && compiler(),
      production && terser(),
      copy({
        watch: production ? null : "app/public/**/*",
        targets: [
          { src: 'app/public/**/*', dest: 'dist' },
        ]
      }),
      filesize(),
      !production && devSettings, 
    ],
  };
  return config;
});

