// Mock data for interactive product showcase demos

export interface DemoBooking {
  id: string;
  clientName: string;
  startHour: number;
  endHour: number;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
  slotLabel: string;
}

export interface DemoTimelineDay {
  date: string;
  dayLabel: string;
  isToday: boolean;
  slots: {
    label: string;
    location: string;
    bookings: DemoBooking[];
  }[];
}

export interface DemoCalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: { status: string; label: string }[];
}

// Status colors matching dashboard
export const statusColors: Record<string, string> = {
  CONFIRMED: '#1976d2',
  IN_PROGRESS: '#f57c00',
  COMPLETED: '#388e3c',
  PENDING: '#9e9e9e',
  CANCELLED: '#d32f2f',
};

// --- Timeline Data ---
export const timelineData: DemoTimelineDay[] = [
  {
    date: '2026-03-16',
    dayLabel: 'Mon 16',
    isToday: false,
    slots: [
      {
        label: 'Spot A1',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b1', clientName: 'James Wilson', startHour: 9, endHour: 12, status: 'COMPLETED', slotLabel: 'A1' },
          { id: 'b2', clientName: 'Yuki Tanaka', startHour: 13, endHour: 16, status: 'COMPLETED', slotLabel: 'A1' },
          { id: 'b3', clientName: 'Liam O\'Brien', startHour: 18, endHour: 21, status: 'COMPLETED', slotLabel: 'A1' },
        ],
      },
      {
        label: 'Spot A2',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b4', clientName: 'Sara Nielsen', startHour: 10, endHour: 14, status: 'COMPLETED', slotLabel: 'A2' },
          { id: 'b5', clientName: 'Marco Rossi', startHour: 17, endHour: 20, status: 'COMPLETED', slotLabel: 'A2' },
        ],
      },
      {
        label: 'Spot B1',
        location: 'Hotel Chiado',
        bookings: [
          { id: 'b6', clientName: 'Priya Sharma', startHour: 8, endHour: 18, status: 'COMPLETED', slotLabel: 'B1' },
        ],
      },
    ],
  },
  {
    date: '2026-03-17',
    dayLabel: 'Tue 17',
    isToday: false,
    slots: [
      {
        label: 'Spot A1',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b7', clientName: 'Emma Chen', startHour: 11, endHour: 14, status: 'COMPLETED', slotLabel: 'A1' },
          { id: 'b8', clientName: 'David Kim', startHour: 15, endHour: 19, status: 'COMPLETED', slotLabel: 'A1' },
        ],
      },
      {
        label: 'Spot A2',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b9', clientName: 'Anna Müller', startHour: 9, endHour: 11, status: 'COMPLETED', slotLabel: 'A2' },
          { id: 'b10', clientName: 'Carlos Herrera', startHour: 12, endHour: 17, status: 'COMPLETED', slotLabel: 'A2' },
        ],
      },
      {
        label: 'Spot B1',
        location: 'Hotel Chiado',
        bookings: [
          { id: 'b11', clientName: 'Fatima Al-Rashid', startHour: 9, endHour: 13, status: 'COMPLETED', slotLabel: 'B1' },
          { id: 'b12', clientName: 'Lucas Martin', startHour: 14, endHour: 20, status: 'COMPLETED', slotLabel: 'B1' },
        ],
      },
    ],
  },
  {
    date: '2026-03-18',
    dayLabel: 'Wed 18',
    isToday: false,
    slots: [
      {
        label: 'Spot A1',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b13', clientName: 'Sophie Laurent', startHour: 10, endHour: 13, status: 'COMPLETED', slotLabel: 'A1' },
          { id: 'b14', clientName: 'Alex Thompson', startHour: 14, endHour: 18, status: 'COMPLETED', slotLabel: 'A1' },
        ],
      },
      {
        label: 'Spot A2',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b15', clientName: 'Nina Petrov', startHour: 8, endHour: 12, status: 'COMPLETED', slotLabel: 'A2' },
          { id: 'b16', clientName: 'Omar Hassan', startHour: 19, endHour: 22, status: 'COMPLETED', slotLabel: 'A2' },
        ],
      },
      {
        label: 'Spot B1',
        location: 'Hotel Chiado',
        bookings: [
          { id: 'b17', clientName: 'Rachel Green', startHour: 10, endHour: 20, status: 'COMPLETED', slotLabel: 'B1' },
        ],
      },
    ],
  },
  {
    date: '2026-03-19',
    dayLabel: 'Thu 19',
    isToday: false,
    slots: [
      {
        label: 'Spot A1',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b18', clientName: 'Kenji Nakamura', startHour: 9, endHour: 12, status: 'COMPLETED', slotLabel: 'A1' },
          { id: 'b19', clientName: 'Elena Volkov', startHour: 13, endHour: 17, status: 'COMPLETED', slotLabel: 'A1' },
          { id: 'b20', clientName: 'Ben Taylor', startHour: 19, endHour: 22, status: 'COMPLETED', slotLabel: 'A1' },
        ],
      },
      {
        label: 'Spot A2',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b21', clientName: 'Aisha Okafor', startHour: 11, endHour: 15, status: 'COMPLETED', slotLabel: 'A2' },
        ],
      },
      {
        label: 'Spot B1',
        location: 'Hotel Chiado',
        bookings: [
          { id: 'b22', clientName: 'Tom Anderson', startHour: 8, endHour: 14, status: 'COMPLETED', slotLabel: 'B1' },
          { id: 'b23', clientName: 'Mei Lin', startHour: 15, endHour: 21, status: 'COMPLETED', slotLabel: 'B1' },
        ],
      },
    ],
  },
  {
    date: '2026-03-20',
    dayLabel: 'Fri 20',
    isToday: true,
    slots: [
      {
        label: 'Spot A1',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b24', clientName: 'Sarah Mitchell', startHour: 9, endHour: 11, status: 'CONFIRMED', slotLabel: 'A1' },
          { id: 'b25', clientName: 'Hans Weber', startHour: 12, endHour: 15, status: 'IN_PROGRESS', slotLabel: 'A1' },
          { id: 'b26', clientName: 'Chloe Dubois', startHour: 18, endHour: 22, status: 'PENDING', slotLabel: 'A1' },
        ],
      },
      {
        label: 'Spot A2',
        location: 'Restaurante Belém',
        bookings: [
          { id: 'b27', clientName: 'Raj Patel', startHour: 10, endHour: 14, status: 'IN_PROGRESS', slotLabel: 'A2' },
          { id: 'b28', clientName: 'Lisa Chang', startHour: 16, endHour: 20, status: 'CONFIRMED', slotLabel: 'A2' },
        ],
      },
      {
        label: 'Spot B1',
        location: 'Hotel Chiado',
        bookings: [
          { id: 'b29', clientName: 'Mike Johnson', startHour: 8, endHour: 18, status: 'IN_PROGRESS', slotLabel: 'B1' },
          { id: 'b30', clientName: 'Julia Santos', startHour: 19, endHour: 23, status: 'PENDING', slotLabel: 'B1' },
        ],
      },
    ],
  },
];

// --- Calendar Data (March 2026) ---
export const calendarData: DemoCalendarDay[] = (() => {
  const days: DemoCalendarDay[] = [];
  const statuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'PENDING'];
  const names = ['James W.', 'Yuki T.', 'Sara N.', 'Priya S.', 'Emma C.', 'Marco R.', 'Aisha O.', 'Lucas M.'];

  // Feb padding (Sun=0, March 1 2026 is Sunday)
  // March 1, 2026 is a Sunday. Week starts Monday, so we need 6 padding days (Mon-Sat of prev week)
  for (let i = 23; i <= 28; i++) {
    days.push({ date: i, isCurrentMonth: false, isToday: false, bookings: [] });
  }

  for (let d = 1; d <= 31; d++) {
    const bookingCount = d <= 15 ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3);
    const bookings = [];
    for (let b = 0; b < bookingCount; b++) {
      bookings.push({
        status: d < 20 ? 'COMPLETED' : statuses[Math.floor(Math.random() * statuses.length)],
        label: names[Math.floor(Math.random() * names.length)],
      });
    }
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: d === 20,
      bookings,
    });
  }

  // April padding
  for (let i = 1; i <= 5; i++) {
    days.push({ date: i, isCurrentMonth: false, isToday: false, bookings: [] });
  }

  return days;
})();

// --- Analytics Data ---
export const analyticsOverview = {
  totalUsers: 247,
  totalBookings: 1834,
  totalRevenue: 8492,
  activeLocations: 12,
};

export const utilizationTrend = [
  { x: '2026-02-18', y: 62 },
  { x: '2026-02-19', y: 58 },
  { x: '2026-02-20', y: 71 },
  { x: '2026-02-21', y: 68 },
  { x: '2026-02-22', y: 45 },
  { x: '2026-02-23', y: 38 },
  { x: '2026-02-24', y: 65 },
  { x: '2026-02-25', y: 72 },
  { x: '2026-02-26', y: 69 },
  { x: '2026-02-27', y: 78 },
  { x: '2026-02-28', y: 74 },
  { x: '2026-03-01', y: 80 },
  { x: '2026-03-02', y: 67 },
  { x: '2026-03-03', y: 43 },
  { x: '2026-03-04', y: 71 },
  { x: '2026-03-05', y: 76 },
  { x: '2026-03-06', y: 82 },
  { x: '2026-03-07', y: 79 },
  { x: '2026-03-08', y: 85 },
  { x: '2026-03-09', y: 73 },
  { x: '2026-03-10', y: 48 },
  { x: '2026-03-11', y: 77 },
  { x: '2026-03-12', y: 81 },
  { x: '2026-03-13', y: 84 },
  { x: '2026-03-14', y: 88 },
  { x: '2026-03-15', y: 76 },
  { x: '2026-03-16', y: 52 },
  { x: '2026-03-17', y: 79 },
  { x: '2026-03-18', y: 83 },
  { x: '2026-03-19', y: 86 },
  { x: '2026-03-20', y: 91 },
];

export const bookingStatusBreakdown = [
  { label: 'Completed', value: 1243 },
  { label: 'Confirmed', value: 312 },
  { label: 'In Progress', value: 156 },
  { label: 'Pending', value: 89 },
  { label: 'Cancelled', value: 34 },
];

export const dailyBookings = [
  { x: 'Mar 11', y: 18 },
  { x: 'Mar 12', y: 24 },
  { x: 'Mar 13', y: 21 },
  { x: 'Mar 14', y: 28 },
  { x: 'Mar 15', y: 19 },
  { x: 'Mar 16', y: 12 },
  { x: 'Mar 17', y: 22 },
  { x: 'Mar 18', y: 26 },
  { x: 'Mar 19', y: 31 },
  { x: 'Mar 20', y: 27 },
];

export const topLocations = [
  { name: 'Restaurante Belém', count: 342, percentage: '18.6%' },
  { name: 'Hotel Chiado', count: 298, percentage: '16.2%' },
  { name: 'Café Alfama', count: 256, percentage: '14.0%' },
  { name: 'Rooftop Príncipe Real', count: 213, percentage: '11.6%' },
  { name: 'Mercado da Ribeira', count: 189, percentage: '10.3%' },
];
