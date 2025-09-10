// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_error_atleastonephoto3 = /** @type {(inputs: {}) => string} */ () => {
	return `Необходима е поне една снимка`
};

const en_error_atleastonephoto3 = /** @type {(inputs: {}) => string} */ () => {
	return `At least one photo is required`
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
const error_atleastonephoto3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.error_atleastonephoto3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("error_atleastonephoto3", locale)
	if (locale === "bg") return bg_error_atleastonephoto3(inputs)
	return en_error_atleastonephoto3(inputs)
};
export { error_atleastonephoto3 as "error_atLeastOnePhoto" }