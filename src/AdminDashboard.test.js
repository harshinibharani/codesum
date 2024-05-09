import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from './UserContext';
import AdminDashboard from './adminDashboard';

// Mock data for testing
const user = { _id: '123', username: 'admin' };
const mockUsers = [
  { _id: '1', username: 'User1' },
  { _id: '2', username: 'User2' },
];
const mockSetUser = jest.fn();
jest.mock('./MyChart', () => () => <div>MockChart</div>);


beforeEach(() => {
  global.fetch = jest.fn((url) => {
    switch (url) {
      case 'http://localhost:4000/getAllUsers':
        return Promise.resolve({
          json: () => Promise.resolve({ users: mockUsers }),
        });
      case 'http://localhost:4000/getAllUserHistories':
        return Promise.resolve({
          json: () => Promise.resolve({
            histories: [
              { naturalness: '5', consistency: '4', usefulness: '3' },
              { naturalness: '4', consistency: '5', usefulness: '4' }
            ]
          }),
        });
      default:
        if (url.includes('getUserHistory')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              history: [{ naturalness: '5', consistency: '4', usefulness: '3' }]
            }),
          });
        }
        return Promise.resolve({
          json: () => Promise.resolve({ totalVisits: 50 }),
        });
    }
  });
});

// Test Cases
test('renders the Admin Dashboard with a greeting', async () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, setUser: mockSetUser }}>
        <AdminDashboard />
      </UserContext.Provider>
    </MemoryRouter>
  );
  expect(await screen.findByText(/Hi, admin 👋/)).toBeInTheDocument();
});

test('renders the correct number of new users and total visits', async () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, setUser: mockSetUser }}>
        <AdminDashboard />
      </UserContext.Provider>
    </MemoryRouter>
  );
  expect(await screen.findByText(3)).toBeInTheDocument(); // New Users
  expect(await screen.findByText(50)).toBeInTheDocument(); // Total Visits
});

test('allows selecting and deselecting user checkboxes', async () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, setUser: mockSetUser }}>
        <AdminDashboard />
      </UserContext.Provider>
    </MemoryRouter>
  );
  const checkboxes = await screen.findAllByRole('checkbox');
  expect(checkboxes.length).toBe(2);

  fireEvent.click(checkboxes[0]);
  expect(checkboxes[0].checked).toBe(true);

  fireEvent.click(checkboxes[0]);
  expect(checkboxes[0].checked).toBe(false);
});



test('computes averages for all users correctly', async () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, setUser: mockSetUser }}>
        <AdminDashboard />
      </UserContext.Provider>
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText("All User's Average"));
  await waitFor(() => {
    const averageDisplays = screen.getAllByText("4.50");
    expect(averageDisplays.length).toBe(2);
    expect(screen.getByText("3.50")).toBeInTheDocument();
  });
});

test('computes averages for selected users correctly', async () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user, setUser: mockSetUser }}>
        <AdminDashboard />
      </UserContext.Provider>
    </MemoryRouter>
  );

  // Selecting users by checking checkboxes
  const checkboxes = await screen.findAllByRole('checkbox');
  fireEvent.click(checkboxes[0]); // Select the first user

  fireEvent.click(screen.getByText("Compute Average"));
  await waitFor(() => {
    expect(screen.getByText("5.00")).toBeInTheDocument(); // Expected Naturalness
    expect(screen.getByText("4.00")).toBeInTheDocument(); // Expected Consistency
    expect(screen.getByText("3.00")).toBeInTheDocument(); // Expected Usefulness
  });
});