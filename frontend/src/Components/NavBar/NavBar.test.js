import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import NavBar from './NavBar';




// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useLocation: jest.fn().mockReturnValue({ pathname: '/' }),
//     useNavigate: jest.fn(),
//   }));

describe('NavBar Component', () => {
  it('should display Login button when not logged in', () => {
    render(
      <MemoryRouter>
        <NavBar isLoggedIn={false} onLogout={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should display Logout button when logged in', () => {
    render(
      <MemoryRouter>
        <NavBar isLoggedIn={true} onLogout={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call onLogout when Logout button is clicked', () => {
    const mockLogout = jest.fn();
    render(
      <MemoryRouter>
        <NavBar isLoggedIn={true} onLogout={mockLogout} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});