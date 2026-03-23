<template>
  <div class="demo-calendar">
    <!-- Header -->
    <div class="calendar-header">
      <div class="header-left">
        <button class="nav-btn" @click="prevMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="month-label">March 2026</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button class="today-btn">Today</button>
      </div>
      <div class="view-toggle">
        <button
          v-for="v in views"
          :key="v"
          class="view-btn"
          :class="{ active: currentView === v }"
          @click="currentView = v"
        >{{ v }}</button>
      </div>
    </div>

    <!-- Month View -->
    <div v-if="currentView === 'Month'" class="month-grid">
      <div v-for="d in dayNames" :key="d" class="day-name">{{ d }}</div>
      <div
        v-for="(day, i) in calendarData"
        :key="i"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'is-today': day.isToday,
          'has-bookings': day.bookings.length > 0,
        }"
        @click="selectedDay = day.isCurrentMonth ? day.date : null"
      >
        <span class="day-number">{{ day.date }}</span>
        <div class="day-bookings">
          <div
            v-for="(b, bi) in day.bookings.slice(0, 3)"
            :key="bi"
            class="booking-chip"
            :class="b.status.toLowerCase().replace('_', '-')"
          >
            {{ b.label }}
          </div>
          <div v-if="day.bookings.length > 3" class="more-label">+{{ day.bookings.length - 3 }} more</div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div v-else-if="currentView === 'Week'" class="week-grid">
      <div class="week-time-col">
        <div class="week-corner"></div>
        <div v-for="h in weekHours" :key="h" class="week-hour-label">{{ formatHour(h) }}</div>
      </div>
      <div v-for="(day, di) in weekDays" :key="di" class="week-day-col">
        <div class="week-day-header" :class="{ 'is-today': day.isToday }">
          <span class="week-day-name">{{ dayNamesShort[di] }}</span>
          <span class="week-day-num">{{ day.date }}</span>
        </div>
        <div class="week-day-grid">
          <div v-for="h in weekHours" :key="h" class="week-hour-slot"></div>
          <div
            v-for="(b, bi) in day.bookings.slice(0, 4)"
            :key="bi"
            class="week-booking"
            :class="b.status.toLowerCase().replace('_', '-')"
            :style="weekBookingStyle(bi, day.bookings.length)"
          >
            {{ b.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Day View -->
    <div v-else class="day-view">
      <div class="day-view-header">
        <span class="day-view-title">Friday, March 20</span>
        <span class="day-view-tag today-tag">TODAY</span>
      </div>
      <div class="day-view-grid">
        <div v-for="h in weekHours" :key="h" class="day-view-row">
          <span class="day-view-hour">{{ formatHour(h) }}</span>
          <div class="day-view-slot">
            <div
              v-for="b in getDayBookings(h)"
              :key="b.label"
              class="day-view-booking"
              :class="b.status.toLowerCase().replace('_', '-')"
            >
              <span class="dv-name">{{ b.label }}</span>
              <span class="dv-status">{{ b.status.replace('_', ' ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { calendarData } from '../../data/demo-data';

const views = ['Month', 'Week', 'Day'] as const;
const currentView = ref<typeof views[number]>('Month');
const selectedDay = ref<number | null>(null);
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekHours = Array.from({ length: 14 }, (_, i) => i + 7);

const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

// Week view: show days 16-22 (Mon-Sun of the current week)
const weekDays = computed(() => {
  return calendarData.filter((d) => d.isCurrentMonth && d.date >= 16 && d.date <= 22);
});

const weekBookingStyle = (index: number, total: number) => {
  // Distribute bookings across hours pseudo-randomly
  const startHour = 8 + (index * 3);
  const top = ((startHour - 7) / 14) * 100;
  const height = (2 / 14) * 100;
  return { top: `${top}%`, height: `${height}%` };
};

// Day view: March 20 bookings mapped to hours
const todayData = calendarData.find((d) => d.isToday);
const dayBookingMap = new Map<number, typeof todayData extends undefined ? never : NonNullable<typeof todayData>['bookings']>();
if (todayData) {
  const hours = [9, 10, 12, 14, 16, 18, 19];
  todayData.bookings.forEach((b, i) => {
    const h = hours[i % hours.length];
    if (!dayBookingMap.has(h)) dayBookingMap.set(h, []);
    dayBookingMap.get(h)!.push(b);
  });
}

const getDayBookings = (hour: number) => dayBookingMap.get(hour) || [];

const prevMonth = () => {};
const nextMonth = () => {};
</script>

<style scoped>
.demo-calendar {
  background: var(--demo-surface, #ffffff);
  border-radius: 12px;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: var(--demo-text, #1f2937);
  border: 1px solid var(--demo-border, #e5e7eb);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--demo-border, #e5e7eb);
  background: var(--demo-surface-elevated, #f9fafb);
  flex-wrap: wrap;
  gap: 8px;
}

.header-left { display: flex; align-items: center; gap: 8px; }

.nav-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid var(--demo-border, #e5e7eb);
  background: var(--demo-surface, #ffffff);
  color: var(--demo-text, #1f2937);
  cursor: pointer;
}
.nav-btn:hover { background: var(--demo-surface-hover, #f3f4f6); }

.month-label { font-weight: 600; font-size: 14px; }

.today-btn {
  padding: 4px 12px; border-radius: 6px;
  border: 1px solid #6d28d9; background: transparent;
  color: #6d28d9; font-size: 12px; font-weight: 600; cursor: pointer;
}
.today-btn:hover { background: #6d28d9; color: white; }

.view-toggle { display: flex; gap: 2px; background: var(--demo-surface-hover, #f3f4f6); border-radius: 8px; padding: 2px; }
.view-btn {
  padding: 4px 14px; border-radius: 6px; border: none;
  background: transparent; color: var(--demo-text-muted, #6b7280);
  font-size: 12px; font-weight: 500; cursor: pointer;
}
.view-btn.active { background: #6d28d9; color: white; }

/* Month Grid */
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--demo-border-light, #f3f4f6);
}

.day-name {
  padding: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 11px;
  color: var(--demo-text-muted, #6b7280);
  background: var(--demo-surface-elevated, #f9fafb);
  text-transform: uppercase;
}

.day-cell {
  min-height: 72px;
  padding: 4px 6px;
  background: var(--demo-surface, #ffffff);
  cursor: pointer;
  transition: background 0.15s;
}
.day-cell:hover { background: var(--demo-surface-hover, #f9fafb); }
.day-cell.other-month { opacity: 0.35; }
.day-cell.is-today .day-number {
  background: #6d28d9;
  color: white;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.day-number { font-size: 12px; font-weight: 500; }

.day-bookings { display: flex; flex-direction: column; gap: 2px; margin-top: 2px; }

.booking-chip {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.booking-chip.confirmed { background: #1976d2; }
.booking-chip.in-progress { background: #f57c00; }
.booking-chip.completed { background: #388e3c; }
.booking-chip.pending { background: #9e9e9e; }
.booking-chip.cancelled { background: #d32f2f; }

.more-label { font-size: 10px; color: var(--demo-text-muted, #6b7280); }

/* Week View */
.week-grid { display: flex; overflow: hidden; }
.week-time-col { flex-shrink: 0; width: 56px; }
.week-corner { height: 48px; border-bottom: 1px solid var(--demo-border, #e5e7eb); }
.week-hour-label {
  height: 36px; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 8px; font-size: 10px; color: var(--demo-text-muted, #6b7280);
}

.week-day-col { flex: 1; border-left: 1px solid var(--demo-border-light, #f3f4f6); }
.week-day-header {
  height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-bottom: 1px solid var(--demo-border, #e5e7eb); background: var(--demo-surface-elevated, #f9fafb);
}
.week-day-header.is-today .week-day-num {
  background: #6d28d9; color: white; width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;
}
.week-day-name { font-size: 10px; color: var(--demo-text-muted, #6b7280); text-transform: uppercase; }
.week-day-num { font-size: 13px; font-weight: 600; }

.week-day-grid { position: relative; }
.week-hour-slot { height: 36px; border-bottom: 1px solid var(--demo-border-light, #f3f4f6); }

.week-booking {
  position: absolute; left: 2px; right: 2px;
  border-radius: 4px; padding: 2px 4px;
  font-size: 10px; color: white; overflow: hidden;
  white-space: nowrap; text-overflow: ellipsis;
}
.week-booking.confirmed { background: #1976d2; }
.week-booking.in-progress { background: #f57c00; }
.week-booking.completed { background: #388e3c; }
.week-booking.pending { background: #9e9e9e; }

/* Day View */
.day-view-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid var(--demo-border, #e5e7eb);
}
.day-view-title { font-weight: 600; font-size: 14px; }
.today-tag {
  font-size: 10px; font-weight: 700; color: #6d28d9;
  background: rgba(109, 40, 217, 0.1); padding: 1px 6px; border-radius: 4px;
}

.day-view-grid { max-height: 420px; overflow-y: auto; }
.day-view-row {
  display: flex; min-height: 40px;
  border-bottom: 1px solid var(--demo-border-light, #f3f4f6);
}
.day-view-hour {
  width: 60px; flex-shrink: 0; padding: 8px;
  font-size: 11px; color: var(--demo-text-muted, #6b7280);
  border-right: 1px solid var(--demo-border-light, #f3f4f6);
}
.day-view-slot { flex: 1; padding: 4px 8px; display: flex; flex-direction: column; gap: 4px; }
.day-view-booking {
  padding: 4px 8px; border-radius: 6px; color: white;
  display: flex; justify-content: space-between; align-items: center;
}
.day-view-booking.confirmed { background: #1976d2; }
.day-view-booking.in-progress { background: #f57c00; }
.day-view-booking.completed { background: #388e3c; }
.day-view-booking.pending { background: #9e9e9e; }
.dv-name { font-weight: 600; font-size: 12px; }
.dv-status { font-size: 10px; opacity: 0.8; text-transform: capitalize; }

/* Use site theme variables */
.demo-calendar {
  --demo-surface: var(--bg-primary, #ffffff);
  --demo-surface-elevated: var(--bg-secondary, #f9fafb);
  --demo-surface-hover: var(--bg-tertiary, #f3f4f6);
  --demo-border: var(--border-color, #e5e7eb);
  --demo-border-light: var(--bg-tertiary, #f3f4f6);
  --demo-text: var(--text-primary, #1f2937);
  --demo-text-muted: var(--text-tertiary, #6b7280);
}
</style>
