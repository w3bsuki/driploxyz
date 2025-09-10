// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pagination_gotopage2 = /** @type {(inputs: {}) => string} */ () => {
	return `Отиди на страница`
};

const en_pagination_gotopage2 = /** @type {(inputs: {}) => string} */ () => {
	return `Go to page`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{}} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pagination_gotopage2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pagination_gotopage2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pagination_gotopage2", locale)
	if (locale === "bg") return bg_pagination_gotopage2(inputs)
	return en_pagination_gotopage2(inputs)
};
export { pagination_gotopage2 as "pagination_goToPage" }