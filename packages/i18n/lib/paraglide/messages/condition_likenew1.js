// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_condition_likenew1 = /** @type {(inputs: {}) => string} */ () => {
	return `Like New`
};

const bg_condition_likenew1 = /** @type {(inputs: {}) => string} */ () => {
	return `Като нов`
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
const condition_likenew1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.condition_likenew1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("condition_likenew1", locale)
	if (locale === "en") return en_condition_likenew1(inputs)
	return bg_condition_likenew1(inputs)
};
export { condition_likenew1 as "condition_likeNew" }