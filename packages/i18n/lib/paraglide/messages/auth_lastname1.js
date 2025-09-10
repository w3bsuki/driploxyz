// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_auth_lastname1 = /** @type {(inputs: {}) => string} */ () => {
	return `Фамилия`
};

const en_auth_lastname1 = /** @type {(inputs: {}) => string} */ () => {
	return `Last Name`
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
const auth_lastname1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.auth_lastname1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("auth_lastname1", locale)
	if (locale === "bg") return bg_auth_lastname1(inputs)
	return en_auth_lastname1(inputs)
};
export { auth_lastname1 as "auth_lastName" }