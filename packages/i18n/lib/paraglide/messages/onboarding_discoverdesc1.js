// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_discoverdesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `Browse curated items from verified sellers. Find authentic pieces, designer brands, and unique vintage items.`
};

const bg_onboarding_discoverdesc1 = /** @type {(inputs: {}) => string} */ () => {
	return `Разгледайте курирани артикули от потвърдени продавачи. Намерете автентични части, дизайнерски марки и уникални винтидж артикули.`
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
const onboarding_discoverdesc1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_discoverdesc1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_discoverdesc1", locale)
	if (locale === "en") return en_onboarding_discoverdesc1(inputs)
	return bg_onboarding_discoverdesc1(inputs)
};
export { onboarding_discoverdesc1 as "onboarding_discoverDesc" }