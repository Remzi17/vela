
import { body, menu, menuActive, menuLink, headerTop, bodyOpenModalClass, windowWidth } from "../scripts/core/variables"
import { throttle, closeOutClick } from '../scripts/core/helpers'
import { isDesktop, isMobile, isSafari } from "../scripts/other/checks"
import { changeScrollbarPadding, hideScrollbar, showScrollbar } from "../scripts/other/scroll"

/* 
	================================================
	  
	Бургер
	
	================================================
*/

export function burger() {
	if (menuLink) {
		let marginTop = 0
		let isAnimating = false

		menuLink.addEventListener('click', function (e) {
			if (windowWidth <= 991) {
				if (isAnimating) return
				isAnimating = true


				marginTop = headerTop.getBoundingClientRect().height
				menuLink.classList.toggle('active')
				menu.style.marginTop = marginTop + 'px'
				menu.classList.toggle(menuActive)

				if (menu.classList.contains(menuActive)) {
					hideScrollbar();
				} else {
					setTimeout(() => {
						showScrollbar();
					}, 400);
				}

				setTimeout(() => {
					isAnimating = false
				}, 500)
			}
		})

		function checkHeaderOffset() {
			if (isMobile()) {
				changeScrollbarPadding(false)
			} else {
				if (body.classList.contains(bodyOpenModalClass)) {
					changeScrollbarPadding()
				}
			}

			if (isDesktop()) {
				menu.removeAttribute('style')

				if (!body.classList.contains(bodyOpenModalClass)) {
					body.classList.remove('no-scroll')

					if (isSafari) {
						changeScrollbarPadding(false)
					}
				}
			} else {
				if (marginTop != headerTop.getBoundingClientRect().height) {
					menu.style.marginTop = headerTop.getBoundingClientRect().height + 'px'
				}
			}
		}

		window.addEventListener('resize', throttle(checkHeaderOffset, 50))
		window.addEventListener('resize', throttle(checkHeaderOffset, 150))

		if (document.querySelector('.header__mobile')) {
			closeOutClick('.header__mobile', '.menu-link', 'active')
		}
	}
}
