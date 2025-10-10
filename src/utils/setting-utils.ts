import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = "250";
	if (typeof document === "undefined") {
		return Number.parseInt(fallback, 10);
	}
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getHue(): number {
	if (typeof localStorage === "undefined") {
		return getDefaultHue();
	}
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	if (typeof localStorage !== "undefined") {
		localStorage.setItem("hue", String(hue));
	}
	if (typeof document !== "undefined") {
		const r = document.querySelector(":root") as HTMLElement;
		if (r) {
			r.style.setProperty("--hue", String(hue));
		}
	}
}

/**
 * 根据当前时间判断应该使用亮色还是暗色主题
 * 6:00-18:00 使用亮色主题，18:00-6:00 使用暗色主题
 */
export function getTimeBasedTheme(): LIGHT_DARK_MODE {
	const now = new Date();
	const hour = now.getHours();

	// 6:00-18:00 使用亮色，18:00-6:00 使用暗色
	if (hour >= 6 && hour < 18) {
		return LIGHT_MODE;
	}
	return DARK_MODE;
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	if (typeof document === "undefined") {
		return;
	}

	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE: {
			// 优先使用时间判断，如果没有时间信息则回退到系统偏好
			const timeBasedTheme = getTimeBasedTheme();
			if (timeBasedTheme === DARK_MODE) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
		}
	}

	// Set the theme for Expressive Code
	document.documentElement.setAttribute(
		"data-theme",
		expressiveCodeConfig.theme,
	);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	if (typeof localStorage !== "undefined") {
		localStorage.setItem("theme", theme);
	}
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	if (typeof localStorage === "undefined") {
		return DEFAULT_THEME;
	}
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}
