// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_empty_startbrowsing1 = /** @type {(inputs: {}) => string} */ () => {
	return `Start browsing`
};

const bg_empty_startbrowsing1 = /** @type {(inputs: {}) => string} */ () => {
	return `Започни да разглеждаш`
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
const empty_startbrowsing1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.empty_startbrowsing1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("empty_startbrowsing1", locale)
	if (locale === "en") return en_empty_startbrowsing1(inputs)
	return bg_empty_startbrowsing1(inputs)
};
export { empty_startbrowsing1 as "empty_startBrowsing" }