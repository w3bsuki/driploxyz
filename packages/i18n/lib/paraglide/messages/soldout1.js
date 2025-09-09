// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_soldout1 = /** @type {(inputs: {}) => string} */ () => {
	return `Sold out`
};

const bg_soldout1 = /** @type {(inputs: {}) => string} */ () => {
	return `Изчерпано`
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
const soldout1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.soldout1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("soldout1", locale)
	if (locale === "en") return en_soldout1(inputs)
	return bg_soldout1(inputs)
};
export { soldout1 as "soldOut" }