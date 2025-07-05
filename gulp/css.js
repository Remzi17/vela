import gulp from 'gulp';
const { src, dest } = gulp;
import { paths, isBuild, unCSS } from './settings.js'
import notify from 'gulp-notify'
import { concatLibs } from './settings.js';
import concat from 'gulp-concat'
import newer from 'gulp-newer'
import browsersync from 'browser-sync'
import gulpif from 'gulp-if'
import autoprefixer from 'gulp-autoprefixer'
import group_media from 'gulp-group-css-media-queries'
import uncss from 'gulp-uncss'
import beautify from 'gulp-beautify'
import cssnano from 'gulp-cssnano'
import csso from 'gulp-csso'
import gulpSass from 'gulp-sass'
import * as sassCompiler from 'sass'
const sass = gulpSass(sassCompiler)


function translateError(msg) {
	const translations = [
		['Declarations may only be used within style rules', 'Объявления допустимы только внутри CSS-правил'],
		['Expected identifier', 'Ожидался идентификатор'],
		['Invalid CSS after', 'Неверный CSS после'],
		['Undefined mixin', 'Неопределённый миксин'],
		['argument(s)? required', 'требуется аргумент(ы)'],
		['Invalid property name', 'Неверное имя свойства'],
		['Unterminated string', 'Незавершённая строка'],
		['Invalid media query', 'Неверный медиазапрос'],
	]

	let translated = msg

	for (const [eng, rus] of translations) {
		const regex = new RegExp(eng, 'i')
		if (regex.test(translated)) {
			translated = translated.replace(regex, rus)
			break
		}
	}

	return translated
}

export function handleError(taskName) {
	return function (err) {
		const original = err.messageOriginal || err.message || 'Неизвестная ошибка'
		const short = original.split('\n')[0]
		const translated = translateError(short)
		const file = err.relativePath || err.file || 'Неизвестный файл'
		const line = err.line || '?'

		notify({
			title: `\n${taskName} ошибка`,
			message: `\n\n ${translated}\n${file.split('src/assets/')[1]} : ${line} \n\n\n\n`,
			sound: false
		}).write(err)

		this.emit('end')
	}
}

export function css() {
	return src(paths.src.css)
		.pipe(newer(paths.build.css))
		.pipe(sass().on('error', handleError('SASS')))
		// .pipe(plumber(notify.onError({
		// 	title: 'SCSS',
		// 	message: 'Error: <%= error.message %>'
		// })))
		.pipe(sass({
			outputStyle: 'expanded'
		}))
		.pipe(gulpif(isBuild, group_media()))
		.pipe(gulpif(isBuild, autoprefixer({
			overrideBrowserslist: [
				'ff >= 120',
				'chrome >= 120',
				'ios >= 14'
			],
			cascade: false
		})))
		.pipe(gulpif(isBuild, csso({
			restructure: false,
			forceMediaMerge: false,
			comments: false,
			usage: {
				keyframes: false
			}
		})))
		.pipe(gulpif(isBuild, beautify.css({
			indent_size: 2
		})))
		.pipe(gulpif(unCSS, uncss({
			html: [paths.src.unusedHtml],
			ignore: [
				/.*section.*/,
				/.*menu.*/,
				/.*header__.*/,
				/.*select.*/,
				/.*rotate.*/,
				/.*active.*/,
				/.*hide.*/,
				/.*show.*/,
				/.*animated.*/,
				/.*fade.*/,
				/.*[data].*/,
				/.*loaded.*/,
				/.*error.*/,
				/.*fixed.*/,
				'.header-fixed_fixed',
				'.loaded',
				'.show',
				'.hide',
				'input',
				'textarea',
				'[hidden]',
				'body.no-scroll',
				'.swiper-container',
				'.swiper-wrapper',
				'.swiper-slide',
				'.swiper-pagination',
				'.swiper-initialized',
				'.swiper-pagination-bullet',
				'.swiper-pagination-bullet-active',
				'.swiper-horizontal'
			]
		})))
		.pipe(dest(paths.build.srcCss))
		.pipe(dest(paths.build.css))
		.pipe(browsersync.stream())
}

export function cssLibs() {
	return src(paths.src.cssLibsFiles)
		.pipe(gulpif(concatLibs, concat('vendor.css')))
		.pipe(gulpif(isBuild, csso({
			restructure: false,
			forceMediaMerge: false,
			comments: false,
			usage: {
				keyframes: false
			}
		})))
		.pipe(dest(paths.build.css))
		.pipe(gulpif(unCSS, uncss({
			html: [paths.src.unusedHtml],
			ignore: [
				/.*lg.*/,
				'.swiper',
				'.swiper-wrapper',
				'.swiper-slide',
				'.swiper-pagination',
				'.swiper-initialized',
				'.swiper-pagination-bullet',
				'.swiper-pagination-bullet-active',
				'.swiper-horizontal',
				'.fadeInUp',
				'.fadeInLeft',
				'.fadeInRight',
				'.fadeInDown',
				'.animated',
			]
		})))
		.pipe(dest(paths.build.css))
		.pipe(browsersync.stream())
}
