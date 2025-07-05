import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import { project_folder } from './gulp/settings.js';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';


const isBuild = process.env.BUILD === 'true';

const baseConfig = (input, outputFile) => ({
	input: input,
	output: {
		file: path.resolve(project_folder, outputFile),
		format: 'iife',
		sourcemap: true,
	},
	plugins: [
		nodeResolve(),
		commonjs(),
		isBuild && terser({
			keep_fnames: /waitForTilesLoad|getTileContainer/
		}),
		dynamicImportVars(),
	],

	// treeshake: {
	// 	moduleSideEffects: false,
	// },
});

export const configs = [
	baseConfig('src/assets/js/script.js', 'assets/js/script.js'),
];
