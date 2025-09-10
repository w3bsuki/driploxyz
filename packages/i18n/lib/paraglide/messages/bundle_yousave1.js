// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_bundle_yousave1 = /** @type {(inputs: {}) => string} */ () => {
	return `Икономисвате от доставка`
};

const en_bundle_yousave1 = /** @type {(inputs: {}) => string} */ () => {
	return `You save on shipping`
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
const bundle_yousave1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.bundle_yousave1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("bundle_yousave1", locale)
	if (locale === "bg") return bg_bundle_yousave1(inputs)
	return en_bundle_yousave1(inputs)
};
export { bundle_yousave1 as "bundle_youSave" }