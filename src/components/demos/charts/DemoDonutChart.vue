<template>
  <div class="demo-donut-chart" :style="{ width: '100%', height: height + 'px' }">
    <svg ref="svgRef"></svg>
    <div v-if="showLegend" class="legend">
      <div
        v-for="(item, index) in legendData"
        :key="index"
        class="legend-item"
        :class="{ disabled: item.disabled }"
        @click="toggleSegment(index)"
        @mouseenter="highlightSegment(index)"
        @mouseleave="unhighlightSegment()"
      >
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <span class="legend-text">{{ item.label }} ({{ item.value }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { pie, arc } from 'd3-shape';
import { sum } from 'd3-array';
import { interpolate } from 'd3-interpolate';
import 'd3-transition';

interface DataPoint {
  label: string;
  value: number;
}

interface LegendItem {
  label: string;
  value: number;
  color: string;
  disabled: boolean;
}

interface Props {
  data: DataPoint[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  height: 320,
  colors: () => ['#6d28d9', '#388e3c', '#f57c00', '#1976d2', '#d32f2f', '#0097a7', '#689f38'],
  innerRadius: 50,
  outerRadius: 100,
  showLegend: true,
});

const svgRef = ref<SVGSVGElement>();
const legendData = ref<LegendItem[]>([]);
const currentRadii = ref({ inner: props.innerRadius, outer: props.outerRadius });

const filteredData = computed(() => {
  return props.data.filter((_, index) => !legendData.value[index]?.disabled);
});

const createChart = () => {
  if (!svgRef.value || !props.data.length) return;

  const svg = select(svgRef.value);
  svg.selectAll('*').remove();

  const containerWidth = svgRef.value.parentElement?.clientWidth || 300;
  const chartHeight = props.height - (props.showLegend ? 80 : 0);
  const radius = Math.min(containerWidth, chartHeight) / 2 - 10;
  const responsiveOuter = Math.min(radius, props.outerRadius);
  const responsiveInner = Math.min(props.innerRadius, responsiveOuter * 0.5);

  currentRadii.value = { inner: responsiveInner, outer: responsiveOuter };

  const g = svg
    .attr('width', containerWidth)
    .attr('height', chartHeight)
    .append('g')
    .attr('transform', `translate(${containerWidth / 2},${chartHeight / 2})`);

  const color = scaleOrdinal<string>()
    .domain(props.data.map((d) => d.label))
    .range(props.colors);

  const pieGen = pie<DataPoint>()
    .value((d) => d.value)
    .sort(null);

  const arcGen = arc<d3.PieArcDatum<DataPoint>>().innerRadius(responsiveInner).outerRadius(responsiveOuter);
  const arcHover = arc<d3.PieArcDatum<DataPoint>>().innerRadius(responsiveInner).outerRadius(responsiveOuter + 8);

  const pieData = pieGen(filteredData.value);

  const paths = g
    .selectAll('path')
    .data(pieData)
    .enter()
    .append('path')
    .attr('fill', (d) => color(d.data.label))
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer');

  paths
    .transition()
    .duration(600)
    .attrTween('d', function (d) {
      const i = interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arcGen(i(t) as d3.PieArcDatum<DataPoint>) || '';
      };
    });

  paths
    .on('mouseover', function (_event, d) {
      select(this).transition().duration(200).attr('d', arcHover(d) || '');
      paths.filter((otherD) => otherD !== d).style('opacity', 0.5);
    })
    .on('mouseout', function (_event, d) {
      select(this).transition().duration(200).attr('d', arcGen(d) || '');
      paths.style('opacity', 1);
    });

  // Percentage labels
  g.selectAll('text')
    .data(pieData)
    .enter()
    .append('text')
    .attr('transform', (d) => `translate(${arcGen.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .style('font-size', '13px')
    .style('fill', 'white')
    .style('font-weight', 'bold')
    .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)')
    .text((d) => {
      const total = sum(filteredData.value, (d) => d.value);
      const pct = Math.round((d.data.value / total) * 100);
      return pct > 5 ? `${pct}%` : '';
    });

  legendData.value = props.data.map((item, index) => ({
    label: item.label,
    value: item.value,
    color: color(item.label),
    disabled: legendData.value?.[index]?.disabled || false,
  }));
};

const toggleSegment = (index: number) => {
  if (legendData.value[index]) {
    legendData.value[index].disabled = !legendData.value[index].disabled;
  }
  createChart();
};

const highlightSegment = (index: number) => {
  if (!svgRef.value) return;
  const paths = select(svgRef.value).selectAll('path');
  const arcHover = arc<d3.PieArcDatum<DataPoint>>()
    .innerRadius(currentRadii.value.inner)
    .outerRadius(currentRadii.value.outer + 8);

  paths.each(function (d, i) {
    const p = select(this);
    if (i === index) {
      p.transition().duration(200).attr('d', arcHover(d as d3.PieArcDatum<DataPoint>) || '');
    } else {
      p.style('opacity', 0.5);
    }
  });
};

const unhighlightSegment = () => {
  if (!svgRef.value) return;
  const paths = select(svgRef.value).selectAll('path');
  const arcGen = arc<d3.PieArcDatum<DataPoint>>()
    .innerRadius(currentRadii.value.inner)
    .outerRadius(currentRadii.value.outer);

  paths.each(function (d) {
    select(this)
      .transition()
      .duration(200)
      .attr('d', arcGen(d as d3.PieArcDatum<DataPoint>) || '')
      .style('opacity', 1);
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
.demo-donut-chart {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.demo-donut-chart svg { display: block; }
.legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 12px; }
.legend-item { display: flex; align-items: center; gap: 6px; cursor: pointer; transition: opacity 0.2s; }
.legend-item:hover { opacity: 0.8; }
.legend-item.disabled { opacity: 0.4; }
.legend-color { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.legend-text { font-size: 12px; color: var(--text-tertiary, #6b7280); }
</style>
