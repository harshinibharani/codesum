import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import RegisterPage from './RegisterPage';

// Mock navigate function from react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterPage', () => {
  const setup = () => {
    render(
      <Router>
        <RegisterPage />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /Register/i });
    return {
      usernameInput,
      passwordInput,
      submitButton
    };
  };

  test('renders RegisterPage component with form inputs', () => {
    setup();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('validates password with multiple criteria', async () => {
    const { passwordInput } = setup();
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.blur(passwordInput); // Trigger validation
    await waitFor(() => {
      expect(screen.getByText(/At least 8 characters long/i)).toBeInTheDocument();
      expect(screen.getByText(/Uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/Digit/i)).toBeInTheDocument();
      expect(screen.getByText(/Special character/i)).toBeInTheDocument();
    });
  });

  test('submits form and navigates to login page on valid input', async () => {
    const { usernameInput, passwordInput, submitButton } = setup();
    fireEvent.change(usernameInput, { target: { value: 'newUser' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } }); // Valid password according to your rules
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
