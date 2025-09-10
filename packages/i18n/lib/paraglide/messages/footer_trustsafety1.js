// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_footer_trustsafety1 = /** @type {(inputs: {}) => string} */ () => {
	return `Доверие и Сигурност`
};

const en_footer_trustsafety1 = /** @type {(inputs: {}) => string} */ () => {
	return `Trust & Safety`
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
const footer_trustsafety1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.footer_trustsafety1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("footer_trustsafety1", locale)
	if (locale === "bg") return bg_footer_trustsafety1(inputs)
	return en_footer_trustsafety1(inputs)
};
export { footer_trustsafety1 as "footer_trustSafety" }