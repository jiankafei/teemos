import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

const WATCH = process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      name: 'barypoint',
      format: 'iife',
      sourcemap: WATCH,
      strict: true,
    },
    {
      file: 'dist/index.es.js',
      name: 'barypoint',
      format: 'es',
      sourcemap: WATCH,
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
    replace({
      preventAssignment: true,
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    !WATCH && terser(),
  ],
  watch: {
    chokidar: true,
    include: 'src/**',
    exclude: 'node_modules/**',
  },
};
