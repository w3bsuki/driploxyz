// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_messages_selling = /** @type {(inputs: {}) => string} */ () => {
	return `Продаване`
};

const en_messages_selling = /** @type {(inputs: {}) => string} */ () => {
	return `Selling`
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
export const messages_selling = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.messages_selling(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("messages_selling", locale)
	if (locale === "bg") return bg_messages_selling(inputs)
	return en_messages_selling(inputs)
};