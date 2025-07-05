import gulp from 'gulp';
const { src, dest } = gulp;
import { paths, concatLibs } from '../gulp/settings.js';
import browsersync from 'browser-sync';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import gulpif from 'gulp-if'
import * as rollupJs from 'rollup';
import { configs } from '../rollup.config.js';

export function jsLibs() {
	return src(paths.src.jsLibsFiles)
		.pipe(gulpif(concatLibs, concat('vendor.js')))
		.pipe(terser())
		.pipe(dest(paths.build.js))
		.pipe(browsersync.stream())
}

export async function rollup() {
	for (const config of configs) {
		const bundle = await rollupJs.rollup(config);
		await bundle.write(config.output);
	}
}
