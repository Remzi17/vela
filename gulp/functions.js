import gulp from 'gulp';
const { src, dest } = gulp;
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import resize from 'gulp-image-resize'
import rename from 'gulp-rename'
import path from 'path'
import fs from 'fs'
import { paths, source_folder, project_folder, variables, concatLibs } from './settings.js'
import realFavicon from 'gulp-real-favicon'
import browsersync from 'browser-sync'
import { globSync } from 'glob'

// 
// 
// 
// 
// browserSync

export function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}

// 
// 
// 
// 
// Обрезка изображений

export const resizeSettings = yargs(hideBin(process.argv))
	.option('mobile', {
		alias: 'm',
		type: 'boolean',
		default: false,
	})
	.option('percentage', {
		alias: 'p',
		type: 'number',
		default: null,
	})
	.option('width', {
		alias: 'w',
		type: 'number',
		default: null,
	})
	.option('folder', {
		alias: 'f',
		type: 'string',
		default: '',
	})
	.argv

const basePath = resizeSettings.folder ? `src/assets/img/${resizeSettings.folder}` : 'src/assets/img/resize'
const outputPath = resizeSettings._[1] ? `src/assets/img/${resizeSettings._[1]}` : basePath

const resizeImg = () => {
	const resizeOptions = {
		cover: true,
		crop: false,
		upscale: true
	}

	if (resizeSettings.percentage) {
		resizeOptions.percentage = resizeSettings.percentage
	} else if (resizeSettings.width) {
		resizeOptions.width = resizeSettings.width
	} else {
		resizeOptions.width = 1000
	}

	return gulp.src(`${basePath}/**/*.{jpg,jpeg,png}`)
		.pipe(gulp.dest(resizeSettings.mobile ? basePath : `${basePath}/old`))
		.pipe(resize(resizeOptions))
		.pipe(rename(function (path) {
			if (resizeSettings.mobile) {
				path.basename += '_mobile'
			}
		}))
		.pipe(gulp.dest(outputPath))
}

gulp.task('resize', resizeImg)


// 
// 
// 
// 
// Фавикон

const favicon = () => {
	realFavicon.generateFavicon({
		masterPicture: 'src/assets/img/favicon.svg',
		dest: 'src/assets/img/favicon',
		iconsPath: '/assets/img/favicon/',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {
				design: 'raw'
			},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'silhouette',
				themeColor: '#5bbad5'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: 'faviconData.json'
	}, function () { });
}

gulp.task('favicon', favicon)


// 
// 
// 
// 
// Бэкап

export function temp() {
	if (project_folder != 'template') {
		let date = new Date;

		let currentDate =
			(date.getDate() < 10 ? '0' : '') + date.getDate() + '-' +
			((date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)) + ' ' +
			(date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
			(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()

		return src(source_folder + '/**/**')
			.pipe(dest('temp/' + currentDate));
	} else {
		return src(source_folder + '/**/**')
	}
}


// 
// 
// 
// 
// Шрифты 

const fonts = () => {
	return new Promise((resolve, reject) => {
		fs.writeFile(paths.src.fontcss, '', (err) => {
			if (err) reject(err)

			fs.readdir(paths.src.fontsDir, (err, items) => {
				if (err) reject(err)

				let tasks = items.map(item => {
					return new Promise((res, rej) => {
						let fontname = item.split('.')[0]
						let fontStyle = fontname.split('-')[1]
						let weight

						switch (fontStyle) {
							case 'Thin': weight = 100; break
							case 'ExtraLight': weight = 200; break
							case 'Light': weight = 300; break
							case 'Regular': weight = 400; break
							case 'Medium': weight = 500; break
							case 'SemiBold': weight = 600; break
							case 'Bold': weight = 700; break
							case 'ExtraBold': weight = 800; break
							case 'Black': weight = 900; break
							default: weight = 400; break
						}

						const fontFace =
							`
@font-face {
	font-family: "${fontname.split('-')[0]}";
	src: url(../fonts/${fontname}.woff2);
	font-weight: ${weight};
	font-style: normal;
	font-display: block;
}  
`

						fs.appendFile(paths.src.fontcss, fontFace, (err) => {
							if (err) rej(err)
							else res()
						})
					})
				})

				Promise.all(tasks).then(resolve).catch(reject)
			})
		})
	})
}

gulp.task('fonts', fonts)


// 
// 
// 
// 
// Создание файлов

import { getFiles, replaceScripts } from './settings.js';

const create = () => {
	// Создание html файлов
	let htmlFiles = getFiles.html.sort();

	for (let i = 0; i < htmlFiles.length; i++) {
		// Если файл ранее не создан, то создать
		if (!fs.existsSync(paths.src.htmlFiles + htmlFiles[i] + '.html') && htmlFiles[i]) {

			// Создать    
			fs.open(paths.src.htmlFiles + htmlFiles[i] + '.html', 'w', (err) => {
				if (err) throw err;
			});

			// Добавление содержимого в файл 
			fs.appendFile(paths.src.htmlFiles + htmlFiles[i] + '.html', `@@include('assets/html/head.html', {\n` + "\"class\" : '\" \"'\n})" + `\n@@include("assets/html/crumbs.html", {\n"list": [\n{\n"title":"Контакты",\n"link":'"#"'\n},\n]\n})` + ` \n\n\n\n@@include('assets/html/foot.html')`, (err) => {
				if (err) throw err;
			});
		}
	}

	// sass файлы
	fs.writeFile(paths.src.css, '', cb);

	fs.readdir(paths.src.sass, function (err, items) {
		let files = getFiles.sass.sort();
		let components = getFiles.components.sort();

		// Добавление в sass файл импортов 
		fs.appendFile(paths.src.css, `@use'sass:math'\n@use 'sass:color'\n\n@import "all/_variables"\n@import "all/_mixins"\n@import "all/_default"\n\n`, cb);

		// Добавление в sass файл стандартных импортов 
		fs.appendFile(paths.src.css, `@import "components/_burger"\n\n@import "_interface"\n@import "_form"\n@import "_popup"\n\n@import "_header"\n@import "_footer"\n\n`, cb);


		// Добавление в sass файл импортов компонентов
		let createFiles = false
		let currentSassFile;

		for (let i = 0; i < components.length; i++) {
			let fileName = components[i].split('.');
			fileName = fileName[0];

			fs.appendFile(paths.src.css,
				`@import "components/_` + fileName + `" \n`, cb);

			if (i == components.length - 1) {
				createFiles = true
			}
		}

		// Удаление неиспользуемых sass компонентов
		if (replaceScripts) {
			fs.readdir(paths.src.sassComponents, (err, files) => {
				files.forEach(file => {
					currentSassFile = file.split('.')[0].split('_')[1];
					let removeSassFile = true;

					for (let index = 0; index < components.length; index++) {
						if (currentSassFile == components[index]) {
							removeSassFile = false;
							break
						} else {
							removeSassFile = true;
						}
					}

					// Если не совпадают, то удалить этот файл
					if (removeSassFile && currentSassFile != 'burger') {
						fs.unlink(paths.src.sassComponents + file, cb);
					}
				});
			})
		}

		// Создание файлов
		for (let i = 0; i < items.length; i++) {
			// Если файл ранее не создан, то создать
			if (!fs.existsSync(paths.src.sass + '_' + files[i] + '.sass') && files[i]) {

				// Создать 
				fs.open(paths.src.sass + '_' + files[i] + '.sass', 'w', (err) => {
					if (err) throw err;
				});

				// Добавление содержимого в файл
				fs.appendFile(paths.src.sass + '_' + files[i] + '.sass', `//.` + files[i] + `\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`, (err) => {
					if (err) throw err;
				});
			}
		}

		// Добавление импортов
		if (createFiles) {
			for (let i = 0; i < files.length; i++) {
				let fileName = files[i].split('.');
				fileName = fileName[0];

				if (fileName == 'style' || fileName == 'fonts' || fileName == 'all' || fileName == 'components') {
					continue
				} else {
					fs.appendFile(paths.src.css,
						`@import "_` + fileName + `" \n`, cb);
				}
			}
		}

	})

	// js скрипты

	if (replaceScripts) {
		let componentsFile = source_folder + "/assets/js/components.js";

		fs.writeFile(componentsFile, '', cb);
		let jsScripts = getFiles.jsScripts;

		for (let i = 0; i < jsScripts.length; i++) {
			let jsFileName = jsScripts[i].split('.');
			jsFileName = jsFileName[0];

			fs.appendFile(componentsFile, `import { ` + jsFileName + ` } from './components/` + jsFileName + `';\n`, cb)

			i == jsScripts.length - 1 ? fs.appendFile(componentsFile, '\n', cb) : ''
		}

		for (let i = 0; i < jsScripts.length; i++) {
			let jsFileName = jsScripts[i].split('.');
			jsFileName = jsFileName[0];

			fs.appendFile(componentsFile, `${jsFileName}();\n`, cb)
		}

		// // Удаление неиспользуемых js компонентов
		// if (replaceScripts) {
		// 	fs.readdir(paths.src.jsComponents, (err, files) => {
		// 		files.forEach(file => {
		// 			currentJsFile = file.split('.')[0];
		// 			removeJsFile = true;

		// 			for (let index = 0; index < jsScripts.length; index++) {
		// 				if (currentJsFile == jsScripts[index]) {
		// 					removeJsFile = false;
		// 					break
		// 				} else {
		// 					removeJsFile = true;
		// 				}
		// 			}

		// 			// Если не совпадают, то удалить этот файл
		// 			if (removeJsFile && currentJsFile != 'variable') {
		// 				fs.unlink(paths.src.jsComponents + file, cb);
		// 			}
		// 		});
		// 	})
		// }
	}

	// js библиотеки
	fs.readdir(paths.src.jsLibs, function (err, items) {
		let jsLibs = getFiles.jsLibs.sort();
		let currentJsFile, removeJsLibs;

		// Перебор файлов из папки libs/js
		for (let i = 0; i < items.length; i++) {
			currentJsFile = items[i].split('.')[0];

			removeJsLibs = true;

			// Перебор файлов из переменной getFiles.jsLibs
			for (let index = 0; index < jsLibs.length; index++) {
				if (currentJsFile == jsLibs[index]) {
					removeJsLibs = false;
					break
				} else {
					removeJsLibs = true;
				}
			}

			// Если не совпадают, то удалить этот файл
			if (removeJsLibs) {
				fs.unlink(paths.src.jsLibs + items[i], cb);
			}

		}
	})

	// css библиотеки
	fs.readdir(paths.src.cssLibs, function (err, items) {
		let cssLibs = getFiles.cssLibs.sort();
		let currentCssFile, removeCssLibs;

		// Перебор файлов из папки libs/css
		for (let i = 0; i < items.length; i++) {
			currentCssFile = items[i].split('.')[0];

			removeCssLibs = true;

			// Перебор файлов из переменной getFiles.cssLibs
			for (let index = 0; index < cssLibs.length; index++) {
				if (currentCssFile == cssLibs[index]) {
					removeCssLibs = false;
					break
				} else {
					removeCssLibs = true;
				}
			}

			// Если не совпадают, то удалить этот файл
			if (removeCssLibs) {
				fs.unlink(paths.src.cssLibs + items[i], cb);
			}

		}
	})

	// css переменные
	fs.writeFile(paths.src.cssvariables, '', cb);

	fs.appendFile(paths.src.cssvariables, `$active: ` + variables.active + `\n$gray: ` + variables.gray + `\n$text: ` + variables.text + `\n$bg: ` + variables.bg + `\n$border-radius: ` + variables.borderRadius + `\n\n$minWidth: ` + variables.minWidth + `\n$maxWidth: ` + variables.maxWidth + `\n$containerWidth: ` + variables.containerWidth + `\n$container: ` + variables.container + `\n$firstBreakpoint: ` + variables.firstBreakpoint + `\n$section_gap: ` + variables.section_gap + ` \n$burgerMedia: ` + variables.burgerMedia + `\n\n$font: '` + variables.font + `'`, cb)


	if (!concatLibs) {
		// css 
		const cssFiles = globSync(paths.src.jsLibsFiles)
		const styles = cssFiles.map(file => {
			const cssFileName = path.basename(file)
			return `	<link rel="preload" href="assets/css/${cssFileName}" as="style" onload="this.rel='stylesheet'; this.media='all'; this.onload=null;">`
		}).join('\n')

		const headPath = 'src/assets/html/head.html'
		let headContent = fs.readFileSync(headPath, 'utf8')

		headContent = headContent.replace(
			/<link rel="preload" href="assets\/css\/vendor.css" as="style" onload="this.rel = 'stylesheet'; this.media = 'all'; this.onload = null; ">/g,
			styles
		)

		fs.writeFileSync(headPath, headContent)

		// js 
		const jsFiles = globSync(paths.src.jsLibsFiles)
		const scripts = jsFiles.map(file => {
			const fileName = path.basename(file)
			return `<script src="assets/js/${fileName}" defer></script>`
		}).join('\n')

		const footPath = 'src/assets/html/foot.html'
		let footContent = fs.readFileSync(footPath, 'utf8')

		footContent = footContent.replace(
			/<script src="assets\/js\/vendor\.js" defer><\/script>/g,
			scripts
		)

		fs.writeFileSync(footPath, footContent)
	}

}

gulp.task('create', create)

// 
// 
// 
// 
// Создание карты сайта 

function sitemap(cb) {
	const pageTitles = {
		'index': 'Главная',
		'about': 'О нас',
		'blog': 'Блог',
		'brands': 'Бренды',
		'catalog': 'Каталог',
		'category': 'Категории',
		'compare': 'Сравнение',
		'contact': 'Контакты',
		'faq': 'Вопрос-ответ',
		'feedback': 'Отзывы',
		'news': 'Новости',
		'production': 'Продукция',
		'services': 'Услуги',
		'single-category': 'Категория',
		'single-product': 'Товар',
		'single-services': 'Услуга',
		'single-news': 'Статья',
		'text': 'Текстовая',
		'vacancy': 'Вакансии',
		'video': 'Видео',
		'wishlist': 'Избранное'
	};

	const htmlFiles = fs.readdirSync(paths.src.htmlFiles)
		.filter(file => file.endsWith('.html') && file !== 'sitemap.html')
		.map(file => {
			const name = path.basename(file, '.html');
			return {
				file: file,
				name: name,
				title: pageTitles[name] || name,
				path: file === 'index.html' ? `/${project_folder}` : file
			};
		})
		.sort((a, b) => a.title.localeCompare(b.title, 'ru'));

	const links = htmlFiles.map(page =>
		`<li><a target="_blank" href="${page.path}">${page.title}</a></li>`
	).join('\n\t\t\t\t');

	const sitemapContent = `
@@include('assets/html/head.html', {
	"class": '""'
})
@@include("assets/html/crumbs.html", {
	"list": [
		{
			"title": "Карта сайта",
			"link": "'#'"
		}
	]
})

<!-- Карта сайта -->
<div class="section">
	<div class="container">
		<div class="text-block">
			<ul>
				${links}
				<li><a data-modal="popup-call">Заказать звонок</a></li>
				<li><a data-modal="popup-thank">Спасибо</a></li>
			</ul>
		</div>
	</div>
</div>

@@include('assets/html/foot.html')
`;

	const sitemapPath = path.join('src', 'sitemap.html');

	fs.writeFile(sitemapPath, sitemapContent.trim(), (err) => {
		if (err) return cb(err);

		console.log('\n\n Карта сайта создана \n\n\n');

		cb();
	});
}

gulp.task('sitemap', sitemap);

function cb() { }

export { resizeImg, favicon, fonts, create, sitemap }

