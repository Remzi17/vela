
import './scripts/init.js';
import './components.js';
import { windowWidth } from './scripts/core/variables.js';
import { closeOutClick } from './scripts/core/helpers.js';
import { fadeIn } from './scripts/other/animation.js';

//
//
//
//
// Общие скрипты


// Каталог 
const catalog = document.querySelector('.catalog');
const catalogButton = document.querySelector('.header__catalog-button');
const catalogButtonMobile = document.querySelector('.catalog__button-mobile');

const catalogTabs = document.querySelector('.catalog__tabs');
const mobileTabs = catalogTabs.querySelectorAll('.catalog__tab');

const catalogHeader = document.querySelector('.catalog__header');
const headerButtons = catalogHeader.querySelectorAll('.catalog__button');

if (catalogButton) {
	catalogButton.addEventListener('click', () => {
		if (windowWidth > 991) {
			catalogButton.classList.toggle('active');
			catalog.classList.toggle('active');

			catalog.querySelectorAll('.catalog__button')[1].classList.add('active')
		} else {
			catalog.querySelectorAll('.catalog__button')[1].classList.remove('active')
		}
	});

	closeOutClick('.catalog', '.header__catalog-button', 'active');
}

if (catalogButtonMobile && catalogTabs && catalogHeader) {
	catalogButtonMobile.addEventListener('click', () => {
		if (catalogButtonMobile.textContent === 'Каталог') {
			catalogButtonMobile.classList.toggle('active');
			catalogTabs.classList.toggle('active', catalogButtonMobile.classList.contains('active'));
		} else {
			catalogButtonMobile.textContent = 'Каталог';
			mobileTabs.forEach(tab => tab.classList.remove('active'));
		}
		headerButtons.forEach(button => button.classList.remove('active'));
	});

	headerButtons.forEach(button => {
		button.addEventListener('click', () => {
			catalogButtonMobile.textContent = button.textContent;
		});
	});
}
