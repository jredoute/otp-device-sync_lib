import typescript from '@rollup/plugin-typescript';
import nodeResolve from 'rollup-plugin-node-resolve';
import dotenv from "rollup-plugin-dotenv"


export default {
  input: 'src/index.ts',
  output: {
    dir: `dist/${process.env.NODE_ENV}`,
    format: 'cjs'
  },
  plugins: [
    dotenv(),
    typescript({
      declarationDir: `dist/${process.env.NODE_ENV}`
    }),
    nodeResolve({
      // use "jsnext:main" if possible
      // see https://github.com/rollup/rollup/wiki/jsnext:main
      jsnext: true
    })
  ]
};
