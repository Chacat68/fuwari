<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import { onMount } from "svelte";
import { siteConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);

// Enable time-based auto switching (6:00/18:00).
const ENABLE_TIME_BASED_THEME_SWITCH = siteConfig.theme.timeBasedSwitch;
let timeSwitchTimer: ReturnType<typeof setTimeout> | null = null;

function getTimeBasedTheme(): LIGHT_DARK_MODE {
	const hour = new Date().getHours();
	return hour >= 6 && hour < 18 ? LIGHT_MODE : DARK_MODE;
}

function getNextSwitchDelayMs(): number {
	const now = new Date();
	const next = new Date(now);

	if (now.getHours() < 6) {
		next.setHours(6, 0, 0, 0);
	} else if (now.getHours() < 18) {
		next.setHours(18, 0, 0, 0);
	} else {
		next.setDate(next.getDate() + 1);
		next.setHours(6, 0, 0, 0);
	}

	return Math.max(next.getTime() - now.getTime(), 0);
}

function clearTimeSwitchTimer() {
	if (timeSwitchTimer) {
		clearTimeout(timeSwitchTimer);
		timeSwitchTimer = null;
	}
}

function scheduleTimeSwitch() {
	clearTimeSwitchTimer();
	const delay = getNextSwitchDelayMs();
	if (delay <= 0) {
		return;
	}
	const targetMode = mode;
	timeSwitchTimer = setTimeout(() => {
		if (ENABLE_TIME_BASED_THEME_SWITCH && targetMode === AUTO_MODE) {
			applyThemeToDocument(getTimeBasedTheme());
			scheduleTimeSwitch();
		}
	}, delay);
}

function setupAutoThemeBehavior() {
	if (mode !== AUTO_MODE) {
		clearTimeSwitchTimer();
		return;
	}

	if (ENABLE_TIME_BASED_THEME_SWITCH) {
		applyThemeToDocument(getTimeBasedTheme());
		scheduleTimeSwitch();
	} else {
		applyThemeToDocument(AUTO_MODE);
	}
}

onMount(() => {
	mode = getStoredTheme();
	setupAutoThemeBehavior();

	if (ENABLE_TIME_BASED_THEME_SWITCH) {
		return () => {
			clearTimeSwitchTimer();
		};
	}

	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const changeThemeWhenSchemeChanged: Parameters<
		typeof darkModePreference.addEventListener<"change">
	>[1] = (_e) => {
		if (mode === AUTO_MODE) {
			applyThemeToDocument(mode);
		}
	};
	if (typeof darkModePreference.addEventListener === "function") {
		darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);
	}
	return () => {
		if (typeof darkModePreference.removeEventListener === "function") {
			darkModePreference.removeEventListener(
				"change",
				changeThemeWhenSchemeChanged,
			);
		}
		clearTimeSwitchTimer();
	};
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
	setupAutoThemeBehavior();
}

function toggleScheme() {
	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	switchScheme(seq[(i + 1) % seq.length]);
}

function showPanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel?.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel?.classList.add("float-panel-closed");
}
</script>

<!-- z-50 make the panel higher than other float panels -->
<div class="relative z-50" role="menu" tabindex="-1" onmouseleave={hidePanel}>
    <button aria-label="Light/Dark Mode" role="menuitem" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="scheme-switch" onclick={toggleScheme} onmouseenter={showPanel}>
        <div class="absolute" class:opacity-0={mode !== LIGHT_MODE}>
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute" class:opacity-0={mode !== DARK_MODE}>
            <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute" class:opacity-0={mode !== AUTO_MODE}>
            <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]"></Icon>
        </div>
    </button>

    <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" >
        <div class="card-base float-panel p-2">
            <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                    class:current-theme-btn={mode === LIGHT_MODE}
                    onclick={() => switchScheme(LIGHT_MODE)}
            >
                <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
                {i18n(I18nKey.lightMode)}
            </button>
            <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                    class:current-theme-btn={mode === DARK_MODE}
                    onclick={() => switchScheme(DARK_MODE)}
            >
                <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
                {i18n(I18nKey.darkMode)}
            </button>
            <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95"
                    class:current-theme-btn={mode === AUTO_MODE}
                    onclick={() => switchScheme(AUTO_MODE)}
            >
                <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-3"></Icon>
                {i18n(I18nKey.systemMode)}
            </button>
        </div>
    </div>
</div>
