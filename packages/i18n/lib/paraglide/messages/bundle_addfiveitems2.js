// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_bundle_addfiveitems2 = /** @type {(inputs: {}) => string} */ () => {
	return `+5 items (Save €25)`
};

const bg_bundle_addfiveitems2 = /** @type {(inputs: {}) => string} */ () => {
	return `+5 артикула (Икономия €25)`
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
const bundle_addfiveitems2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.bundle_addfiveitems2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("bundle_addfiveitems2", locale)
	if (locale === "en") return en_bundle_addfiveitems2(inputs)
	return bg_bundle_addfiveitems2(inputs)
};
export { bundle_addfiveitems2 as "bundle_addFiveItems" }