// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_upgrade_discountfirstmonth2 = /** @type {(inputs: {}) => string} */ () => {
	return `50% OFF First Month!`
};

const bg_upgrade_discountfirstmonth2 = /** @type {(inputs: {}) => string} */ () => {
	return `50% ОТСТЪПКА първия месец!`
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
const upgrade_discountfirstmonth2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_discountfirstmonth2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_discountfirstmonth2", locale)
	if (locale === "en") return en_upgrade_discountfirstmonth2(inputs)
	return bg_upgrade_discountfirstmonth2(inputs)
};
export { upgrade_discountfirstmonth2 as "upgrade_discountFirstMonth" }