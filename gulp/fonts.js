import gulp from 'gulp';
const { src, dest } = gulp;
import { paths } from './settings.js'

export function fonts() {
	src(paths.src.fonts)
		.pipe(dest(paths.build.fonts));
};

export function fontcss() {
	src(paths.src.fontcss)
		.pipe(dest(paths.build.css));
};
