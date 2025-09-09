// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_tutorial_listitemcontentbrand3 = /** @type {(inputs: {}) => string} */ () => {
	return `As a brand account you have access to bulk upload tools and advanced analytics.`
};

const bg_onboarding_tutorial_listitemcontentbrand3 = /** @type {(inputs: {}) => string} */ () => {
	return `Като бранд акаунт имате достъп до инструменти за масово качване и разширена аналитика.`
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
const onboarding_tutorial_listitemcontentbrand3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_tutorial_listitemcontentbrand3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_tutorial_listitemcontentbrand3", locale)
	if (locale === "en") return en_onboarding_tutorial_listitemcontentbrand3(inputs)
	return bg_onboarding_tutorial_listitemcontentbrand3(inputs)
};
export { onboarding_tutorial_listitemcontentbrand3 as "onboarding_tutorial_listItemContentBrand" }