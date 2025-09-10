// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_filter_ui_filterremovalhelp2 = /** @type {(inputs: {}) => string} */ () => {
	return `Натиснете Enter или Space за премахване на филтъра, или Delete/Backspace като пряк път`
};

const en_filter_ui_filterremovalhelp2 = /** @type {(inputs: {}) => string} */ () => {
	return `Press Enter or Space to remove this filter, or Delete/Backspace as shortcuts`
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
const filter_ui_filterremovalhelp2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_ui_filterremovalhelp2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_ui_filterremovalhelp2", locale)
	if (locale === "bg") return bg_filter_ui_filterremovalhelp2(inputs)
	return en_filter_ui_filterremovalhelp2(inputs)
};
export { filter_ui_filterremovalhelp2 as "filter_ui_filterRemovalHelp" }