// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_filter_ui_keyboardnavhelp2 = /** @type {(inputs: {}) => string} */ () => {
	return `Използвайте стрелките за навигация, Enter или Space за превключване, Home/End за първия/последния`
};

const en_filter_ui_keyboardnavhelp2 = /** @type {(inputs: {}) => string} */ () => {
	return `Use arrow keys to navigate, Enter or Space to toggle, Home/End to jump to first/last option`
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
const filter_ui_keyboardnavhelp2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_ui_keyboardnavhelp2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_ui_keyboardnavhelp2", locale)
	if (locale === "bg") return bg_filter_ui_keyboardnavhelp2(inputs)
	return en_filter_ui_keyboardnavhelp2(inputs)
};
export { filter_ui_keyboardnavhelp2 as "filter_ui_keyboardNavHelp" }