import gulp from 'gulp';
const { dest } = gulp;
import { paths, source_folder } from './settings.js'
import browsersync from 'browser-sync'
import svgSprite from 'gulp-svg-sprite'
import cheerio from 'gulp-cheerio'

export function svg() {
	return gulp.src([source_folder + '/assets/icons/*.svg'])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../sprite.svg",
					example: false
				}
			},
		}))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[fill-opacity]').removeAttr('fill');
				$('[stroke-opacity]').removeAttr('stroke');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {
				xmlMode: true
			}
		}))
		.pipe(dest(paths.build.svgSprite))
		.pipe(browsersync.stream())
}
