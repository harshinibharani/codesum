import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HistoryPage from './HistoryPage';
import { UserContext } from './UserContext';

// Mock functions
const mockSetUser = jest.fn();
const mockNavigate = jest.fn();
const mockFetch = jest.fn();

// Mock fetch
global.fetch = mockFetch;

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('HistoryPage', () => {
    const providerValues = { user: { username: 'testuser', _id: '123' }, setUser: mockSetUser };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    it('displays loading indicator while fetching data', () => {
        mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolving promise to simulate loading
        render(
            <UserContext.Provider value={providerValues}>
                <Router>
                    <HistoryPage />
                </Router>
            </UserContext.Provider>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays an error message when fetching data fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to fetch history'));
        render(
            <UserContext.Provider value={providerValues}>
                <Router>
                    <HistoryPage />
                </Router>
            </UserContext.Provider>
        );
        await waitFor(() => screen.getByText(/error/i));
        expect(screen.getByText(/failed to fetch history/i)).toBeInTheDocument();
    });

    it('renders history records when data is fetched successfully', async () => {
        const historyData = {
            history: [
                { inputCode: 'Example code', selectedSummary: 'Summary', feedback: 'Good', usefulness: 'High', naturalness: 'Natural', consistency: 'Consistent' }
            ]
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => historyData
        });
        render(
            <UserContext.Provider value={providerValues}>
                <Router>
                    <HistoryPage />
                </Router>
            </UserContext.Provider>
        );
        await waitFor(() => screen.getByText(/example code/i));
        const summaries = screen.getAllByText(/summary/i);
        expect(summaries.length).toBeGreaterThan(0);
        expect(screen.getByText(/good/i)).toBeInTheDocument();
        expect(screen.getByText(/high/i)).toBeInTheDocument();
    });

    it('displays no history message when no history records are found', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ history: [] })
        });
        render(
            <UserContext.Provider value={providerValues}>
                <Router>
                    <HistoryPage />
                </Router>
            </UserContext.Provider>
        );
        await waitFor(() => screen.getByText(/no history found/i));
        expect(screen.getByText(/no history found/i)).toBeInTheDocument();
    });
});
