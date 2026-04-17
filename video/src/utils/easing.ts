import { Easing } from "remotion";

/**
 * Premium easing curves for cinematic motion
 */

// Crisp UI entrance - strong ease-out, no overshoot
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);

// Smooth deceleration - Apple-like
export const easeOutQuint = Easing.bezier(0.22, 1, 0.36, 1);

// Elegant fade - balanced ease-in-out
export const easeInOutCubic = Easing.bezier(0.65, 0, 0.35, 1);

// Soft entrance
export const easeOutCubic = Easing.bezier(0.33, 1, 0.68, 1);

// Quick snap with settle
export const easeOutBack = Easing.bezier(0.34, 1.56, 0.64, 1);

// Smooth scale
export const easeOutCirc = Easing.bezier(0, 0.55, 0.45, 1);

// Premium fade in
export const easeFadeIn = Easing.bezier(0.4, 0, 0.2, 1);

// Premium fade out
export const easeFadeOut = Easing.bezier(0.4, 0, 1, 1);
