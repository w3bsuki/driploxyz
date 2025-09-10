// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_search_shopbycondition2 = /** @type {(inputs: {}) => string} */ () => {
	return `Пазарувай по състояние`
};

const en_search_shopbycondition2 = /** @type {(inputs: {}) => string} */ () => {
	return `Shop by Condition`
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
const search_shopbycondition2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_shopbycondition2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_shopbycondition2", locale)
	if (locale === "bg") return bg_search_shopbycondition2(inputs)
	return en_search_shopbycondition2(inputs)
};
export { search_shopbycondition2 as "search_shopByCondition" }