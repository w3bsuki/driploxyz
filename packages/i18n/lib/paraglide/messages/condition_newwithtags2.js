// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_condition_newwithtags2 = /** @type {(inputs: {}) => string} */ () => {
	return `Нов с етикети`
};

const en_condition_newwithtags2 = /** @type {(inputs: {}) => string} */ () => {
	return `New with tags`
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
const condition_newwithtags2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.condition_newwithtags2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("condition_newwithtags2", locale)
	if (locale === "bg") return bg_condition_newwithtags2(inputs)
	return en_condition_newwithtags2(inputs)
};
export { condition_newwithtags2 as "condition_newWithTags" }