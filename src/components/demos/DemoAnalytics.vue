<template>
  <div class="demo-analytics">
    <!-- Header -->
    <div class="analytics-header">
      <span class="analytics-title">Analytics Overview</span>
      <div class="period-selector">
        <button
          v-for="p in periods"
          :key="p.value"
          class="period-btn"
          :class="{ active: activePeriod === p.value }"
          @click="activePeriod = p.value"
        >{{ p.label }}</button>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="metrics-row">
      <div v-for="m in metrics" :key="m.label" class="metric-card">
        <div class="metric-icon" :style="{ background: m.bg }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="m.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="m.icon"></svg>
        </div>
        <div class="metric-info">
          <span class="metric-value">{{ m.value }}</span>
          <span class="metric-label">{{ m.label }}</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <div class="chart-card chart-wide">
        <div class="chart-title">Slot Utilization (%)</div>
        <DemoLineChart :data="utilizationTrend" :height="220" color="#6d28d9" :show-area="true" :show-dots="false" />
      </div>
      <div class="chart-card chart-narrow">
        <div class="chart-title">Booking Status</div>
        <DemoDonutChart :data="bookingStatusBreakdown" :height="280" :inner-radius="45" :outer-radius="85" />
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="charts-row">
      <div class="chart-card chart-half">
        <div class="chart-title">Daily Bookings</div>
        <DemoBarChart :data="dailyBookings" :height="200" color="#6d28d9" hover-color="#8b5cf6" />
      </div>
      <div class="chart-card chart-half">
        <div class="chart-title">Top Locations</div>
        <div class="top-locations">
          <div v-for="(loc, i) in topLocations" :key="loc.name" class="location-row">
            <div class="location-rank" :style="{ background: rankColors[i] }">{{ i + 1 }}</div>
            <div class="location-info">
              <span class="location-name">{{ loc.name }}</span>
              <div class="location-bar-bg">
                <div class="location-bar" :style="{ width: loc.percentage, background: rankColors[i] }"></div>
              </div>
            </div>
            <div class="location-stats">
              <span class="location-count">{{ loc.count }}</span>
              <span class="location-pct">{{ loc.percentage }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DemoLineChart from './charts/DemoLineChart.vue';
import DemoBarChart from './charts/DemoBarChart.vue';
import DemoDonutChart from './charts/DemoDonutChart.vue';
import {
  analyticsOverview,
  utilizationTrend,
  bookingStatusBreakdown,
  dailyBookings,
  topLocations,
} from '../../data/demo-data';

const periods = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '3m', value: '3m' },
  { label: '1y', value: '1y' },
];
const activePeriod = ref('30d');

const rankColors = ['#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const metrics = [
  {
    label: 'Total Users',
    value: analyticsOverview.totalUsers.toLocaleString(),
    color: '#6d28d9',
    bg: 'rgba(109,40,217,0.1)',
    icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    label: 'Total Bookings',
    value: analyticsOverview.totalBookings.toLocaleString(),
    color: '#1976d2',
    bg: 'rgba(25,118,210,0.1)',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  },
  {
    label: 'Revenue',
    value: `€${analyticsOverview.totalRevenue.toLocaleString()}`,
    color: '#388e3c',
    bg: 'rgba(56,142,60,0.1)',
    icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  },
  {
    label: 'Active Locations',
    value: analyticsOverview.activeLocations.toString(),
    color: '#f57c00',
    bg: 'rgba(245,124,0,0.1)',
    icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  },
];
</script>

<style scoped>
.demo-analytics {
  background: var(--demo-surface, #ffffff);
  border-radius: 12px;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: var(--text, #1f2937);
  border: 1px solid var(--border, #e5e7eb);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.analytics-title { font-weight: 700; font-size: 16px; }

.period-selector { display: flex; gap: 2px; background: var(--demo-surface-hover, #f3f4f6); border-radius: 8px; padding: 2px; }
.period-btn {
  padding: 4px 12px; border-radius: 6px; border: none;
  background: transparent; color: var(--demo-text-muted, #6b7280);
  font-size: 12px; font-weight: 500; cursor: pointer;
}
.period-btn.active { background: #6d28d9; color: white; }

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 640px) {
  .metrics-row { grid-template-columns: repeat(2, 1fr); }
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: var(--demo-surface-elevated, #f9fafb);
  border: 1px solid var(--demo-border-light, #f3f4f6);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-info { display: flex; flex-direction: column; }
.metric-value { font-size: 20px; font-weight: 700; line-height: 1.2; }
.metric-label { font-size: 11px; color: var(--demo-text-muted, #6b7280); }

.charts-row {
  display: flex;
  gap: 16px;
}

@media (max-width: 768px) {
  .charts-row { flex-direction: column; }
}

.chart-card {
  border-radius: 10px;
  background: var(--demo-surface-elevated, #f9fafb);
  border: 1px solid var(--demo-border-light, #f3f4f6);
  padding: 14px;
  overflow: hidden;
}

.chart-wide { flex: 3; min-width: 0; }
.chart-narrow { flex: 2; min-width: 0; }
.chart-half { flex: 1; min-width: 0; }

.chart-title { font-weight: 600; font-size: 13px; margin-bottom: 12px; }

/* Top Locations */
.top-locations { display: flex; flex-direction: column; gap: 10px; }

.location-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.location-rank {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.location-info { flex: 1; min-width: 0; }
.location-name { font-size: 12px; font-weight: 500; display: block; margin-bottom: 4px; }
.location-bar-bg {
  height: 4px;
  background: var(--demo-border-light, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}
.location-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.location-stats { text-align: right; flex-shrink: 0; }
.location-count { font-weight: 700; font-size: 13px; display: block; }
.location-pct { font-size: 10px; color: var(--demo-text-muted, #6b7280); }

/* Use site theme variables */
.demo-analytics {
  --demo-surface: var(--bg-primary, #ffffff);
  --demo-surface-elevated: var(--bg-secondary, #f9fafb);
  --demo-surface-hover: var(--bg-tertiary, #f3f4f6);
  --demo-border: var(--border-color, #e5e7eb);
  --demo-border-light: var(--bg-tertiary, #f3f4f6);
  --demo-text: var(--text-primary, #1f2937);
  --demo-text-muted: var(--text-tertiary, #6b7280);
}
</style>
