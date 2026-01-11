<script lang="ts">
import { onMount } from "svelte";

export let sortedPosts: Post[] = [];
export let year: number = new Date().getUTCFullYear();

// 接收文章数据、总文章数和所有文章数据作为属性

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string;
		published: Date;
	};
}

interface DayData {
	date: string;
	count: number;
	level: number; // 0-4 表示活跃度等级
	posts: Post[];
}

interface MonthLabel {
	label: string;
	start: number; // 1-based grid column start
	span: number; // how many week columns
}

let heatmapData: DayData[] = [];
let hoveredDay: DayData | null = null;
let tooltipPosition = { x: 0, y: 0 };
let activeDays = 0;
let maxPostsInDay = 0;
let weeklyData: DayData[][] = [];
let monthLabels: MonthLabel[] = [];

let totalPostsCount = 0;

let currentStreak = 0;
let longestStreak = 0;
let avgPerActiveDay = 0;
let avgPerDay = 0;

// 响应式计算周数据和月份标签
// 注意：Svelte 的依赖追踪是静态的，需要显式引用 heatmapData
$: {
	heatmapData.length;
	weeklyData = getWeeklyData();
}
$: {
	heatmapData.length;
	monthLabels = getMonthLabels();
}

function parseDate(dateStr: string): Date {
	return new Date(`${dateStr}T00:00:00.000Z`);
}

function getTodayUtcStart(): Date {
	const todayStr = new Date().toISOString().split("T")[0];
	return parseDate(todayStr);
}

// 获取指定年份的日期范围：从 1/1 到（今年为今天，否则为 12/31）
function getDateRange(targetYear: number): { start: Date; end: Date } {
	const start = new Date(Date.UTC(targetYear, 0, 1));
	const endOfYear = new Date(Date.UTC(targetYear, 11, 31));
	const today = getTodayUtcStart();

	const isCurrentYear = targetYear === today.getUTCFullYear();
	const end = isCurrentYear && today < endOfYear ? today : endOfYear;

	return { start, end };
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

// 获取日期对应的星期几 (0=周日, 1=周一, ...)
function getDayOfWeek(date: Date): number {
	return date.getUTCDay();
}

// 计算活跃度等级 (0-4)
function getActivityLevel(count: number, maxCount: number): number {
	if (count === 0) return 0;
	if (maxCount === 0) return 0;

	const ratio = count / maxCount;
	if (ratio >= 0.75) return 4;
	if (ratio >= 0.5) return 3;
	if (ratio >= 0.25) return 2;
	return 1;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function setTooltipPosition(clientX: number, clientY: number) {
	const margin = 8;
	const estimatedWidth = 240;
	const estimatedHeight = 160;

	const x = clamp(
		clientX + 12,
		margin,
		window.innerWidth - estimatedWidth - margin,
	);
	const y = clamp(
		clientY - 12,
		margin,
		window.innerHeight - estimatedHeight - margin,
	);

	tooltipPosition = { x, y };
}

// 处理鼠标悬停
function handleMouseEnter(event: MouseEvent, day: DayData) {
	hoveredDay = day;
	setTooltipPosition(event.clientX, event.clientY);
}

function handleMouseMove(event: MouseEvent) {
	if (!hoveredDay) return;
	setTooltipPosition(event.clientX, event.clientY);
}

function handleMouseLeave() {
	hoveredDay = null;
}

function handleFocus(event: FocusEvent, day: DayData) {
	hoveredDay = day;
	const el = event.currentTarget;
	if (!(el instanceof HTMLElement)) return;
	const rect = el.getBoundingClientRect();
	setTooltipPosition(rect.left + rect.width / 2, rect.top);
}

function handleBlur() {
	hoveredDay = null;
}

// 初始化热力图数据
onMount(() => {
	const { start, end } = getDateRange(year);
	const postsByDate = new Map<string, Post[]>();
	const startStr = formatDate(start);
	const endStr = formatDate(end);

	// 按日期分组文章（用于热力图显示）
	sortedPosts.forEach((post) => {
		// 安全检查：确保 post 和 post.data 存在，且 published 属性存在
		if (!post || !post.data || !post.data.published) {
			console.warn("Invalid post data structure:", post);
			return;
		}
		const dateStr = formatDate(post.data.published);
		if (dateStr < startStr || dateStr > endStr) return;
		if (!postsByDate.has(dateStr)) {
			postsByDate.set(dateStr, []);
		}
		const posts = postsByDate.get(dateStr);
		if (posts) {
			posts.push(post);
		}
	});

	// 生成所有日期的数据
	const data: DayData[] = [];
	const currentDate = new Date(start);
	let maxCount = 0;

	const endDateStr = formatDate(end);
	while (true) {
		const dateStr = formatDate(currentDate);
		const posts = postsByDate.get(dateStr) || [];
		const count = posts.length;

		if (count > maxCount) {
			maxCount = count;
		}

		data.push({
			date: dateStr,
			count,
			level: 0, // 稍后计算
			posts,
		});

		// 如果已经处理了结束日期，退出循环
		if (dateStr === endDateStr) {
			break;
		}

		currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	}

	// 计算活跃度等级和统计信息
	let postsCount = 0;
	let activeDaysCount = 0;
	let maxPostsInDayYear = 0;

	data.forEach((day) => {
		day.level = getActivityLevel(day.count, maxCount);
		postsCount += day.count;
		if (day.count > 0) {
			activeDaysCount++;
		}
		if (day.count > maxPostsInDayYear) {
			maxPostsInDayYear = day.count;
		}
	});

	// streak 计算：以 date 数组为序（连续自然日）
	let current = 0;
	let longest = 0;
	for (const day of data) {
		if (day.count > 0) {
			current++;
			if (current > longest) longest = current;
		} else {
			current = 0;
		}
	}

	heatmapData = data;
	totalPostsCount = postsCount;
	activeDays = activeDaysCount;
	maxPostsInDay = maxPostsInDayYear;
	longestStreak = longest;
	currentStreak =
		data.length > 0 && data[data.length - 1].count > 0 ? current : 0;
	avgPerActiveDay = activeDaysCount > 0 ? postsCount / activeDaysCount : 0;
	avgPerDay = data.length > 0 ? postsCount / data.length : 0;
});

// 获取月份标签，基于实际的周数分布
function getMonthLabels(): MonthLabel[] {
	if (heatmapData.length === 0) return [];

	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const weeklyData = getWeeklyData();
	const monthLabels: MonthLabel[] = [];

	let currentMonth = -1;

	weeklyData.forEach((week, weekIndex) => {
		// 找到这一周中第一个有效日期
		const firstValidDay = week.find((day) => day.date);
		if (firstValidDay) {
			const date = parseDate(firstValidDay.date);
			const month = date.getUTCMonth();

			if (month !== currentMonth) {
				monthLabels.push({
					label: months[month],
					start: weekIndex + 2,
					span: 1,
				});
				currentMonth = month;
			} else {
				const last = monthLabels[monthLabels.length - 1];
				if (last) last.span++;
			}
		}
	});

	return monthLabels;
}

// 按周分组数据，确保最后一个格子是今天
function getWeeklyData(): DayData[][] {
	if (heatmapData.length === 0) {
		return [];
	}

	const weeks: DayData[][] = [];
	let currentWeek: DayData[] = [];

	// 找到第一个周日作为起始点
	const firstDate = parseDate(heatmapData[0].date);
	const firstDayOfWeek = getDayOfWeek(firstDate);

	// 填充第一周前面的空白
	for (let i = 0; i < firstDayOfWeek; i++) {
		currentWeek.push({
			date: "",
			count: 0,
			level: 0,
			posts: [],
		});
	}

	heatmapData.forEach((day, index) => {
		const date = parseDate(day.date);
		const dayOfWeek = getDayOfWeek(date);

		currentWeek.push(day);

		// 如果是周六，结束当前周
		if (dayOfWeek === 6) {
			weeks.push([...currentWeek]);
			currentWeek = [];
		}
		// 如果是最后一天且不是周六，填充剩余空白并结束
		else if (index === heatmapData.length - 1) {
			// 填充剩余的空白到周六
			while (currentWeek.length < 7) {
				currentWeek.push({
					date: "",
					count: 0,
					level: 0,
					posts: [],
				});
			}
			weeks.push([...currentWeek]);
		}
	});

	return weeks;
}
</script>

<div class="heatmap-container">
	<div class="heatmap-header">
		<h3 class="text-lg font-bold text-75">{year} 年更新</h3>
		<div class="heatmap-stats">
			<span class="stat-item text-50">总计 <strong class="text-75">{totalPostsCount}</strong> 篇文章</span>
			<span class="stat-item text-50">更新 <strong class="text-75">{activeDays}</strong> 天</span>
			<span class="stat-item text-50">最多 <strong class="text-75">{maxPostsInDay}</strong> 篇/天</span>
			<span class="stat-item text-50">连续 <strong class="text-75">{currentStreak}</strong> 天</span>
			<span class="stat-item text-50">最长连续 <strong class="text-75">{longestStreak}</strong> 天</span>
			<span class="stat-item text-50">平均 <strong class="text-75">{avgPerDay.toFixed(2)}</strong> 篇/天</span>
		</div>
	</div>
	
	<div class="heatmap-scroll">
		<!-- 月份标签 -->
		<div class="month-labels" style="--week-count: {weeklyData.length}">
			{#each monthLabels as month}
				{#if month.span > 1}
					<span class="month-label text-50" style="grid-column: {month.start} / span {month.span}">{month.label}</span>
				{/if}
			{/each}
		</div>

		<!-- 热力图网格 -->
		<div class="heatmap-grid" style="--week-count: {weeklyData.length}">
			<!-- 星期标签 -->
			<div class="weekday-labels" aria-hidden="true">
				<span class="weekday-label text-50"></span>
				<span class="weekday-label text-50">Mon</span>
				<span class="weekday-label text-50"></span>
				<span class="weekday-label text-50">Wed</span>
				<span class="weekday-label text-50"></span>
				<span class="weekday-label text-50">Fri</span>
				<span class="weekday-label text-50"></span>
			</div>

			<!-- 热力图方块 -->
			<div class="heatmap-weeks" role="grid" aria-label={`${year} 年文章更新热力图`} tabindex="0" on:mousemove={handleMouseMove}>
				{#each weeklyData as week}
					<div class="heatmap-week" role="presentation">
						{#each week as day}
							<div
								class="heatmap-day level-{day.level}"
								class:empty={!day.date}
								data-date={day.date}
								on:mouseenter={(e) => day.date && handleMouseEnter(e, day)}
								on:mouseleave={handleMouseLeave}
								on:focus={(e) => day.date && handleFocus(e, day)}
								on:blur={handleBlur}
								role="gridcell"
								tabindex={day.date ? 0 : -1}
								aria-label={day.date ? `${day.date}，${day.count} 篇文章` : ""}
								title={day.date ? `${day.date}: ${day.count} 篇文章` : ""}
							></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<!-- 图例 -->
	<div class="heatmap-legend">
		<span class="legend-text text-50">Less</span>
		<div class="legend-levels">
			<div class="legend-level level-0"></div>
			<div class="legend-level level-1"></div>
			<div class="legend-level level-2"></div>
			<div class="legend-level level-3"></div>
			<div class="legend-level level-4"></div>
		</div>
		<span class="legend-text text-50">More</span>
	</div>
</div>

<!-- 悬停提示框 -->
{#if hoveredDay}
	<div 
		class="tooltip"
		style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
	>
		<div class="tooltip-date">{hoveredDay.date}</div>
		<div class="tooltip-count">
			{hoveredDay.count} 篇文章
		</div>
		{#if hoveredDay.posts.length > 0}
			<div class="tooltip-posts">
				{#each hoveredDay.posts.slice(0, 3) as post}
					<div class="tooltip-post">• {post.data.title}</div>
				{/each}
				{#if hoveredDay.posts.length > 3}
					<div class="tooltip-more">还有 {hoveredDay.posts.length - 3} 篇...</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.heatmap-container {
		--cell: 10px;
		--gap: 2px;
		padding: 1rem;
		border-radius: var(--radius-large);
		background: var(--card-bg);
		margin-bottom: 1.5rem;
	}
	
	.heatmap-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	
	.heatmap-stats {
		display: flex;
		gap: 0.75rem;
		font-size: 0.875rem;
		flex-wrap: wrap;
	}
	
	.stat-item {
		white-space: nowrap;
	}
	
	.heatmap-scroll {
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 0.25rem;
		-webkit-overflow-scrolling: touch;
	}

	.month-labels {
		display: grid;
		grid-template-columns: 1.5rem repeat(var(--week-count), var(--cell));
		column-gap: var(--gap);
		align-items: center;
		margin-bottom: 0.5rem;
		min-width: calc(1.5rem + (var(--week-count) * var(--cell)) + ((var(--week-count) - 1) * var(--gap)));
	}
	
	.month-label {
		font-size: 0.75rem;
		text-align: left;
		padding-left: 2px;
		white-space: nowrap;
	}
	
	.heatmap-grid {
		display: flex;
		gap: 0.5rem;
		min-width: calc(1.5rem + (var(--week-count) * var(--cell)) + ((var(--week-count) - 1) * var(--gap)));
	}
	
	.weekday-labels {
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		width: 1.5rem;
	}
	
	.weekday-label {
		height: var(--cell);
		font-size: 0.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.heatmap-weeks {
		display: flex;
		gap: var(--gap);
		flex: 1;
	}
	
	.heatmap-week {
		display: flex;
		flex-direction: column;
		gap: var(--gap);
	}
	
	.heatmap-day {
		width: var(--cell);
		height: var(--cell);
		border-radius: 2px;
		cursor: pointer;
		outline: none;
		transition: transform 120ms ease, box-shadow 120ms ease;
	}

	.heatmap-day:not(.empty):hover {
		transform: translateY(-1px);
		box-shadow: 0 0 0 2px oklch(0.82 0.06 var(--hue) / 0.35);
	}

	.heatmap-day:not(.empty):focus-visible {
		box-shadow: 0 0 0 2px var(--primary);
	}
	
	.heatmap-day.empty {
		visibility: hidden;
	}
	
	/* 活跃度等级样式 */
	.level-0 {
		background-color: oklch(0.95 0.01 var(--hue));
	}
	
	.level-1 {
		background-color: oklch(0.85 0.05 var(--hue));
	}
	
	.level-2 {
		background-color: oklch(0.75 0.1 var(--hue));
	}
	
	.level-3 {
		background-color: oklch(0.65 0.15 var(--hue));
	}
	
	.level-4 {
		background-color: var(--primary);
	}
	
	.heatmap-legend {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.25rem;
		margin-top: 0.5rem;
		font-size: 0.75rem;
	}
	
	.legend-levels {
		display: flex;
		gap: 2px;
	}
	
	.legend-level {
		width: var(--cell);
		height: var(--cell);
		border-radius: 2px;
	}
	
	.tooltip {
		position: fixed;
		background: var(--float-panel-bg);
		border: 1px solid oklch(0.9 0.02 var(--hue));
		border-radius: var(--radius-large);
		padding: 0.5rem;
		font-size: 0.75rem;
		z-index: 1000;
		pointer-events: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		max-width: 200px;
	}
	
	.tooltip-date {
		font-weight: bold;
		margin-bottom: 0.25rem;
		color: var(--primary);
	}
	
	.tooltip-count {
		margin-bottom: 0.25rem;
	}
	
	.tooltip-posts {
		border-top: 1px solid oklch(0.9 0.02 var(--hue));
		padding-top: 0.25rem;
	}
	
	.tooltip-post {
		margin-bottom: 0.125rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.tooltip-more {
		font-style: italic;
		opacity: 0.7;
	}
	
	@media (max-width: 768px) {
		.heatmap-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}
		
		.heatmap-stats {
			flex-wrap: wrap;
			gap: 0.5rem;
			font-size: 0.75rem;
		}
		
		.weekday-label {
			font-size: 0.5rem;
		}
		
		.month-label {
			font-size: 0.6rem;
		}
	}

	@media (max-width: 768px) {
		.heatmap-container {
			--cell: 8px;
			--gap: 2px;
		}
	}
</style>
