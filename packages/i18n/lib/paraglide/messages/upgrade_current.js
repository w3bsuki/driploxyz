// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_upgrade_current = /** @type {(inputs: {}) => string} */ () => {
	return `Current`
};

const bg_upgrade_current = /** @type {(inputs: {}) => string} */ () => {
	return `Текущ`
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
export const upgrade_current = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_current(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_current", locale)
	if (locale === "en") return en_upgrade_current(inputs)
	return bg_upgrade_current(inputs)
};