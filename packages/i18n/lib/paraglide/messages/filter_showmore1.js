// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_filter_showmore1 = /** @type {(inputs: {}) => string} */ () => {
	return `Покажи още`
};

const en_filter_showmore1 = /** @type {(inputs: {}) => string} */ () => {
	return `Show more`
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
const filter_showmore1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_showmore1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_showmore1", locale)
	if (locale === "bg") return bg_filter_showmore1(inputs)
	return en_filter_showmore1(inputs)
};
export { filter_showmore1 as "filter_showMore" }