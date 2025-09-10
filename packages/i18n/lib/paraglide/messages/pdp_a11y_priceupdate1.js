// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_a11y_priceupdate1 = /** @type {(inputs: { price: NonNullable<unknown> }) => string} */ (i) => {
	return `Цената е обновена на ${i.price}`
};

const en_pdp_a11y_priceupdate1 = /** @type {(inputs: { price: NonNullable<unknown> }) => string} */ (i) => {
	return `Price updated to ${i.price}`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ price: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const pdp_a11y_priceupdate1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_a11y_priceupdate1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_a11y_priceupdate1", locale)
	if (locale === "bg") return bg_pdp_a11y_priceupdate1(inputs)
	return en_pdp_a11y_priceupdate1(inputs)
};
export { pdp_a11y_priceupdate1 as "pdp_a11y_priceUpdate" }