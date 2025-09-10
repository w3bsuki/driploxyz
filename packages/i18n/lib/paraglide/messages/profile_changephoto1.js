// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_profile_changephoto1 = /** @type {(inputs: {}) => string} */ () => {
	return `Смени снимката`
};

/** @type {(inputs: {}) => string} */
const en_profile_changephoto1 = bg_profile_changephoto1;

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
const profile_changephoto1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.profile_changephoto1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("profile_changephoto1", locale)
	if (locale === "bg") return bg_profile_changephoto1(inputs)
	return en_profile_changephoto1(inputs)
};
export { profile_changephoto1 as "profile_changePhoto" }