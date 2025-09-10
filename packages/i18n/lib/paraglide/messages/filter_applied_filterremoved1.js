// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_filter_applied_filterremoved1 = /** @type {(inputs: { label: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.label} филтър премахнат`
};

const en_filter_applied_filterremoved1 = /** @type {(inputs: { label: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.label} filter removed`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ label: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const filter_applied_filterremoved1 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_applied_filterremoved1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_applied_filterremoved1", locale)
	if (locale === "bg") return bg_filter_applied_filterremoved1(inputs)
	return en_filter_applied_filterremoved1(inputs)
};
export { filter_applied_filterremoved1 as "filter_applied_filterRemoved" }