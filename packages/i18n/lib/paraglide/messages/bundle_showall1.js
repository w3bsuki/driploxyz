// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_bundle_showall1 = /** @type {(inputs: {}) => string} */ () => {
	return `Покажи всички`
};

const en_bundle_showall1 = /** @type {(inputs: {}) => string} */ () => {
	return `Show all`
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
const bundle_showall1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.bundle_showall1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("bundle_showall1", locale)
	if (locale === "bg") return bg_bundle_showall1(inputs)
	return en_bundle_showall1(inputs)
};
export { bundle_showall1 as "bundle_showAll" }