// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sell_uploadphotos1 = /** @type {(inputs: {}) => string} */ () => {
	return `Качи снимки`
};

const en_sell_uploadphotos1 = /** @type {(inputs: {}) => string} */ () => {
	return `Upload Photos`
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
const sell_uploadphotos1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sell_uploadphotos1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sell_uploadphotos1", locale)
	if (locale === "bg") return bg_sell_uploadphotos1(inputs)
	return en_sell_uploadphotos1(inputs)
};
export { sell_uploadphotos1 as "sell_uploadPhotos" }