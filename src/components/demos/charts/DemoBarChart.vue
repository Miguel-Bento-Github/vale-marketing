<template>
  <div class="demo-bar-chart" :style="{ width: '100%', height: height + 'px' }">
    <svg ref="svgRef"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3-array';

interface DataPoint {
  x: string;
  y: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
  color?: string;
  hoverColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  color: '#6d28d9',
  hoverColor: '#8b5cf6',
});

const svgRef = ref<SVGSVGElement>();
const margin = { top: 20, right: 20, bottom: 40, left: 40 };

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

  const xScale = scaleBand()
    .domain(props.data.map((d) => d.x))
    .range([0, w])
    .padding(0.2);

  const yScale = scaleLinear()
    .domain([0, max(props.data, (d) => d.y) || 0])
    .nice()
    .range([h, 0]);

  // Grid
  g.append('g')
    .attr('class', 'grid')
    .call(axisLeft(yScale).tickSize(-w).tickFormat(() => ''))
    .style('stroke-dasharray', '3,3')
    .style('opacity', 0.2);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${h})`)
    .call(axisBottom(xScale))
    .selectAll('text')
    .style('fill', getTextColor())
    .style('font-size', '11px')
    .attr('text-anchor', 'end')
    .attr('dx', '-.6em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-35)');

  g.append('g')
    .call(axisLeft(yScale).ticks(5))
    .selectAll('text')
    .style('fill', getTextColor())
    .style('font-size', '11px');

  // Bars
  g.selectAll('.bar')
    .data(props.data)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.x)!)
    .attr('width', xScale.bandwidth())
    .attr('y', (d) => yScale(d.y))
    .attr('height', (d) => h - yScale(d.y))
    .attr('fill', props.color)
    .attr('rx', 4)
    .attr('ry', 4)
    .style('cursor', 'pointer')
    .on('mouseover', function () {
      select(this).attr('fill', props.hoverColor);
    })
    .on('mouseout', function () {
      select(this).attr('fill', props.color);
    });
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

  const observer = new MutationObserver(createChart);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onUnmounted(() => {
  if (svgRef.value) select(svgRef.value).selectAll('*').remove();
  resizeObserver.value?.disconnect();
});
</script>

<style scoped>
.demo-bar-chart { position: relative; }
.demo-bar-chart svg { display: block; }
:deep(.grid line) { stroke: var(--border-color, #e5e7eb); opacity: 0.5; }
:deep(.grid path) { stroke-width: 0; }
:deep(.domain) { stroke: var(--border-color, #e5e7eb); opacity: 0.5; }
:deep(.tick line) { stroke: var(--border-color, #e5e7eb); opacity: 0.5; }
</style>
