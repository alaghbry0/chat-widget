import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy'; // إضافة المكون الإضافي للنسخ

// الإعدادات البيئية
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.js',
  output: [
    // الإعدادات الحالية
    {
      file: 'dist/widget.js',
      format: 'iife',
      name: 'ChatWidget',
      sourcemap: !production
    },
    // نسخة مصغرة للإنتاج
    {
      file: 'dist/widget.min.js',
      format: 'iife',
      name: 'ChatWidget',
      plugins: [terser()],
      sourcemap: !production
    }
  ],
  plugins: [
    // المكونات الإضافية الحالية
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    postcss({
      inject: false,
      minimize: production
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      preventAssignment: true
    }),

    // إضافة مكون النسخ لنقل ملف test.html إلى مجلد dist مع تعديل مسار السكريبت
    copy({
      targets: [
        {
          src: 'test.html',
          dest: 'dist/',
          transform: (contents) => {
            // تعديل مسار السكريبت في ملف test.html
            return contents.toString()
              .replace('./dist/widget.js', './widget.js');
          }
        },
        // يمكنك إضافة ملفات أخرى هنا إذا كنت بحاجة إليها
        { src: 'public/assets/*', dest: 'dist/assets/' }
      ]
    })
  ],
  onwarn: function(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  }
};