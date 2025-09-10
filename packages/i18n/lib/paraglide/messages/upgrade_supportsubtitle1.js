// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_upgrade_supportsubtitle1 = /** @type {(inputs: {}) => string} */ () => {
	return `Нашият екип за поддръжка е тук, за да ви помогне да изберете перфектния план`
};

const en_upgrade_supportsubtitle1 = /** @type {(inputs: {}) => string} */ () => {
	return `Our support team is here to help you choose the perfect plan`
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
const upgrade_supportsubtitle1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.upgrade_supportsubtitle1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("upgrade_supportsubtitle1", locale)
	if (locale === "bg") return bg_upgrade_supportsubtitle1(inputs)
	return en_upgrade_supportsubtitle1(inputs)
};
export { upgrade_supportsubtitle1 as "upgrade_supportSubtitle" }