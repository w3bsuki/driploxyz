// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_upgrade_freefeature21 = /** @type {(inputs: {}) => string} */ () => {
	return `Основна поддръжка`
};

const en_upgrade_freefeature21 = /** @type {(inputs: {}) => string} */ () => {
	return `Basic support`
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
const upgrade_freefeature21 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_freefeature21(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_freefeature21", locale)
	if (locale === "bg") return bg_upgrade_freefeature21(inputs)
	return en_upgrade_freefeature21(inputs)
};
export { upgrade_freefeature21 as "upgrade_freeFeature2" }