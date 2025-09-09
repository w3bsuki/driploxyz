// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_search_shopbycondition2 = /** @type {(inputs: {}) => string} */ () => {
	return `Shop by Condition`
};

const bg_search_shopbycondition2 = /** @type {(inputs: {}) => string} */ () => {
	return `Пазарувай по състояние`
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
const search_shopbycondition2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_shopbycondition2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_shopbycondition2", locale)
	if (locale === "en") return en_search_shopbycondition2(inputs)
	return bg_search_shopbycondition2(inputs)
};
export { search_shopbycondition2 as "search_shopByCondition" }