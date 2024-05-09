import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from './UserContext';
import ManageRoles from './ManageRoles';



const user = { _id: '123', username: 'admin', role: 'admin' };
const mockUsers = [
    { _id: '1', username: 'User1', role: 'user' },
    { _id: '2', username: 'User2', role: 'admin' },
];
const mockSetUser = jest.fn();
const mockNavigate = jest.fn();

const customRender = (ui, { providerValues } = {}) => {
    return render(
        <UserContext.Provider value={providerValues}>
            <MemoryRouter>
                {ui}
            </MemoryRouter>
        </UserContext.Provider>
    );
};

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

beforeEach(() => {
    jest.resetAllMocks();
    window.alert = jest.fn();
    global.fetch = jest.fn((url, options) => {
        if (url.includes('/getAllUsers')) {
            return Promise.resolve({
                json: () => Promise.resolve({ users: mockUsers }),
            });
        }

        if (url.endsWith('/changeUserRole')) {
            return Promise.resolve({
                json: () => Promise.resolve({ success: true }),
            });
        }

        if (url.endsWith('/register')) {
            return Promise.resolve({
                json: () => Promise.resolve({ success: true }),
            });
        }

        if (url.match(/deleteUser\/(\d+)/)) {
            const userId = url.split('/').pop();
            delete mockUsers[0];
            return Promise.resolve({
                json: () => Promise.resolve({ success: true }),
            });
        }
        return Promise.reject('Unknown endpoint');
    });
});


test('renders ManageRoles and displays user list', async () => {
    render(
        <MemoryRouter>
            <UserContext.Provider value={{ user: user, setUser: mockSetUser }}>
                <ManageRoles />
            </UserContext.Provider>
        </MemoryRouter>
    );
    expect(await screen.findByText(/Manage Roles/)).toBeInTheDocument();
    expect(await screen.findByText('User1')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
});


test('allows changing user roles', async () => {
    render(
        <MemoryRouter>
            <UserContext.Provider value={{ user, setUser: mockSetUser }}>
                <ManageRoles />
            </UserContext.Provider>
        </MemoryRouter>
    );
    const switches = await screen.findAllByRole('checkbox');
    fireEvent.click(switches[0]); 
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        method: 'POST'
    })));
});


test('allows searching and filtering users', async () => {
    render(
        <MemoryRouter>
            <UserContext.Provider value={{ user, setUser: mockSetUser }}>
                <ManageRoles />
            </UserContext.Provider>
        </MemoryRouter>
    );
    const searchInput = await screen.findByLabelText(/Search Users/);
    fireEvent.change(searchInput, { target: { value: 'User1' } });
    await waitFor(() => expect(screen.getByText('User1')).toBeInTheDocument());
    expect(screen.queryByText('User2')).toBeNull();
});

test('handles adding users', async () => {
    render(
        <MemoryRouter>
            <UserContext.Provider value={{ user, setUser: mockSetUser }}>
                <ManageRoles />
            </UserContext.Provider>
        </MemoryRouter>
    );
    const addButton = await screen.findByRole('button', { name: /Add New User/i });

    fireEvent.click(addButton);


    await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    
    await waitFor(() => {
        expect(screen.queryByText('dialog')).not.toBeInTheDocument();

    });

});


test('handles deleting users', async () => {
    render(
        <MemoryRouter>
            <UserContext.Provider value={{ user, setUser: mockSetUser }}>
                <ManageRoles />
            </UserContext.Provider>
        </MemoryRouter>
    );
    expect(await screen.findByText('User1')).toBeInTheDocument();
    expect(screen.getByText('User2')).toBeInTheDocument();

    const deleteButtons = await screen.findAllByRole('button', { name: /Delete/i });
    deleteButtons.forEach((button, index) => {
        console.log(`Button Index: ${index}`);
        console.log(`Button Text: ${button.textContent}`);
    });
    fireEvent.click(deleteButtons[0]);


    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByText('User1')).toBeNull());
});

test('navigates to Admin Dashboard when the Admin Dashboard link is clicked', async () => {
    const providerValues = { user: { _id: '123', username: 'testuser', role: 'admin' }, setUser: mockSetUser };
    customRender(<ManageRoles />, { providerValues });

    await waitFor(() => {
        const dashboardLink = screen.getByText('Admin Dashboard');
        fireEvent.click(dashboardLink);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
});

test('logs out and navigates to Login page when Logout link is clicked', async () => {
    const providerValues = { user: { _id: '123', username: 'testuser', role: 'admin' }, setUser: mockSetUser };
    customRender(<ManageRoles />, { providerValues });

    await waitFor(() => {
        const logoutLink = screen.getByText('Logout');
        fireEvent.click(logoutLink);
    });

    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
});