import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from './LoginPage';
import { UserContext } from './UserContext';

// Mock functions
const mockSetUser = jest.fn();
const mockNavigate = jest.fn();

// Mock the necessary hooks from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
    const providerValues = { setUser: mockSetUser };

    const customRender = (ui, { providerValues } = {}) => {
        return render(
            <UserContext.Provider value={providerValues}>
                <Router>{ui}</Router>
            </UserContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock call history before each test
    });

    test('renders LoginPage component', () => {
        customRender(<LoginPage />, { providerValues });
        expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    });

    test('submits form and calls API', async () => {
        customRender(<LoginPage />, { providerValues });

        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newUser' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'ValidPass123!' } });
        fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

        // Wait for the mock function to be called after the form submission is handled
        await waitFor(() => expect(mockSetUser).toHaveBeenCalled());

        // Check if navigation is called correctly based on user role or other conditions
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
});
