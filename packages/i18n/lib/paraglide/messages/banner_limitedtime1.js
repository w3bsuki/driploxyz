// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_banner_limitedtime1 = /** @type {(inputs: {}) => string} */ () => {
	return `Ограничена оферта`
};

const en_banner_limitedtime1 = /** @type {(inputs: {}) => string} */ () => {
	return `Limited time offer`
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
const banner_limitedtime1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.banner_limitedtime1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("banner_limitedtime1", locale)
	if (locale === "bg") return bg_banner_limitedtime1(inputs)
	return en_banner_limitedtime1(inputs)
};
export { banner_limitedtime1 as "banner_limitedTime" }