export const PAGE_SIZE = 6; // 减少首页文章数量，提升加载性能

export const LIGHT_MODE = "light";
export const DARK_MODE = "dark";
export const AUTO_MODE = "auto";
// 设置默认主题为自动模式，根据时间自动切换
export const DEFAULT_THEME: "auto" = AUTO_MODE;

// Banner height unit: vh
export const BANNER_HEIGHT = 35;
export const BANNER_HEIGHT_EXTEND = 30;
export const BANNER_HEIGHT_HOME: number = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
export const PAGE_WIDTH = 75;
