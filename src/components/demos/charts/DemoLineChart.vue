<template>
  <div class="demo-line-chart" :style="{ width: '100%', height: height + 'px' }">
    <svg ref="svgRef"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line, area, curveMonotoneX } from 'd3-shape';
import { extent } from 'd3-array';
import { timeParse, timeFormat } from 'd3-time-format';

interface DataPoint {
  x: string | number;
  y: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
  color?: string;
  showArea?: boolean;
  showDots?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  color: '#6d28d9',
  showArea: true,
  showDots: true,
});

const svgRef = ref<SVGSVGElement>();
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

const isDark = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

const getTextColor = () => isDark() ? '#d1d5db' : '#4b5563';

const createChart = () => {
  if (!svgRef.value || !props.data.length) return;

  const svg = select(svgRef.value);
  svg.selectAll('*').remove();

  const containerWidth = svgRef.value.parentElement?.clientWidth || 600;
  const w = containerWidth - margin.left - margin.right;
  const h = props.height - margin.top - margin.bottom;

  const g = svg
    .attr('width', containerWidth)
    .attr('height', props.height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const parseTime = timeParse('%Y-%m-%d');
  const parsedData = props.data.map((d) => ({
    x: typeof d.x === 'string' ? parseTime(d.x) || new Date(d.x) : new Date(d.x),
    y: d.y,
  }));

  const xScale = scaleTime()
    .domain(extent(parsedData, (d) => d.x) as [Date, Date])
    .range([0, w]);

  const yScale = scaleLinear()
    .domain(extent(parsedData, (d) => d.y) as [number, number])
    .nice()
    .range([h, 0]);

  const lineGen = line<{ x: Date; y: number }>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(curveMonotoneX);

  if (props.showArea) {
    const areaGen = area<{ x: Date; y: number }>()
      .x((d) => xScale(d.x))
      .y0(h)
      .y1((d) => yScale(d.y))
      .curve(curveMonotoneX);

    g.append('path')
      .datum(parsedData)
      .attr('fill', props.color)
      .attr('fill-opacity', 0.15)
      .attr('d', areaGen);
  }

  // Grid
  g.append('g')
    .attr('class', 'grid')
    .call(axisLeft(yScale).tickSize(-w).tickFormat(() => ''))
    .style('stroke-dasharray', '3,3')
    .style('opacity', 0.2);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(axisBottom(xScale).ticks(6).tickFormat((d) => timeFormat('%b %d')(d as Date)))
    .selectAll('text')
    .style('fill', getTextColor())
    .style('font-size', '11px');

  g.append('g')
    .call(axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`))
    .selectAll('text')
    .style('fill', getTextColor())
    .style('font-size', '11px');

  // Line
  g.append('path')
    .datum(parsedData)
    .attr('fill', 'none')
    .attr('stroke', props.color)
    .attr('stroke-width', 2.5)
    .attr('d', lineGen);

  // Dots
  if (props.showDots) {
    g.selectAll('.dot')
      .data(parsedData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 3)
      .attr('fill', props.color);
  }
};

const resizeObserver = ref<ResizeObserver | null>(null);
let resizeTimeout: ReturnType<typeof setTimeout>;

onMounted(async () => {
  await nextTick();
  createChart();

  if (svgRef.value?.parentElement) {
    resizeObserver.value = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(createChart, 100);
    });
    resizeObserver.value.observe(svgRef.value.parentElement);
  }

  // Listen for theme changes (site uses .dark class on <html>)
  const observer = new MutationObserver(createChart);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onUnmounted(() => {
  if (svgRef.value) select(svgRef.value).selectAll('*').remove();
  resizeObserver.value?.disconnect();
});
</script>

<style scoped>
.demo-line-chart { position: relative; }
.demo-line-chart svg { display: block; }
:deep(.grid line) { stroke: var(--border-color, #e5e7eb); opacity: 0.5; }
:deep(.grid path) { stroke-width: 0; }
:deep(.domain) { stroke: var(--border-color, #e5e7eb); opacity: 0.5; }
:deep(.tick line) { stroke: var(--border-color, #e5e7eb); opacity: 0.5; }
</style>
