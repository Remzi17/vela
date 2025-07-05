import gulp from 'gulp';
const { src, dest } = gulp;
import { paths } from './settings.js'
import browsersync from 'browser-sync'
import newer from 'gulp-newer'
import imagemin from 'gulp-imagemin'
import webp from 'gulp-webp'

export function images() {
	return src(paths.src.img)
		.pipe(newer(paths.build.img))
		// .pipe(
		// 	imagemin({
		// 		progressive: true,
		// 		svgoPlugins: [{
		// 			removeViewBox: false
		// 		}],
		// 		interlaced: true,
		// 		optimizationLevel: 4 // 0 to 7
		// 	})
		// )
		.pipe(webp({
			quality: 80
		}))
		.pipe(dest(paths.build.img))
		.pipe(browsersync.stream())
}
