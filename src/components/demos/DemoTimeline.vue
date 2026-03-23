<template>
  <div class="demo-timeline">
    <!-- Header -->
    <div class="timeline-header">
      <div class="header-left">
        <button class="nav-btn" @click="scrollLeft">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="period-label">Mar 16 – 20, 2026</span>
        <button class="nav-btn" @click="scrollRight">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button class="today-btn" @click="scrollToToday">Today</button>
      </div>
      <div class="header-right">
        <span class="location-badge">Restaurante Belém</span>
        <span class="location-badge">Hotel Chiado</span>
      </div>
    </div>

    <!-- Timeline Grid -->
    <div class="timeline-container" ref="scrollContainer">
      <div class="timeline-grid">
        <!-- Time header -->
        <div class="time-header">
          <div class="lane-label-spacer"></div>
          <div class="hours-row">
            <div v-for="h in hours" :key="h" class="hour-cell">{{ formatHour(h) }}</div>
          </div>
        </div>

        <!-- Days -->
        <template v-for="day in days" :key="day.date">
          <!-- Day header -->
          <div
            class="day-header"
            :class="{ 'is-today': day.isToday, collapsed: collapsedDays.has(day.date) }"
            @click="toggleDay(day.date)"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              class="collapse-icon" :class="{ rotated: !collapsedDays.has(day.date) }"
            ><path d="M9 18l6-6-6-6"/></svg>
            <span class="day-label">{{ day.dayLabel }}</span>
            <span v-if="day.isToday" class="today-tag">TODAY</span>
            <span class="booking-count">{{ dayBookingCount(day) }} bookings</span>
          </div>

          <!-- Slot lanes -->
          <template v-if="!collapsedDays.has(day.date)">
            <div v-for="slot in day.slots" :key="day.date + slot.label" class="lane">
              <div class="lane-label">
                <span class="slot-name">{{ slot.label }}</span>
                <span class="location-name">{{ slot.location }}</span>
              </div>
              <div class="lane-grid" @click="(e) => onLaneClick(e, day, slot)">
                <div v-for="h in hours" :key="h" class="hour-bg" :class="{ 'past-hour': isPast(day, h) }"></div>
                <!-- Existing bookings -->
                <div
                  v-for="booking in slot.bookings"
                  :key="booking.id"
                  class="booking-block"
                  :class="booking.status.toLowerCase().replace('_', '-')"
                  :style="bookingStyle(booking)"
                  @click.stop="showBookingDetail(booking, slot)"
                >
                  <span class="booking-name">{{ booking.clientName }}</span>
                  <span class="booking-time">{{ formatHour(booking.startHour) }}-{{ formatHour(booking.endHour) }}</span>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- Booking Detail Popup -->
    <div v-if="selectedBooking" class="popup-overlay" @click="selectedBooking = null">
      <div class="popup" @click.stop>
        <div class="popup-header">
          <span class="popup-title">Booking Details</span>
          <button class="popup-close" @click="selectedBooking = null">&times;</button>
        </div>
        <div class="popup-body">
          <div class="popup-row">
            <span class="popup-label">Customer</span>
            <span class="popup-value">{{ selectedBooking.clientName }}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">Time</span>
            <span class="popup-value">{{ formatHour(selectedBooking.startHour) }} – {{ formatHour(selectedBooking.endHour) }}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">Spot</span>
            <span class="popup-value">{{ selectedSlotLabel }}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">Status</span>
            <span class="popup-status" :class="selectedBooking.status.toLowerCase().replace('_', '-')">
              {{ selectedBooking.status.replace('_', ' ') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- New Booking Popup -->
    <div v-if="newBooking" class="popup-overlay" @click="newBooking = null">
      <div class="popup" @click.stop>
        <div class="popup-header">
          <span class="popup-title">New Booking</span>
          <button class="popup-close" @click="newBooking = null">&times;</button>
        </div>
        <div class="popup-body">
          <div class="popup-row">
            <span class="popup-label">Spot</span>
            <span class="popup-value">{{ newBooking.slotLabel }} — {{ newBooking.location }}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">Date</span>
            <span class="popup-value">{{ newBooking.dayLabel }}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">Time</span>
            <span class="popup-value">{{ formatHour(newBooking.startHour) }} – {{ formatHour(newBooking.startHour + 2) }}</span>
          </div>
          <div class="popup-field">
            <label class="popup-label">Customer name</label>
            <input v-model="newBooking.name" class="popup-input" placeholder="Enter name..." />
          </div>
          <button class="popup-btn" @click="confirmBooking">Create Booking</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { timelineData as initialData, type DemoTimelineDay, type DemoBooking } from '../../data/demo-data';

const hours = Array.from({ length: 16 }, (_, i) => i + 7);
const collapsedDays = ref(new Set<string>());
const scrollContainer = ref<HTMLElement>();
const selectedBooking = ref<DemoBooking | null>(null);
const selectedSlotLabel = ref('');

// Make data reactive so we can add bookings
const days = reactive(JSON.parse(JSON.stringify(initialData)) as DemoTimelineDay[]);

interface NewBookingState {
  dayIndex: number;
  slotIndex: number;
  slotLabel: string;
  location: string;
  dayLabel: string;
  startHour: number;
  name: string;
}
const newBooking = ref<NewBookingState | null>(null);

let bookingCounter = 100;

const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

const isPast = (day: DemoTimelineDay, hour: number) => {
  if (!day.isToday) return new Date(day.date) < new Date('2026-03-20');
  return hour < 13;
};

const dayBookingCount = (day: DemoTimelineDay) =>
  day.slots.reduce((sum, s) => sum + s.bookings.length, 0);

const toggleDay = (date: string) => {
  const s = new Set(collapsedDays.value);
  if (s.has(date)) s.delete(date);
  else s.add(date);
  collapsedDays.value = s;
};

const bookingStyle = (booking: DemoBooking) => {
  const start = ((booking.startHour - 7) / 16) * 100;
  const width = ((booking.endHour - booking.startHour) / 16) * 100;
  return { left: `${start}%`, width: `${width}%` };
};

const showBookingDetail = (booking: DemoBooking, slot: { label: string; location: string }) => {
  selectedBooking.value = booking;
  selectedSlotLabel.value = `${slot.label} — ${slot.location}`;
};

const onLaneClick = (e: MouseEvent, day: DemoTimelineDay, slot: { label: string; location: string; bookings: DemoBooking[] }) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = x / rect.width;
  const clickedHour = Math.floor(7 + pct * 16);

  // Check if clicking on an occupied hour
  const occupied = slot.bookings.some(b => clickedHour >= b.startHour && clickedHour < b.endHour);
  if (occupied) return;

  const dayIndex = days.indexOf(day);
  const slotIndex = day.slots.indexOf(slot);

  newBooking.value = {
    dayIndex,
    slotIndex,
    slotLabel: slot.label,
    location: slot.location,
    dayLabel: day.dayLabel,
    startHour: clickedHour,
    name: '',
  };
};

const confirmBooking = () => {
  if (!newBooking.value) return;
  const { dayIndex, slotIndex, startHour, name } = newBooking.value;
  const customerName = name.trim() || 'New Customer';

  days[dayIndex].slots[slotIndex].bookings.push({
    id: `new-${bookingCounter++}`,
    clientName: customerName,
    startHour,
    endHour: startHour + 2,
    status: 'CONFIRMED',
    slotLabel: days[dayIndex].slots[slotIndex].label,
  });

  newBooking.value = null;
};

const scrollLeft = () => {
  scrollContainer.value?.scrollBy({ left: -200, behavior: 'smooth' });
};
const scrollRight = () => {
  scrollContainer.value?.scrollBy({ left: 200, behavior: 'smooth' });
};
const scrollToToday = () => {
  const todayHeader = scrollContainer.value?.querySelector('.is-today');
  todayHeader?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
</script>

<style scoped>
.demo-timeline {
  background: var(--demo-surface, #ffffff);
  border-radius: 12px;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: var(--demo-text, #1f2937);
  border: 1px solid var(--demo-border, #e5e7eb);
  position: relative;
}

.timeline-header {
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
.header-right { display: flex; gap: 6px; }

.nav-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid var(--demo-border, #e5e7eb);
  background: var(--demo-surface, #ffffff);
  color: var(--demo-text, #1f2937);
  cursor: pointer; transition: background 0.15s;
}
.nav-btn:hover { background: var(--demo-surface-hover, #f3f4f6); }

.period-label { font-weight: 600; font-size: 14px; }

.today-btn {
  padding: 4px 12px; border-radius: 6px;
  border: 1px solid #6d28d9; background: transparent;
  color: #6d28d9; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.today-btn:hover { background: #6d28d9; color: white; }

.location-badge {
  padding: 3px 10px; border-radius: 12px;
  background: var(--demo-surface-hover, #f3f4f6);
  font-size: 11px; font-weight: 500;
  color: var(--demo-text-muted, #6b7280);
}

.timeline-container { overflow-x: auto; overflow-y: auto; max-height: 420px; }
.timeline-grid { min-width: 800px; }

.time-header {
  display: flex; position: sticky; top: 0; z-index: 10;
  background: var(--demo-surface-elevated, #f9fafb);
  border-bottom: 1px solid var(--demo-border, #e5e7eb);
}

.lane-label-spacer { min-width: 120px; flex-shrink: 0; }
.hours-row { display: flex; flex: 1; }

.hour-cell {
  flex: 1; text-align: center; padding: 6px 0;
  font-size: 11px; color: var(--demo-text-muted, #6b7280);
  border-left: 1px solid var(--demo-border-light, #f3f4f6);
}

.day-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  background: var(--demo-surface-elevated, #f9fafb);
  border-bottom: 1px solid var(--demo-border, #e5e7eb);
  cursor: pointer; user-select: none; transition: background 0.15s;
}
.day-header:hover { background: var(--demo-surface-hover, #f3f4f6); }
.day-header.is-today { background: rgba(109, 40, 217, 0.06); border-left: 3px solid #6d28d9; }

.collapse-icon { transition: transform 0.2s; flex-shrink: 0; }
.collapse-icon.rotated { transform: rotate(90deg); }

.day-label { font-weight: 600; }
.today-tag {
  font-size: 10px; font-weight: 700; color: #6d28d9;
  background: rgba(109, 40, 217, 0.1); padding: 1px 6px; border-radius: 4px;
}
.booking-count { margin-left: auto; font-size: 11px; color: var(--demo-text-muted, #6b7280); }

.lane { display: flex; border-bottom: 1px solid var(--demo-border-light, #f3f4f6); min-height: 48px; }

.lane-label {
  min-width: 120px; flex-shrink: 0; padding: 8px 12px;
  display: flex; flex-direction: column; justify-content: center;
  border-right: 1px solid var(--demo-border, #e5e7eb);
}

.slot-name { font-weight: 600; font-size: 12px; }
.location-name { font-size: 10px; color: var(--demo-text-muted, #6b7280); }

.lane-grid { flex: 1; display: flex; position: relative; cursor: crosshair; }

.hour-bg { flex: 1; border-left: 1px solid var(--demo-border-light, #f3f4f6); }
.hour-bg.past-hour { background: var(--demo-surface-hover, rgba(0,0,0,0.02)); }

.booking-block {
  position: absolute; top: 4px; bottom: 4px;
  border-radius: 6px; padding: 2px 6px;
  display: flex; flex-direction: column; justify-content: center;
  overflow: hidden; cursor: pointer;
  transition: filter 0.15s, transform 0.15s; z-index: 1;
}
.booking-block:hover { filter: brightness(1.1); transform: scaleY(1.05); }

.booking-name { font-size: 11px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.booking-time { font-size: 9px; color: rgba(255,255,255,0.8); }

.booking-block.confirmed { background: #1976d2; }
.booking-block.in-progress { background: #f57c00; }
.booking-block.completed { background: #388e3c; }
.booking-block.pending { background: #9e9e9e; }
.booking-block.cancelled { background: #d32f2f; }

/* Popup overlay */
.popup-overlay {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
}

.popup {
  background: var(--demo-surface, #ffffff);
  border-radius: 12px; width: 320px; max-width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
}

.popup-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--demo-border, #e5e7eb);
  background: var(--demo-surface-elevated, #f9fafb);
}

.popup-title { font-weight: 700; font-size: 14px; }

.popup-close {
  background: none; border: none; font-size: 20px;
  cursor: pointer; color: var(--demo-text-muted, #6b7280);
  line-height: 1; padding: 0 4px;
}
.popup-close:hover { color: var(--demo-text, #1f2937); }

.popup-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.popup-row { display: flex; justify-content: space-between; align-items: center; }
.popup-label { font-size: 12px; color: var(--demo-text-muted, #6b7280); }
.popup-value { font-size: 13px; font-weight: 500; }

.popup-status {
  font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 12px;
  color: white; text-transform: capitalize;
}
.popup-status.confirmed { background: #1976d2; }
.popup-status.in-progress { background: #f57c00; }
.popup-status.completed { background: #388e3c; }
.popup-status.pending { background: #9e9e9e; }

.popup-field { display: flex; flex-direction: column; gap: 4px; }

.popup-input {
  padding: 8px 12px; border-radius: 8px;
  border: 1px solid var(--demo-border, #e5e7eb);
  background: var(--demo-surface, #ffffff);
  color: var(--demo-text, #1f2937);
  font-size: 13px; outline: none;
}
.popup-input:focus { border-color: #6d28d9; box-shadow: 0 0 0 2px rgba(109,40,217,0.15); }

.popup-btn {
  padding: 10px; border-radius: 8px; border: none;
  background: #6d28d9; color: white;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.popup-btn:hover { background: #5b21b6; }

/* Use site theme variables */
.demo-timeline {
  --demo-surface: var(--bg-primary, #ffffff);
  --demo-surface-elevated: var(--bg-secondary, #f9fafb);
  --demo-surface-hover: var(--bg-tertiary, #f3f4f6);
  --demo-border: var(--border-color, #e5e7eb);
  --demo-border-light: var(--bg-tertiary, #f3f4f6);
  --demo-text: var(--text-primary, #1f2937);
  --demo-text-muted: var(--text-tertiary, #6b7280);
}
</style>
