// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_category_minibags1 = /** @type {(inputs: {}) => string} */ () => {
	return `Мини чанти`
};

const en_category_minibags1 = /** @type {(inputs: {}) => string} */ () => {
	return `Mini Bags`
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
const category_minibags1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.category_minibags1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("category_minibags1", locale)
	if (locale === "bg") return bg_category_minibags1(inputs)
	return en_category_minibags1(inputs)
};
export { category_minibags1 as "category_miniBags" }