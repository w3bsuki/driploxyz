// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_subcategory_pantstraousers1 = /** @type {(inputs: {}) => string} */ () => {
	return `Панталони`
};

/** @type {(inputs: {}) => string} */
const en_subcategory_pantstraousers1 = () => 'subcategory_pantsTraousers'

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
const subcategory_pantstraousers1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.subcategory_pantstraousers1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("subcategory_pantstraousers1", locale)
	if (locale === "en") return en_subcategory_pantstraousers1(inputs)
	return bg_subcategory_pantstraousers1(inputs)
};
export { subcategory_pantstraousers1 as "subcategory_pantsTraousers" }