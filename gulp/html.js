import gulp from 'gulp'
const { src, dest } = gulp
import path from 'path'
import fs from 'fs'
import { paths, isBuild } from './settings.js'
import fileinclude from 'gulp-file-include'
import cache from 'gulp-cached';
import resize from 'gulp-image-resize'
import through from 'through2'
import rename from 'gulp-rename'
import notify from 'gulp-notify'
import replace from 'gulp-replace'
import gulpif from 'gulp-if'
import beautify from 'gulp-beautify'
import remember from 'gulp-remember'
import browsersync from 'browser-sync'


// Функция для создания мобильной версии изображения
function createMobileVersion(originalPath, width = 575) {
	const ext = path.extname(originalPath);
	const dir = path.dirname(originalPath);
	const base = path.basename(originalPath, ext);
	const mobilePath = path.join(dir, `${base}_mobile${ext}`);

	if (!fs.existsSync(mobilePath)) {
		return src(originalPath)
			.pipe(resize({ width: width }))
			.pipe(rename(`${base}_mobile${ext}`))
			.pipe(dest(dir));
	}
	return Promise.resolve();
}

export function html() {
	return src(paths.src.html)
		.pipe(fileinclude())
		.pipe(cache('html'))
		.pipe(notify("Found file: <%= file.relative %>!"))
		.pipe(through.obj(function (file, enc, cb) {
			if (file._processed) {
				return cb(null, file);
			}
			file._processed = true;

			let content = file.contents.toString();
			const imgMatches = content.matchAll(/<img src="([^"]+\.(?:webp|png|jpg|jpeg))"([^>]*?)\s+pic(?:\s*=\s*"?(\d+)"?)?[^>]*>/g);
			const processQueue = [];

			for (const match of imgMatches) {
				const imgSrc = match[1];
				const attrs = match[2];
				const picValue = match[3]; // Значение из атрибута pic
				const mobileWidth = picValue ? parseInt(picValue) : 500;

				const extFromHTML = path.extname(imgSrc).toLowerCase();
				const baseName = path.basename(imgSrc, extFromHTML);
				const dirName = path.dirname(imgSrc);

				const searchDir = path.join('src', dirName);
				const availableExts = ['.jpg', '.jpeg', '.png'];

				let foundPath = null;

				for (const ext of availableExts) {
					const fullPath = path.join(searchDir, baseName + ext);
					if (fs.existsSync(fullPath)) {
						foundPath = fullPath;
						break;
					}
				}

				if (foundPath) {
					const originalExt = path.extname(foundPath);
					const mobilePath = path.join(searchDir, `${baseName}_mobile${originalExt}`);

					if (!fs.existsSync(mobilePath)) {
						processQueue.push(createMobileVersion(foundPath, mobileWidth));
					}
				}
			}

			Promise.all(processQueue)
				.then(() => {
					content = content.replace(
						/<img src="([^"]+\.(?:webp|png|jpg|jpeg))"([^>]*?)\s+pic(?:\s*=\s*"?(\d+)"?)?[^>]*>/g,
						(match, imgSrc, attrs, picValue) => {
							const mobileWidth = picValue ? parseInt(picValue) : 575;
							const classMatch = attrs.match(/class="([^"]*)"/);
							const widthMatch = attrs.match(/width="(\d+)"/);
							const heightMatch = attrs.match(/height="(\d+)"/);
							const altMatch = attrs.match(/alt="([^"]*)"/);
							const loadingMatch = attrs.match(/loading="([^"]*)"/);
							const decodingMatch = attrs.match(/decoding="([^"]*)"/);

							const cleanAttrs = attrs
								.replace(/\s*pic\s*=\s*"?\d+"?\s*/, '')
								.replace(/\s*width="\d+"\s*/, '')
								.replace(/\s*height="\d+"\s*/, '')
								.replace(/\s*alt="[^"]*"\s*/, '')
								.replace(/\s*loading="[^"]*"\s*/, '')
								.replace(/\s*decoding="[^"]*"\s*/, '')
								.replace(/\s*class="[^"]*"\s*/, '')
								.trim();

							return `
								<picture${classMatch && classMatch[1] ? ` class="${classMatch[1]}"` : ''}>
									<source srcset="${imgSrc.replace(/(\.\w+)$/, '_mobile$1')}" media="(max-width: 575px)">
									<img src="${imgSrc}"
										${cleanAttrs ? ' ' + cleanAttrs : ''}
										${widthMatch && widthMatch[1] ? ` width="${widthMatch[1]}"` : ''}
										${heightMatch && heightMatch[1] ? ` height="${heightMatch[1]}"` : ''} 
										alt="${altMatch ? altMatch[1] : ''}"
										${loadingMatch ? ` loading="${loadingMatch[1]}"` : ' loading="lazy"'}
										${decodingMatch ? ` decoding="${decodingMatch[1]}"` : ' decoding="async"'}>
								</picture>
							`;
						}
					);

					file.contents = Buffer.from(content);
					cb(null, file);
				})
				.catch(err => cb(err));
		}))
		.pipe(gulpif(isBuild,
			beautify.html({
				indent_size: 2,
				max_preserve_newlines: 1,
			})
		))
		.pipe(remember('html'))
		.pipe(dest(paths.build.html))
		.pipe(browsersync.stream());
}

// export function worker() {
// 	return src(paths.src.worker)
// 		.pipe(dest(paths.build.html))
// }

// export function swVersion() {
// 	const version = 'v' + Date.now();
// 	return src(paths.src.worker)
// 		.pipe(replace(/const CACHE_VERSION = '.*?';/, `const CACHE_VERSION = '${version}';`))
// 		.pipe(dest(paths.build.html));
// }

