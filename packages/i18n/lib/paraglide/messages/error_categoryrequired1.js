// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_error_categoryrequired1 = /** @type {(inputs: {}) => string} */ () => {
	return `Категорията е задължителна. Моля изберете категория за вашия артикул.`
};

const en_error_categoryrequired1 = /** @type {(inputs: {}) => string} */ () => {
	return `Category is required. Please select a category for your item.`
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
const error_categoryrequired1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.error_categoryrequired1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("error_categoryrequired1", locale)
	if (locale === "bg") return bg_error_categoryrequired1(inputs)
	return en_error_categoryrequired1(inputs)
};
export { error_categoryrequired1 as "error_categoryRequired" }