import gulp from 'gulp';
const { src, dest, series, parallel } = gulp;
import del from 'del';
import browsersync from 'browser-sync';
import cache from 'gulp-cached';
import remember from 'gulp-remember';

import { paths, __dirname, __filename, isDeploy } from './gulp/settings.js';
import { html } from './gulp/html.js';
import { css, cssLibs } from './gulp/css.js';
import { images } from './gulp/images.js';
import { fonts, fontcss } from './gulp/fonts.js';
import { deployHtml, deployCss, deployJs } from './gulp/ftp.js';
import { svg } from './gulp/svg.js';
import { jsLibs, rollup } from './gulp/js.js';
import { temp, browserSync } from './gulp/functions.js';

function reload(done) {
	browsersync.reload();
	done();
}

function watchFiles() {
	if (isDeploy) {
		gulp.watch([paths.watch.html], series(html, deployHtml));
		gulp.watch([paths.watch.css], series(css, deployCss));
		gulp.watch([paths.watch.js], series(rollup, deployJs, reload));
	} else {
		const watcher = gulp.watch([paths.watch.html], html);

		watcher.on('change', function (event) {
			if (event.type === 'deleted') {
				delete cache.caches['html'][event.path];
				remember.forget('html', event.path);
			}
		});

		gulp.watch([paths.watch.css], css);
		gulp.watch([paths.watch.js], series(rollup, reload));
	}

	gulp.watch([paths.watch.cssLibs], cssLibs);
	gulp.watch([paths.watch.jsLibs], jsLibs);
	gulp.watch([paths.watch.icons], svg);
	gulp.watch([paths.watch.img], images);
	gulp.watch([paths.watch.fontcss], fontcss);
}

function clean() {
	return del(paths.clean);
}

const build = series(
	temp,
	clean,
	rollup,
	parallel(
		html,
		css,
		cssLibs,
		jsLibs,
		svg,
		images,
		fonts,
		fontcss,
		deployHtml,
		deployCss,
		deployJs,
	)
);

export const watch = parallel(build, watchFiles, browserSync);

export {
	html,
	css,
	cssLibs,
	rollup,
	jsLibs,
	svg,
	images,
	fontcss,
	deployHtml,
	deployCss,
	deployJs,
	build,
	watch as default,
};	
