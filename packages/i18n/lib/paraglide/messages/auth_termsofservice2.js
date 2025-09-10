// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_auth_termsofservice2 = /** @type {(inputs: {}) => string} */ () => {
	return `Условия за ползване`
};

const en_auth_termsofservice2 = /** @type {(inputs: {}) => string} */ () => {
	return `Terms of Service`
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
const auth_termsofservice2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.auth_termsofservice2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("auth_termsofservice2", locale)
	if (locale === "bg") return bg_auth_termsofservice2(inputs)
	return en_auth_termsofservice2(inputs)
};
export { auth_termsofservice2 as "auth_termsOfService" }