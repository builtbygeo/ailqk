/**
 * Mock API Client to replace @base44/sdk
 * This allows the app to run locally without any external dependencies.
 */

const mockUser = {
  id: 'local-user-id',
  email: 'local@example.com',
  name: 'Local Developer',
  role: 'admin'
};

const mockLocations = [
  {
    id: '1',
    name: 'Рила - Седемте езера',
    type: 'wild',
    latitude: 42.215,
    longitude: 23.327,
    description: 'Седемте рилски езера са група езера с ледников произход.',
    average_rating: 4.8,
    reviews_count: 124,
    status: 'approved'
  },
  {
    id: '2',
    name: 'Къща за гости "Родопски рай"',
    type: 'hosted',
    latitude: 41.650,
    longitude: 24.700,
    description: 'Уютна къща в сърцето на Родопите.',
    average_rating: 4.5,
    reviews_count: 42,
    status: 'approved'
  }
];

const mockReviews = [];
const mockBookings = [];

export const base44 = {
  auth: {
    me: async () => mockUser,
    logout: async () => { console.log('Mock Logout'); },
    redirectToLogin: () => { console.log('Mock Redirect to Login'); },
    updateMe: async (data) => ({ ...mockUser, ...data })
  },
  entities: {
    Location: {
      list: async () => mockLocations,
      filter: async (query) => {
        if (query.id) return mockLocations.filter(l => l.id === query.id);
        if (query.status) return mockLocations.filter(l => l.status === query.status);
        return mockLocations;
      },
      create: async (data) => {
        const newLoc = { ...data, id: Math.random().toString(36).substr(2, 9), status: 'pending' };
        mockLocations.push(newLoc);
        return newLoc;
      },
      update: async (id, data) => {
        const idx = mockLocations.findIndex(l => l.id === id);
        if (idx !== -1) mockLocations[idx] = { ...mockLocations[idx], ...data };
        return mockLocations[idx];
      }
    },
    Review: {
      filter: async () => mockReviews,
      create: async (data) => {
        const newReview = { ...data, id: Math.random().toString(36).substr(2, 9) };
        mockReviews.push(newReview);
        return newReview;
      }
    },
    BookingRequest: {
      filter: async () => mockBookings,
      create: async (data) => {
        const newBooking = { ...data, id: Math.random().toString(36).substr(2, 9) };
        mockBookings.push(newBooking);
        return newBooking;
      },
      update: async (id, data) => {
        const idx = mockBookings.findIndex(b => b.id === id);
        if (idx !== -1) mockBookings[idx] = { ...mockBookings[idx], ...data };
        return mockBookings[idx];
      }
    }
  },
  integrations: {
    Core: {
      InvokeLLM: async () => ({ text: "Това е магически AI отговор от вашето локално копие!" }),
      UploadFile: async () => ({ file_url: 'https://via.placeholder.com/150' })
    }
  },
  appLogs: {
    logUserInApp: async () => ({})
  }
};
