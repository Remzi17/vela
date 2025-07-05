
export let replaceScripts = true;
export let isDeploy = false;
export let template = 'rem';
export let concatLibs = true;
export let isBuild = true;
export let unCSS = true;

export let variables = {
	font: 'Tenor',
	active: '#4888ff',
	gray: '#f4f4f4',
	text: '#343a3f',
	bg: '#1D2428',
	borderRadius: '8px',
	minWidth: '320',
	maxWidth: '1920',
	containerWidth: '1360',
	container: '#{$containerWidth+px}',
	firstBreakpoint: '1500',
	section_gap: 84,
	burgerMedia: 1199,
}

export let getFiles = {
	html: [
		// 'about',
		// 'account',
		// 'action',
		// 'catalog',
		// 'categories',
		// 'category',
		// 'checkout',
		// 'contact',
		// 'feedback',
		// 'news',
		// 'payment',
		// 'search', 
		// 'single-category',
		// 'single-news',
		// 'single-product',
		// 'sitemap',
		// 'vacancy',
		// 'wishlist',
		// 'text',
	],
	sass: [
		// 'about',
		// 'advantages',
		// 'banner',
		// 'brands',
		// 'card',
		// 'catalog',
		// 'category',
		// 'callback',
		// 'certificate',
		// 'company',
		// 'contact',
		// 'consultation',
		// 'discount',
		// 'document',
		// 'faq',
		// 'features',
		// 'feedback',
		// 'gallery',
		// 'info',
		// 'history',
		// 'manager',
		// 'news',
		// 'offer',
		// 'partner',
		// 'popular',
		// 'price',
		// 'problem',
		// 'product',
		// 'project',
		// 'portfolio',
		// 'questions',
		// 'step',
		// 'service',
		// 'services',
		// 'why',
		// 'vacancy',
		// 'work'
	],
	components: [
		// 'checkbox',
		// 'crumbs',
		// 'gradient',
		// 'map',
		// 'notify',
		// 'pagination',
		// 'range',
		// 'rating',
		'search',
		// 'select',
		// 'spoller',
		// 'slider',
		'sub-menu',
		// 'switch',
		// 'text',
		// 'tooltip',
		// 'video',
	],
	cssLibs: [
		// 'animate',
		// 'date',

		// 'lg',
		// 'lg-thumbnail',
		// 'lg-zoom',

		// 'lg-video',

		// 'select',
		// 'swiper',
	],
	jsLibs: [
		// 'a_jquery',
		'dynamic',
		// 'date',

		// 'lg',
		// 'lg-medium-zoom',
		// 'lg-thumbnail',
		// 'lg-zoom',

		// 'lg-video',

		// 'mask',
		// 'notify',
		// 'range',
		// 'select',
		// 'swiper',
		// 'timer',
		// 'wow',
	],
	jsScripts: [
		'burger',
		// 'fixedMenu',
		// 'form',
		// 'gallery',
		// 'map',
		// 'numbers',
		// 'popup',
		// 'rating',  
		// 'scroll',
		// 'showmore',
		// 'select',
		// 'slider',
		// 'spoller',
		'subMenu',
		// 'tab',
		// 'tooltip',
		// 'text',
		// 'video',
	]
}

import path from 'path'
import { fileURLToPath } from 'url'
export const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
export const project_folder = path.basename(path.dirname(__dirname))
export const source_folder = 'src'
export let paths = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/assets/css/",
		js: project_folder + "/assets/js/",
		img: project_folder + "/assets/img/",
		fonts: project_folder + "/assets/fonts/",
		svgSprite: project_folder + "/assets/img/",
		srcHtml: source_folder + "/assets/",
		srcCss: source_folder + "/assets/css/",
		srcJs: source_folder + "/assets/js/",
	},
	src: {
		unusedHtml: source_folder + "/**/*.html",
		htmlFiles: source_folder + "/",
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/assets/sass/style.sass",
		cssLibs: source_folder + "/assets/libs/css/",
		cssLibsFiles: source_folder + "/assets/libs/css/*.css",
		cssvariables: source_folder + "/assets/sass/all/_variables.sass",
		sass: source_folder + "/assets/sass/",
		sassComponents: source_folder + "/assets/sass/components/",
		js: source_folder + "/assets/js/*.js",
		worker: source_folder + "/worker.js",
		jsComponents: source_folder + "/assets/js/components/",
		mainJs: source_folder + "/assets/js/script.js",
		jsLibs: source_folder + "/assets/libs/js/",
		jsLibsFiles: source_folder + "/assets/libs/js/*.js",
		img: [source_folder + "/assets/img/**/*.{jpg,jpeg,png,svg,gif,json,ico,webp,mp4,mp3,m4a,pdf}", "!" + source_folder + "/assets/img/resize/**/*.*"],
		imgResize: source_folder + "/assets/img/resize/",
		fonts: source_folder + "/assets/fonts/*.{woff,woff2}",
		fontcss: source_folder + "/assets/css/fonts.css",
		fontsDir: source_folder + "/assets/fonts/",
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/assets/sass/**/*",
		cssLibs: source_folder + "/assets/libs/css/*.css",
		js: source_folder + "/assets/js/**/*.js",
		jsLibs: source_folder + "/assets/libs/js/*.js",
		img: source_folder + "/assets/img/**/*.{jpg,jpeg,png,svg,gif,json,ico,webp,mp4,mp3,m4a,pdf}",
		fonts: source_folder + "/assets/fonts/*.{woff,woff2}",
		fontcss: source_folder + "/assets/css/fonts.css",
		icons: source_folder + "/assets/icons/*.svg",
	},
	clean: "./" + project_folder + "/"
}

if (project_folder == 'template') {
	replaceScripts = false
}





