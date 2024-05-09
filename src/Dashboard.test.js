import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './Dashboard';
import { UserContext } from './UserContext';

// Mock for the openai API
jest.mock('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn((options) => Promise.resolve({
                    choices: [{ message: { content: Array.from({ length: parseInt(options.messages[0].content.match(/(\d+)/)[1]) }, (_, i) => `Summary ${i + 1}`).join('$$') } }]
                }))
            }
        },
    })),
}));


// Mocks for user and navigation
const mockNavigate = jest.fn();
const mockSetUser = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Dashboard', () => {
    const providerValues = {
        user: { username: 'testuser', _id: '123' },
        setUser: mockSetUser
    };

    const customRender = (ui) => render(
        <UserContext.Provider value={providerValues}>
            <Router>{ui}</Router>
        </UserContext.Provider>
    );

    beforeEach(() => {
        mockNavigate.mockClear();
        mockSetUser.mockClear();
    });

    test('renders Dashboard and initializes properly', async () => {
        customRender(<Dashboard />);
        expect(await screen.findByText(/Hi, testuser 👋/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Code/)).toBeInTheDocument();
        expect(screen.getByText(/Submit/)).toBeInTheDocument();
        expect(screen.getByText(/Clear/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Number of Summaries/)).toBeInTheDocument();
    });

    test('logs out and navigates to Login page when Logout link is clicked', async () => {
        customRender(<Dashboard />);
        fireEvent.click(await screen.findByText(/Logout/));

        expect(mockSetUser).toHaveBeenCalledWith(null);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('navigation to the History works correctly', async () => {
        customRender(<Dashboard />);
        fireEvent.click(await screen.findByText(/My History/));

        expect(mockNavigate).toHaveBeenCalledWith('/history');
    });

    test('submits code and fetches summaries correctly', async () => {
        customRender(<Dashboard />);
        fireEvent.change(screen.getByLabelText(/Code/), { target: { value: 'Example code' } });

        // Open the select dropdown
        fireEvent.mouseDown(screen.getByLabelText(/Number of Summaries/));
        // Click the menu item for '3'
        const listItem = await screen.findByRole('option', { name: '1' });
        fireEvent.click(listItem);

        fireEvent.click(screen.getByText(/Submit/));

        await waitFor(() => {
            expect(screen.getByText(/Summary 1/)).toBeInTheDocument()
        }, { timeout: 60000 });
    }, 60000);

    test('displays the feedback section after selecting a summary and checking button selectability', async () => {
        customRender(<Dashboard />);

        // Mock fetching summaries
        fireEvent.change(screen.getByLabelText(/Code/), { target: { value: 'Example code' } });
        fireEvent.mouseDown(screen.getByLabelText(/Number of Summaries/));
        const listItem = await screen.findByRole('option', { name: '1' });
        fireEvent.click(listItem);
        fireEvent.click(screen.getByText(/Submit/));

        // Simulate fetching summaries and displaying them
        await waitFor(() => {
            expect(screen.getByText(/Summary 1/)).toBeInTheDocument();
        });

        // Click on the first summary to select it
        const firstSummary = screen.getByText(/Summary 1/);
        fireEvent.click(firstSummary);

        // Check if the feedback section is displayed
        await waitFor(() => {
            const feedbackHeading = screen.getByText('Feedback', { selector: 'h6' });
            expect(feedbackHeading).toBeInTheDocument();
            const saveButton = screen.getByText('Save Feedback', { selector: 'button' });
            expect(saveButton).toBeInTheDocument();
            expect(saveButton).toBeDisabled(); // Check if button is initially disabled
        });

        // Fill out feedback forms to enable the "Save Feedback" button
        fireEvent.change(screen.getByLabelText('Feedback'), { target: { value: 'This is great feedback!' } });
        fireEvent.mouseDown(screen.getByLabelText('Usefulness'));
        const useful = await screen.findByRole('option', { name: '5' });
        fireEvent.click(useful);
        fireEvent.mouseDown(screen.getByLabelText('Consistency'));
        const consistent = await screen.findByRole('option', { name: '5' });
        fireEvent.click(consistent);
        fireEvent.mouseDown(screen.getByLabelText('Naturalness'));
        const natural = await screen.findByRole('option', { name: '5' });
        fireEvent.click(natural);

        await waitFor(() => {
            const saveButtonAfterInput = screen.getByText('Save Feedback', { selector: 'button' });
            expect(saveButtonAfterInput).not.toBeDisabled(); // Button should now be enabled
        });
    }, 30000);

});