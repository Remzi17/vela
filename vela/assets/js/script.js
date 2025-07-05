(function () {
	'use strict';

	// 
	// 
	// 
	// 
	// Переменные
	const body = document.querySelector('body');
	const html = document.querySelector('html');
	const popup = document.querySelectorAll('.popup');

	const headerTop = document.querySelector('.header') ? document.querySelector('.header') : document.querySelector('head');
	const headerTopFixed = 'header_fixed';
	let fixedElements = document.querySelectorAll('[data-fixed]');
	let stickyObservers = new Map();

	const menuClass = '.header__mobile';
	const menu = document.querySelector(menuClass) ? document.querySelector(menuClass) : document.querySelector('head');
	const menuLink = document.querySelector('.header__catalog-button') ? document.querySelector('.header__catalog-button') : document.querySelector('head');

	const menuActive = 'active';

	const burgerMedia = 991;
	const bodyOpenModalClass = 'popup-show';

	let windowWidth = window.innerWidth;
	document.querySelector('.container')?.offsetWidth || 0;

	const checkWindowWidth = () => {
		windowWidth = window.innerWidth;
		document.querySelector('.container')?.offsetWidth || 0;
	};

	// Задержка при вызове функции
	function throttle(fn, delay) {
		let timer;
		return () => {
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(this, arguments), delay);
		};
	}

	// Закрытие элемента при клике вне него
	function closeOutClick(closedElement, clickedButton, clickedButtonActiveClass, callback) {
		document.addEventListener('click', (e) => {
			const button = document.querySelector(clickedButton);
			const element = document.querySelector(closedElement);
			const withinBoundaries = e.composedPath().includes(element);

			if (!withinBoundaries && button?.classList.contains(clickedButtonActiveClass) && e.target !== button) {
				element.classList.remove('active');
				button.classList.remove(clickedButtonActiveClass);
			}
		});
	}

	// Плавный скролл
	function scrollToSmoothly(pos, time = 400) {
		const currentPos = window.pageYOffset;
		let start = null;
		window.requestAnimationFrame(function step(currentTime) {
			start = !start ? currentTime : start;
			const progress = currentTime - start;
			if (currentPos < pos) {
				window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos);
			} else {
				window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time));
			}
			if (progress < time) {
				window.requestAnimationFrame(step);
			} else {
				window.scrollTo(0, pos);
			}
		});
	}

	window.addEventListener('resize', throttle(checkWindowWidth, 100));


	//
	//
	//
	//
	// Позиционирование

	// Отступ элемента от краев страницы
	function offset(el) {
		var rect = el.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		return {
			top: rect.top + scrollTop,
			left: rect.left + scrollLeft,
			right: windowWidth - rect.width - (rect.left + scrollLeft),
		}
	}

	// 
	// 
	// 
	// 
	// Массивы

	// Индекс элемента
	function indexInParent(node) {
		var children = node.parentNode.childNodes;
		var num = 0;
		for (var i = 0; i < children.length; i++) {
			if (children[i] == node) return num;
			if (children[i].nodeType == 1) num++;
		}
		return -1;
	}

	// Уникализация массива
	function uniqArray(array) {
		return array.filter(function (item, index, self) {
			return self.indexOf(item) === index;
		});
	}


	// Добавление элементу обертки
	let wrap = (query, tag, wrapContent = false) => {
		let elements;

		let tagName = tag.split('.')[0] || 'div';
		let tagClass = tag.split('.').slice(1);
		tagClass = tagClass.length > 0 ? tagClass : [];

		{
			elements = document.querySelectorAll(query);
		}

		function createWrapElement(item) {
			let newElement = document.createElement(tagName);
			if (tagClass.length) {
				newElement.classList.add(...tagClass);
			}

			if (wrapContent) {
				while (item.firstChild) {
					newElement.appendChild(item.firstChild);
				}
				item.appendChild(newElement);
			} else {
				item.parentElement.insertBefore(newElement, item);
				newElement.appendChild(item);
			}
		}

		if (elements.length) {
			for (let i = 0; i < elements.length; i++) {
				createWrapElement(elements[i]);
			}
		} else {
			if (elements.parentElement) {
				createWrapElement(elements);
			}
		}
	};

	wrap('table', '.table');

	//
	//  
	//
	//
	// Проверки

	// Проверка на мобильное устройство
	function isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
	}

	// Проверка на десктоп разрешение 
	function isDesktop() {
		return windowWidth > burgerMedia
	}

	// Проверка поддержки webp 
	function checkWebp() {
		const webP = new Image();
		webP.onload = webP.onerror = function () {
			if (webP.height !== 2) {
				document.querySelectorAll('[style]').forEach(item => {
					const styleAttr = item.getAttribute('style');
					if (styleAttr.indexOf('background-image') === 0) {
						item.setAttribute('style', styleAttr.replace('.webp', '.jpg'));
					}
				});
			}
		};
		webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}

	// Проверка на браузер safari
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

	// Проверка есть ли скролл 
	function haveScroll() {
		return document.documentElement.scrollHeight !== document.documentElement.clientHeight
	}

	// Закрытие бургера на десктопе
	function checkBurgerAndMenu() {
		if (isDesktop()) {
			menuLink.classList.remove('active');
			if (menu) {
				menu.classList.remove(menuActive);
				if (!body.classList.contains(bodyOpenModalClass)) {
					body.classList.remove('no-scroll');
				}
			}
		}

		if (html.classList.contains('lg-on')) {
			if (isMobile()) {
				body.style.paddingRight = '0';
			} else {
				body.style.paddingRight = getScrollBarWidth() + 'px';
			}
		}
	}

	// Получение объектов с медиа-запросами
	function dataMediaQueries(array, dataSetValue) {
		let media = Array.from(array).filter(function (item) {
			if (item.dataset[dataSetValue]) {
				return item.dataset[dataSetValue].split(",")[0]
			}
		});

		if (media.length) {
			let breakpointsArray = [];
			media.forEach(item => {
				let params = item.dataset[dataSetValue];
				let breakpoint = {};
				let paramsArray = params.split(",");
				breakpoint.value = paramsArray[0];
				breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
				breakpoint.item = item;
				breakpointsArray.push(breakpoint);
			});

			let mdQueries = breakpointsArray.map(function (item) {
				return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type
			});

			mdQueries = uniqArray(mdQueries);
			let mdQueriesArray = [];

			if (mdQueries.length) {
				mdQueries.forEach(breakpoint => {
					let paramsArray = breakpoint.split(",");
					let mediaBreakpoint = paramsArray[1];
					let mediaType = paramsArray[2];
					let matchMedia = window.matchMedia(paramsArray[0]);

					let itemsArray = breakpointsArray.filter(function (item) {
						return item.value === mediaBreakpoint && item.type === mediaType
					});

					mdQueriesArray.push({ itemsArray, matchMedia });
				});

				return mdQueriesArray
			}
		}
	}

	// Изменение ссылок в меню 
	if (!document.querySelector('body').classList.contains('home') && document.querySelector('body').classList.contains('wp')) {
		let menu = document.querySelectorAll('.menu li a');

		for (let i = 0; i < menu.length; i++) {
			if (menu[i].getAttribute('href').indexOf('#') > -1) {
				menu[i].setAttribute('href', '/' + menu[i].getAttribute('href'));
			}
		}
	}

	// Добавление класса loaded после полной загрузки страницы
	function loaded() {
		document.addEventListener('DOMContentLoaded', function () {
			html.classList.add('loaded');
			if (document.querySelector('header')) {
				document.querySelector('header').classList.add('loaded');
			}
			if (haveScroll()) {
				setTimeout(() => {
					html.classList.remove('scrollbar-auto');
				}, 500);
			}
		});
	}

	// Для локалки
	if (window.location.hostname == 'localhost' || window.location.hostname.includes('192.168')) {
		document.querySelectorAll('.logo, .crumbs>li:first-child>a').forEach(logo => {
			logo.setAttribute('href', '/');
		});

		document.querySelectorAll('.menu a').forEach(item => {
			let firstSlash = 0;
			let lastSlash = 0;

			if (item.href.split('/').length - 1 == 4) {
				for (let i = 0; i < item.href.length; i++) {
					if (item.href[i] == '/') {
						if (i > 6 && firstSlash == 0) {
							firstSlash = i;
							continue
						}

						if (i > 6 && lastSlash == 0) {
							lastSlash = i;
						}
					}
				}

				let newLink = '';
				let removeProjectName = '';

				for (let i = 0; i < item.href.length; i++) {
					if (i > firstSlash && i < lastSlash + 1) {
						removeProjectName += item.href[i];
					}
				}

				newLink = item.href.replace(removeProjectName, '');
				item.href = newLink;
			}
		});
	}

	// Проверка на браузер safari
	if (isSafari) document.documentElement.classList.add('safari');

	// Проверка поддержки webp 
	checkWebp();

	// Закрытие бургера на десктопе
	window.addEventListener('resize', throttle(checkBurgerAndMenu, 100));
	checkBurgerAndMenu();

	// Добавление класса loaded при загрузке страницы
	loaded();

	// 
	// 
	// 
	// 
	// Анимации 

	// Плавное появление
	const fadeIn = (el, isItem = false, display, timeout = 400) => {
		document.body.classList.add('_fade');

		let elements = isItem ? el : document.querySelectorAll(el);

		if (elements.length > 0) {
			elements.forEach(element => {
				element.style.opacity = 0;
				element.style.display = 'block';
				element.style.transition = `opacity ${timeout}ms`;
				setTimeout(() => {
					element.style.opacity = 1;
					setTimeout(() => {
						document.body.classList.remove('_fade');
					}, timeout);
				}, 10);
			});
		} else {
			el.style.opacity = 0;
			el.style.display = 'block';
			el.style.transition = `opacity ${timeout}ms`;
			setTimeout(() => {
				el.style.opacity = 1;
				setTimeout(() => {
					document.body.classList.remove('_fade');
				}, timeout);
			}, 10);
		}
	};

	// Плавно скрыть с анимацией слайда 
	const _slideUp$1 = (target, duration = 400, showmore = 0) => {
		if (target && !target.classList.contains('_slide')) {
			target.classList.add('_slide');
			target.style.transitionProperty = 'height, margin, padding';
			target.style.transitionDuration = duration + 'ms';
			target.style.height = `${target.offsetHeight}px`;
			target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = showmore ? `${showmore}px` : `0px`;
			target.style.paddingBlock = 0;
			target.style.marginBlock = 0;
			window.setTimeout(() => {
				target.style.display = !showmore ? 'none' : 'block';
				!showmore ? target.style.removeProperty('height') : null;
				target.style.removeProperty('padding-top');
				target.style.removeProperty('padding-bottom');
				target.style.removeProperty('margin-top');
				target.style.removeProperty('margin-bottom');
				!showmore ? target.style.removeProperty('overflow') : null;
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
				target.classList.remove('_slide');
				document.dispatchEvent(new CustomEvent("slideUpDone", {
					detail: {
						target: target
					}
				}));
			}, duration);
		}
	};

	// Плавно показать с анимацией слайда 
	const _slideDown$1 = (target, duration = 400) => {
		if (target && !target.classList.contains('_slide')) {
			target.style.removeProperty('display');
			let display = window.getComputedStyle(target).display;
			if (display === 'none') display = 'block';
			target.style.display = display;
			let height = target.offsetHeight;
			target.style.overflow = 'hidden';
			target.style.height = 0;
			target.style.paddingBLock = 0;
			target.style.marginBlock = 0;
			target.offsetHeight;
			target.style.transitionProperty = "height, margin, padding";
			target.style.transitionDuration = duration + 'ms';
			target.style.height = height + 'px';
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			window.setTimeout(() => {
				target.style.removeProperty('height');
				target.style.removeProperty('overflow');
				target.style.removeProperty('transition-duration');
				target.style.removeProperty('transition-property');
			}, duration);
		}
	};

	/* 
		================================================
		  
		Многоуровневое меню
		
		================================================
	*/

	function subMenu() {
		subMenuInit();

		let mediaSwitcher = false;

		function subMenuResize() {

			if (isDesktop()) {
				subMenuInit(true);

				if (!mediaSwitcher) {
					document.querySelectorAll('.menu-item-arrow').forEach(item => {
						item.classList.remove('active');
						if (item.parentElement.nextElementSibling) {
							item.parentElement.nextElementSibling.classList.remove('active');
							item.parentElement.nextElementSibling.style.display = 'block';
						}
					});

					mediaSwitcher = true;
				}
			} else {
				let menuItemHasChildren = document.querySelectorAll('.menu-item-has-children');

				menuItemHasChildren.forEach(item => {
					item.querySelector('.sub-menu-wrapper').style.display = 'block';
					toggleSubMenuVisible(item);
				});

				mediaSwitcher = false;
			}
		}

		window.addEventListener('resize', throttle(subMenuResize, 100));

		// инициализация подменю	
		function subMenuInit(isResize = false) {
			let menuItemHasChildren = document.querySelectorAll('.menu-item-has-children');

			menuItemHasChildren.forEach(item => {
				let timeoutId = null;

				if (isDesktop()) {
					item.addEventListener('mouseover', function (e) {
						clearTimeout(timeoutId);
						menuMouseOverInit(item, e, isResize);
					});

					item.addEventListener('focusin', function (e) {
						clearTimeout(timeoutId);
						menuMouseOverInit(item, e, isResize);
					});

					item.addEventListener('mouseout', function (e) {
						timeoutId = setTimeout(() => {
							if (!item.contains(e.relatedTarget)) {
								item.classList.remove('active');
							}
						}, 300);
					});

					item.addEventListener('focusout', function (e) {
						timeoutId = setTimeout(() => {
							if (!item.contains(document.activeElement)) {
								item.classList.remove('active');
							}
						}, 500);
					});
				}

				toggleSubMenuVisible(item, !isDesktop());
			});
		}

		function menuMouseOverInit(item, e, isResize) {

			// закрыть все открытые меню, кроме текущего
			document.querySelectorAll('.menu>.menu-item-has-children').forEach(li => {
				if (li != item) {
					li.classList.remove('active');
				}
			});

			if (isDesktop()) {
				if (!isResize) {
					item.classList.add('active');
				}

				// если это самый верхний уровень, то определить сторону и добавить соответствующий класс 
				if (item.closest('.menu')) {
					// if (getPageSideMenu(e) == 'left') {
					item.classList.add('left');
					// } else {
					// item.classList.add('right');
					// }
				}

				if (item == getTargetElementTag(e)) {
					// если нет места, чтобы добавить подменю скраю, то добавить снизу
					if ((getPageSideMenu(e) == 'left' && offset(item).right < item.offsetWidth) || (getPageSideMenu(e) == 'right' && offset(item).left < item.offsetWidth)) {
						item.classList.add('top', 'menu-item-has-children_not-relative');
					}

				}
			}
		}

		let menuItemArrow = document.querySelectorAll('.menu-item-arrow');
		let isClicked = false;

		menuItemArrow.forEach(item => {
			item.addEventListener('click', function (e) {
				e.preventDefault();
				if (!isDesktop()) {
					if (!isClicked) {
						isClicked = true;
						if (!item.classList.contains('active')) {
							item.classList.add('active');
							item.parentElement.nextElementSibling.classList.add('active');
							_slideDown$1(item.parentElement.nextElementSibling, 200);
						} else {
							item.classList.remove('active');
							item.parentElement.nextElementSibling.classList.remove('remove');
							_slideUp$1(item.parentElement.nextElementSibling, 200);
						}

						setTimeout(() => {
							isClicked = false;
						}, 300);
					}
				}
			});
		});

		document.querySelectorAll('.menu-item-has-children > a').forEach(link => {
			link.addEventListener('click', function (e) {
				let textNode = link.childNodes[0];
				let textRange = document.createRange();
				textRange.selectNodeContents(textNode);
				let textRect = textRange.getBoundingClientRect();

				if (e.clientX >= textRect.left && e.clientX <= textRect.right && e.clientY >= textRect.top && e.clientY <= textRect.bottom) {
					return;
				}

				e.preventDefault();
				let arrow = link.querySelector('.menu-item-arrow');
				if (arrow) arrow.click();
			});
		});

		function toggleSubMenuVisible(item, state = true) {
			let subMenu = item.querySelectorAll('.sub-menu-wrapper');
			subMenu.forEach(element => {
				element.style.display = state ? 'none' : 'block';
			});
		}

		function getTargetElementTag(e) {
			return e.target.parentElement.tagName == "LI" ? e.target.parentElement : e.target
		}

		function getPageSideMenu(e) {
			return e.target.closest('.menu') ? offset(e.target.closest('.menu>.menu-item-has-children')).left > (windowWidth / 2) ? 'right' : 'left' : 'left'
		}
	}

	//
	//
	//
	//
	// Работа с url

	// Получение хэша
	function getHash() {
		return location.hash ? location.hash.replace('#', '') : '';
	}

	/* 
		================================================
		  
		Табы
		
		================================================
	*/

	function tab() {
		let tabs = document.querySelectorAll('[data-tabs]');
		let tabsActiveHash = [];

		if (tabs.length > 0) {
			let hash = getHash();

			if (hash && hash.startsWith('tab-')) {
				tabsActiveHash = hash.replace('tab-', '').split('-');
			}

			tabs.forEach((tabsBlock, index) => {
				tabsBlock.classList.add('tab_init');
				tabsBlock.setAttribute('data-tabs-index', index);
				tabsBlock.addEventListener("click", setTabsAction);
				initTabs(tabsBlock);
			});

			let mdQueriesArray = dataMediaQueries(tabs, "tabs");

			if (mdQueriesArray && mdQueriesArray.length) {
				mdQueriesArray.forEach(mdQueriesItem => {
					mdQueriesItem.matchMedia.addEventListener("change", function () {
						setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
					});
					setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
				});
			}
		}

		function setTitlePosition(tabsMediaArray, matchMedia) {
			tabsMediaArray.forEach(tabsMediaItem => {
				tabsMediaItem = tabsMediaItem.item;
				let tabsTitles = tabsMediaItem.querySelector('[data-tabs-header]');
				let tabsTitleItems = tabsMediaItem.querySelectorAll('[data-tabs-title]');
				let tabsContent = tabsMediaItem.querySelector('[data-tabs-body]');
				let tabsContentItems = tabsMediaItem.querySelectorAll('[data-tabs-item]');

				tabsTitleItems = Array.from(tabsTitleItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
				tabsContentItems = Array.from(tabsContentItems).filter(item => item.closest('[data-tabs]') === tabsMediaItem);
				tabsContentItems.forEach((tabsContentItem, index) => {
					if (matchMedia.matches) {
						tabsContent.append(tabsTitleItems[index]);
						tabsContent.append(tabsContentItem);
						tabsMediaItem.classList.add('tab-spoller');
					} else {
						tabsTitles.append(tabsTitleItems[index]);
						tabsMediaItem.classList.remove('tab-spoller');
					}
				});
			});
		}

		function initTabs(tabsBlock) {
			let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-header]>*');
			let tabsContent = tabsBlock.querySelectorAll('[data-tabs-body]>*');
			let tabsBlockIndex = tabsBlock.dataset.tabsIndex;
			let tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;

			if (tabsActiveHashBlock) {
				let tabsActiveTitle = tabsBlock.querySelector('[data-tabs-header]>.active');
				tabsActiveTitle ? tabsActiveTitle.classList.remove('active') : null;
			}

			if (tabsContent.length) {
				tabsContent.forEach((tabsContentItem, index) => {
					tabsTitles[index].setAttribute('data-tabs-title', '');
					tabsContentItem.setAttribute('data-tabs-item', '');

					if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
						tabsTitles[index].classList.add('active');
					}

					tabsContentItem.hidden = true;
				});

				if (!tabsBlock.querySelector('[data-tabs-header]>.active')) {
					tabsBlock.querySelector('[data-tabs-body]').children[0].hidden = false;
				} else {
					tabsBlock.querySelector('[data-tabs-body]').children[indexInParent(tabsBlock.querySelector('[data-tabs-header]>.active'))].hidden = false;
				}
			}
		}

		function setTabsStatus(tabsBlock) {
			let tabsTitles = tabsBlock.querySelectorAll('[data-tabs-title]');
			let tabsContent = tabsBlock.querySelectorAll('[data-tabs-item]');
			let tabsBlockIndex = tabsBlock.dataset.tabsIndex;

			function isTabsAnamate(tabsBlock) {
				if (tabsBlock.hasAttribute('data-tabs-animate')) {
					return tabsBlock.dataset.tabsAnimate > 0 ? Number(tabsBlock.dataset.tabsAnimate) : 500;
				}
			}

			let tabsBlockAnimate = isTabsAnamate(tabsBlock);

			if (tabsContent.length > 0) {
				let isHash = tabsBlock.hasAttribute('data-tabs-hash');

				tabsContent = Array.from(tabsContent).filter(item => item.closest('[data-tabs]') === tabsBlock);
				tabsTitles = Array.from(tabsTitles).filter(item => item.closest('[data-tabs]') === tabsBlock);
				tabsContent.forEach((tabsContentItem, index) => {
					if (tabsTitles[index].classList.contains('active')) {
						if (tabsBlockAnimate) {
							_slideDown(tabsContentItem, tabsBlockAnimate);
						} else {
							fadeIn(tabsContentItem, true);
							tabsContentItem.hidden = false;
							tabsContentItem.classList.toggle('active');
						}
						if (isHash && !tabsContentItem.closest('.popup')) {
							setHash(`tab-${tabsBlockIndex}-${index}`);
						}
					} else {
						if (tabsBlockAnimate) {
							_slideUp(tabsContentItem, tabsBlockAnimate);
						} else {
							tabsContentItem.style.display = 'none';
							tabsContentItem.hidden = true;
						}
					}
				});
			}
		}

		function setTabsAction(e) {
			let el = e.target;

			if (el.closest('[data-tabs-title]') && !el.closest('[data-tabs-title]').classList.contains('active')) {
				let tabTitle = el.closest('[data-tabs-title]');
				let tabsBlock = tabTitle.closest('[data-tabs]');

				if (!tabTitle.classList.contains('active') && !tabsBlock.querySelector('._slide')) {
					let tabActiveTitle = tabsBlock.querySelectorAll('[data-tabs-title].active');
					tabActiveTitle.length ? tabActiveTitle = Array.from(tabActiveTitle).filter(item => item.closest('[data-tabs]') === tabsBlock) : null;
					tabActiveTitle.length ? tabActiveTitle[0].classList.remove('active') : null;
					tabTitle.classList.add('active');
					setTabsStatus(tabsBlock);

					scrollToSmoothly(offset(el.closest('[data-tabs]')).top - parseInt(headerTop.clientHeight));

				}

				e.preventDefault();
			}
		}

		// Переключение табов левыми кнопками (атрибут data-tab="") 
		let dataTabs = document.querySelectorAll('[data-tab]');

		dataTabs.forEach(button => {
			button.addEventListener('click', function () {
				document.querySelector(button.getAttribute('data-tab')).click();
				scrollToSmoothly(offset(document.querySelector(button.getAttribute('data-tab'))
				).top - parseInt(headerTop.clientHeight));
			});
		});
	}

	// 
	// 
	// 
	// 
	// Функции для работы со скроллом и скроллбаром

	// Скрытие скроллбара
	function hideScrollbar() {
		// changeScrollbarGutter()

		popup.forEach(element => {
			element.style.display = 'none';
		});

		if (haveScroll()) {
			body.classList.add('no-scroll');
		}

		changeScrollbarPadding();
	}

	function showScrollbar() {
		if (!menu.classList.contains(menuActive)) {
			body.classList.remove('no-scroll');
		}

		changeScrollbarPadding(false);

		// if (haveScroll()) {
		// 	body.classList.add('scrollbar-auto')
		// 	html.classList.add('scrollbar-auto')
		// }
	}

	// Ширина скроллбара
	function getScrollBarWidth$1() {
		let div = document.createElement('div');
		div.style.overflowY = 'scroll';
		div.style.width = '50px';
		div.style.height = '50px';
		document.body.append(div);
		let scrollWidth = div.offsetWidth - div.clientWidth;
		div.remove();

		if (haveScroll()) {
			return scrollWidth
		} else {
			return 0
		}
	}

	// Добавление и удаление отступа у body и фиксированных элементов
	function changeScrollbarPadding(add = true) {
		const scrollbarPadding = getScrollBarWidth$1() + 'px';

		fixedElements.forEach(elem => {
			const position = window.getComputedStyle(elem).position;

			if (position === 'sticky') {
				if (add) {
					if (!stickyObservers.has(elem)) {
						const observer = new IntersectionObserver(([entry]) => {
							if (!entry.isIntersecting) {
								elem.style.paddingRight = scrollbarPadding;
							} else {
								elem.style.paddingRight = '0';
							}
						}, {
							threshold: [1]
						});
						observer.observe(elem);
						stickyObservers.set(elem, observer);
					}
				} else {
					elem.style.paddingRight = '0';
					const observer = stickyObservers.get(elem);
					if (observer) {
						observer.unobserve(elem);
						stickyObservers.delete(elem);
					}
				}
			} else {
				elem.style.paddingRight = add ? scrollbarPadding : '0';
			}
		});

		if (isSafari) {
			body.style.paddingRight = add ? scrollbarPadding : '0';
		}
	}

	/* 
		================================================
		  
		Бургер
		
		================================================
	*/

	function burger() {
		if (menuLink) {
			let marginTop = 0;
			let isAnimating = false;

			menuLink.addEventListener('click', function (e) {
				if (windowWidth <= 991) {
					if (isAnimating) return
					isAnimating = true;


					marginTop = headerTop.getBoundingClientRect().height;
					menuLink.classList.toggle('active');
					menu.style.marginTop = marginTop + 'px';
					menu.classList.toggle(menuActive);

					if (menu.classList.contains(menuActive)) {
						hideScrollbar();
					} else {
						setTimeout(() => {
							showScrollbar();
						}, 400);
					}

					setTimeout(() => {
						isAnimating = false;
					}, 500);
				}
			});

			function checkHeaderOffset() {
				if (isMobile()) {
					changeScrollbarPadding(false);
				} else {
					if (body.classList.contains(bodyOpenModalClass)) {
						changeScrollbarPadding();
					}
				}

				if (isDesktop()) {
					menu.removeAttribute('style');

					if (!body.classList.contains(bodyOpenModalClass)) {
						body.classList.remove('no-scroll');

						if (isSafari) {
							changeScrollbarPadding(false);
						}
					}
				} else {
					if (marginTop != headerTop.getBoundingClientRect().height) {
						menu.style.marginTop = headerTop.getBoundingClientRect().height + 'px';
					}
				}
			}

			window.addEventListener('resize', throttle(checkHeaderOffset, 50));
			window.addEventListener('resize', throttle(checkHeaderOffset, 150));

			if (document.querySelector('.header__mobile')) {
				closeOutClick('.header__mobile', '.menu-link', 'active');
			}
		}
	}

	/* 
		================================================
		  
		Фиксированное меню
		
		================================================
	*/

	function fixedMenu() {
		if (!headerTop) return;

		const isFixed = isDesktop() && window.scrollY > 180;
		if (isFixed) {
			headerTop.classList.add(headerTopFixed);
		} else {
			headerTop.classList.remove(headerTopFixed);
		}
	}

	window.addEventListener('scroll', fixedMenu);
	window.addEventListener('resize', fixedMenu);

	subMenu();
	tab();
	burger();
	fixedMenu();

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

				catalog.querySelectorAll('.catalog__button')[1].classList.add('active');
			} else {
				catalog.querySelectorAll('.catalog__button')[1].classList.remove('active');
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

})();
//# sourceMappingURL=script.js.map
