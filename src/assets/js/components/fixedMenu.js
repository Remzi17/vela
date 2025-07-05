import { headerTop, headerTopFixed } from "../scripts/core/variables";
import { isDesktop } from "../scripts/other/checks";
/* 
	================================================
	  
	Фиксированное меню
	
	================================================
*/

export function fixedMenu() {
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
