// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_success_copied = /** @type {(inputs: {}) => string} */ () => {
	return `Copied to clipboard`
};

const bg_success_copied = /** @type {(inputs: {}) => string} */ () => {
	return `Копирано в клипборда`
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
export const success_copied = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.success_copied(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("success_copied", locale)
	if (locale === "en") return en_success_copied(inputs)
	return bg_success_copied(inputs)
};