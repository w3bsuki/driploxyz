// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_remove_from_favorites = /** @type {(inputs: {}) => string} */ () => {
	return `Remove from favorites`
};

/** @type {(inputs: {}) => string} */
const bg_remove_from_favorites = () => 'remove_from_favorites'

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
export const remove_from_favorites = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.remove_from_favorites(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("remove_from_favorites", locale)
	if (locale === "bg") return bg_remove_from_favorites(inputs)
	return en_remove_from_favorites(inputs)
};