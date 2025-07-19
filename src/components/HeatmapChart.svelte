<script lang="ts">
import { onMount } from "svelte";

export let sortedPosts: Post[] = [];

// 调试：检查接收到的数据
console.log('HeatmapChart received sortedPosts:', sortedPosts?.length || 'undefined');
if (sortedPosts && sortedPosts.length > 0) {
	console.log('First post:', sortedPosts[0]);
	console.log('Sample post dates:', sortedPosts.slice(0, 3).map(p => p.data.published));
}

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

let heatmapData: DayData[] = [];
let hoveredDay: DayData | null = null;
let tooltipPosition = { x: 0, y: 0 };
let totalPosts = 0;
let activeDays = 0;
let maxPostsInDay = 0;
let weeklyData: DayData[][] = [];
let monthLabels: { label: string; span: number }[] = [];

// 响应式计算周数据和月份标签
$: {
	console.log('Reactive update: heatmapData.length =', heatmapData.length);
	weeklyData = getWeeklyData();
	monthLabels = getMonthLabels();
	console.log('weeklyData.length =', weeklyData.length);
	console.log('monthLabels.length =', monthLabels.length);
}

// 获取文章发布的日期范围（显示最近一年的数据，确保最后一个格子是今天）
function getDateRange(): { start: Date; end: Date } {
	// 获取今天的日期字符串，然后创建对应的Date对象
	// 这样可以避免时区问题
	const todayStr = new Date().toISOString().split('T')[0];
	const today = new Date(todayStr + 'T00:00:00.000Z');
	
	// 计算开始日期：往前推364天（总共365天，包含今天）
	const start = new Date(today);
	start.setUTCDate(today.getUTCDate() - 364);
	
	console.log('Date range calculation:', {
		todayStr,
		start: formatDate(start),
		end: formatDate(today),
		totalDays: Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
	});
	
	return { start, end: today };
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

// 获取日期对应的星期几 (0=周日, 1=周一, ...)
function getDayOfWeek(date: Date): number {
	return date.getDay();
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

// 处理鼠标悬停
function handleMouseEnter(event: MouseEvent, day: DayData) {
	hoveredDay = day;
	tooltipPosition = {
		x: event.clientX,
		y: event.clientY,
	};
}

function handleMouseLeave() {
	hoveredDay = null;
}

// 初始化热力图数据
onMount(() => {
	const { start, end } = getDateRange();
	const postsByDate = new Map<string, Post[]>();

	// 按日期分组文章
	sortedPosts.forEach((post) => {
		const dateStr = formatDate(post.data.published);
		if (!postsByDate.has(dateStr)) {
			postsByDate.set(dateStr, []);
		}
		const posts = postsByDate.get(dateStr);
		if (posts) {
			posts.push(post);
		}
	});

	// 调试信息
	console.log('Total posts:', sortedPosts.length);
	console.log('Posts by date:', postsByDate);

	// 生成所有日期的数据
	const data: DayData[] = [];
	const currentDate = new Date(start);
	let maxCount = 0;

	// 确保包含结束日期（今天）- 使用日期字符串比较更可靠
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

		currentDate.setDate(currentDate.getDate() + 1);
	}

	// 调试信息：检查生成的数据
	console.log('Generated data length:', data.length);
	console.log('First date:', data[0]?.date);
	console.log('Last date:', data[data.length - 1]?.date);
	console.log('End date should be:', formatDate(end));

	// 计算活跃度等级和统计信息
	let postsCount = 0;
	let activeDaysCount = 0;

	data.forEach((day) => {
		day.level = getActivityLevel(day.count, maxCount);
		postsCount += day.count;
		if (day.count > 0) {
			activeDaysCount++;
		}
	});

	// 调试信息
	console.log('Max count:', maxCount);
	console.log('Total posts count:', postsCount);
	console.log('Active days:', activeDaysCount);
	console.log('Sample data with levels:', data.filter(d => d.count > 0).slice(0, 5));

	heatmapData = data;
	totalPosts = postsCount;
	activeDays = activeDaysCount;
	maxPostsInDay = maxCount;
});

// 获取月份标签，基于实际的周数分布
function getMonthLabels(): { label: string; span: number }[] {
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
	const monthLabels: { label: string; span: number }[] = [];

	let currentMonth = -1;
	let weekCount = 0;

	weeklyData.forEach((week, _weekIndex) => {
		// 找到这一周中第一个有效日期
		const firstValidDay = week.find((day) => day.date);
		if (firstValidDay) {
			const date = new Date(firstValidDay.date);
			const month = date.getMonth();

			if (month !== currentMonth) {
				if (weekCount > 0) {
					monthLabels[monthLabels.length - 1].span = weekCount;
				}
				monthLabels.push({
					label: months[month],
					span: 0,
				});
				currentMonth = month;
				weekCount = 1;
			} else {
				weekCount++;
			}
		}
	});

	// 设置最后一个月的跨度
	if (monthLabels.length > 0 && weekCount > 0) {
		monthLabels[monthLabels.length - 1].span = weekCount;
	}

	return monthLabels;
}

// 按周分组数据，确保最后一个格子是今天
function getWeeklyData(): DayData[][] {
	console.log('getWeeklyData called, heatmapData.length:', heatmapData.length);
	if (heatmapData.length === 0) {
		console.log('Returning empty array because heatmapData is empty');
		return [];
	}

	const weeks: DayData[][] = [];
	let currentWeek: DayData[] = [];

	// 找到第一个周日作为起始点
	const firstDate = new Date(heatmapData[0].date);
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
		const date = new Date(day.date);
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
		<h3 class="text-lg font-bold text-75">文章发布</h3>
		<div class="heatmap-stats">
			<span class="stat-item text-50">总计 <strong class="text-75">{totalPosts}</strong> 篇文章</span>
			<span class="stat-item text-50">活跃 <strong class="text-75">{activeDays}</strong> 天</span>
			<span class="stat-item text-50">最多 <strong class="text-75">{maxPostsInDay}</strong> 篇/天</span>
		</div>
	</div>
	
	<!-- 月份标签 -->
	<div class="month-labels">
		{#each monthLabels as month}
			<span class="month-label text-50" style="flex: {month.span}">{month.label}</span>
		{/each}
	</div>
	
	<!-- 热力图网格 -->
	<div class="heatmap-grid">
		<!-- 星期标签 -->
		<div class="weekday-labels">
			<span class="weekday-label text-50">Sun</span>
			<span class="weekday-label text-50">Mon</span>
			<span class="weekday-label text-50">Tue</span>
			<span class="weekday-label text-50">Wed</span>
			<span class="weekday-label text-50">Thu</span>
			<span class="weekday-label text-50">Fri</span>
			<span class="weekday-label text-50">Sat</span>
		</div>
		
		<!-- 热力图方块 -->
		<div class="heatmap-weeks">
			{#each weeklyData as week}
				<div class="heatmap-week">
					{#each week as day}
						<div
						class="heatmap-day level-{day.level}"
						class:empty={!day.date}
						data-date={day.date}
						on:mouseenter={(e) => day.date && handleMouseEnter(e, day)}
					on:mouseleave={handleMouseLeave}
					role="button"
					tabindex="0"
						title={day.date ? `${day.date}: ${day.count} 篇文章` : ''}
					></div>
					{/each}
				</div>
			{/each}
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
		style="left: {tooltipPosition.x + 10}px; top: {tooltipPosition.y - 10}px;"
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
		gap: 1rem;
		font-size: 0.875rem;
	}
	
	.stat-item {
		white-space: nowrap;
	}
	
	.month-labels {
		display: flex;
		margin-bottom: 0.5rem;
		padding-left: 2rem;
	}
	
	.month-label {
		flex: 1;
		font-size: 0.75rem;
		text-align: center;
	}
	
	.heatmap-grid {
		display: flex;
		gap: 0.5rem;
	}
	
	.weekday-labels {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 1.5rem;
	}
	
	.weekday-label {
		height: 10px;
		font-size: 0.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.heatmap-weeks {
		display: flex;
		gap: 2px;
		flex: 1;
	}
	
	.heatmap-week {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}
	
	.heatmap-day {
		width: 10px;
		height: 10px;
		border-radius: 2px;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.heatmap-day:hover:not(.empty) {
		transform: scale(1.2);
		z-index: 10;
		position: relative;
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
		width: 10px;
		height: 10px;
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
		
		.heatmap-day {
			width: 8px;
			height: 8px;
		}
		
		.legend-level {
			width: 8px;
			height: 8px;
		}
		
		.weekday-label {
			height: 8px;
			font-size: 0.5rem;
		}
		
		.month-label {
			font-size: 0.6rem;
		}
	}
</style>