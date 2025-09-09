// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_product_sizeguidecomingsoon3 = /** @type {(inputs: {}) => string} */ () => {
	return `Size guide coming soon!`
};

const bg_product_sizeguidecomingsoon3 = /** @type {(inputs: {}) => string} */ () => {
	return `Ръководството за размери скоро!`
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
const product_sizeguidecomingsoon3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.product_sizeguidecomingsoon3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("product_sizeguidecomingsoon3", locale)
	if (locale === "en") return en_product_sizeguidecomingsoon3(inputs)
	return bg_product_sizeguidecomingsoon3(inputs)
};
export { product_sizeguidecomingsoon3 as "product_sizeGuideComingSoon" }