// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_pdp_viewsellerprofile2 = /** @type {(inputs: {}) => string} */ () => {
	return `Виж профила на продавача`
};

const en_pdp_viewsellerprofile2 = /** @type {(inputs: {}) => string} */ () => {
	return `View Seller Profile`
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
const pdp_viewsellerprofile2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pdp_viewsellerprofile2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pdp_viewsellerprofile2", locale)
	if (locale === "bg") return bg_pdp_viewsellerprofile2(inputs)
	return en_pdp_viewsellerprofile2(inputs)
};
export { pdp_viewsellerprofile2 as "pdp_viewSellerProfile" }