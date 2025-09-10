// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_filter_text_expansion_test = /** @type {(inputs: {}) => string} */ () => {
	return `Това е много дълго име на филтър, което ще тества разширяването на текста в различни езици и ще гарантира правилната стабилност на оформлението, когато съдържанието нараства значително`
};

const en_filter_text_expansion_test = /** @type {(inputs: {}) => string} */ () => {
	return `This is a very long filter name that will test text expansion in different languages and ensure proper layout stability when content grows significantly`
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
export const filter_text_expansion_test = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_text_expansion_test(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_text_expansion_test", locale)
	if (locale === "bg") return bg_filter_text_expansion_test(inputs)
	return en_filter_text_expansion_test(inputs)
};