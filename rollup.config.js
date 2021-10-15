import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import eslint from '@rollup/plugin-eslint';
import pkg from './package.json';

const WATCH = process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      name: pkg.name,
      format: 'iife',
      sourcemap: !WATCH,
      strict: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: !WATCH,
      strict: true,
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    eslint(),
    replace({
      preventAssignment: true,
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    !WATCH && terser(),
  ],
  watch: {
    chokidar: true,
    include: 'src/**',
    exclude: 'node_modules/**',
  },
};
