// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_trending_title = /** @type {(inputs: {}) => string} */ () => {
	return `Trending Now`
};

const bg_trending_title = /** @type {(inputs: {}) => string} */ () => {
	return `Актуално сега`
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
export const trending_title = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.trending_title(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("trending_title", locale)
	if (locale === "en") return en_trending_title(inputs)
	return bg_trending_title(inputs)
};