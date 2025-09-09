// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_a11y_favoriteremoved1 = /** @type {(inputs: {}) => string} */ () => {
	return `Removed from favorites`
};

const bg_pdp_a11y_favoriteremoved1 = /** @type {(inputs: {}) => string} */ () => {
	return `Премахнат от любими`
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
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_a11y_favoriteremoved1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_a11y_favoriteremoved1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_a11y_favoriteremoved1", locale)
	if (locale === "en") return en_pdp_a11y_favoriteremoved1(inputs)
	return bg_pdp_a11y_favoriteremoved1(inputs)
};
export { pdp_a11y_favoriteremoved1 as "pdp_a11y_favoriteRemoved" }