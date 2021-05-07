import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
// import { terser } from 'rollup-plugin-terser';

const dev = !!import.meta.ROLLUP_WATCH;

console.log('sourcemap', dev);

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/index.js',
      name: 'barypoint',
      format: 'iife',
      sourcemap: dev,
      strict: true,
    },
    {
      file: 'dist/index.es.js',
      name: 'barypoint',
      format: 'es',
      sourcemap: dev,
      strict: true,
    },
  ],
  plugins: [
    commonjs(),
    resolve(),
    json(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    // terser(),
  ],
  watch: {
    chokidar: true,
    include: 'index.js',
  },
};
