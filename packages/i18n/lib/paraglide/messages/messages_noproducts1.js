// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_messages_noproducts1 = /** @type {(inputs: {}) => string} */ () => {
	return `Няма продукти - Обща беседа`
};

const en_messages_noproducts1 = /** @type {(inputs: {}) => string} */ () => {
	return `No products - General conversation`
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
const messages_noproducts1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.messages_noproducts1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("messages_noproducts1", locale)
	if (locale === "bg") return bg_messages_noproducts1(inputs)
	return en_messages_noproducts1(inputs)
};
export { messages_noproducts1 as "messages_noProducts" }