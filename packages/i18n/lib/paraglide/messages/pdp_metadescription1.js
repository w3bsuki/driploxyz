// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_metadescription1 = /** @type {(inputs: { title: NonNullable<unknown>, condition: NonNullable<unknown>, brand: NonNullable<unknown>, category: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.title} - ${i.condition} състояние ${i.brand} ${i.category} налично в Driplo`
};

const en_pdp_metadescription1 = /** @type {(inputs: { title: NonNullable<unknown>, condition: NonNullable<unknown>, brand: NonNullable<unknown>, category: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.title} - ${i.condition} condition ${i.brand} ${i.category} available on Driplo`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ title: NonNullable<unknown>, condition: NonNullable<unknown>, brand: NonNullable<unknown>, category: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_metadescription1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_metadescription1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_metadescription1", locale)
	if (locale === "bg") return bg_pdp_metadescription1(inputs)
	return en_pdp_metadescription1(inputs)
};
export { pdp_metadescription1 as "pdp_metaDescription" }