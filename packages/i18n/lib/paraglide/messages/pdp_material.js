// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pdp_material = /** @type {(inputs: {}) => string} */ () => {
	return `Material`
};

const bg_pdp_material = /** @type {(inputs: {}) => string} */ () => {
	return `Материал`
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
export const pdp_material = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_material(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_material", locale)
	if (locale === "en") return en_pdp_material(inputs)
	return bg_pdp_material(inputs)
};