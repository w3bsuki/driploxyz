// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_stars = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.count} звезди`
};

const en_pdp_stars = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.count} stars`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ count: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const pdp_stars = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_stars(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_stars", locale)
	if (locale === "bg") return bg_pdp_stars(inputs)
	return en_pdp_stars(inputs)
};