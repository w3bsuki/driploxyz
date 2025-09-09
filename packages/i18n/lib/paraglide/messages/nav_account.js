// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_nav_account = /** @type {(inputs: {}) => string} */ () => {
	return `Account`
};

const bg_nav_account = /** @type {(inputs: {}) => string} */ () => {
	return `Акаунт`
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
export const nav_account = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.nav_account(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("nav_account", locale)
	if (locale === "en") return en_nav_account(inputs)
	return bg_nav_account(inputs)
};