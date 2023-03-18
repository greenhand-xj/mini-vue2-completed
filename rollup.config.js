import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: './src/index.js',
  output: {
    file: 'dist/vue.js',
    format: 'umd',
    name: 'Vue',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    serve({
      port: 3006,
      contentBase: '',
      openPage: './index.html',
    }),
    resolve(),
  ],
}
