// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_engagement_banner_description = /** @type {(inputs: {}) => string} */ () => {
	return `Запазвайте любими артикули, започнете да продавате и се свързвайте с любители на модата`
};

const en_engagement_banner_description = /** @type {(inputs: {}) => string} */ () => {
	return `Save favorites, start selling, and connect with fashion lovers`
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
export const engagement_banner_description = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.engagement_banner_description(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("engagement_banner_description", locale)
	if (locale === "bg") return bg_engagement_banner_description(inputs)
	return en_engagement_banner_description(inputs)
};