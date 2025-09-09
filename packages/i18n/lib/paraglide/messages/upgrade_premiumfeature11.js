// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_upgrade_premiumfeature11 = /** @type {(inputs: {}) => string} */ () => {
	return `10 boosted ads/month`
};

const bg_upgrade_premiumfeature11 = /** @type {(inputs: {}) => string} */ () => {
	return `10 повишени обяви/месец`
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
const upgrade_premiumfeature11 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_premiumfeature11(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_premiumfeature11", locale)
	if (locale === "en") return en_upgrade_premiumfeature11(inputs)
	return bg_upgrade_premiumfeature11(inputs)
};
export { upgrade_premiumfeature11 as "upgrade_premiumFeature1" }