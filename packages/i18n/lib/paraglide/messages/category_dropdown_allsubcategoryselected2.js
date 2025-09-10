// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_category_dropdown_allsubcategoryselected2 = /** @type {(inputs: { category: NonNullable<unknown> }) => string} */ (i) => {
	return `Всички ${i.category} избрани`
};

const en_category_dropdown_allsubcategoryselected2 = /** @type {(inputs: { category: NonNullable<unknown> }) => string} */ (i) => {
	return `All ${i.category} selected`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ category: NonNullable<unknown> }} inputs
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const category_dropdown_allsubcategoryselected2 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.category_dropdown_allsubcategoryselected2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("category_dropdown_allsubcategoryselected2", locale)
	if (locale === "bg") return bg_category_dropdown_allsubcategoryselected2(inputs)
	return en_category_dropdown_allsubcategoryselected2(inputs)
};
export { category_dropdown_allsubcategoryselected2 as "category_dropdown_allSubcategorySelected" }