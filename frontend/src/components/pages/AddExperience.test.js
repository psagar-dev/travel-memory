import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import AddExperience from './AddExperience';

// Mock navigation
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock axios
jest.mock('axios');

describe('AddExperience Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    axios.post.mockClear();
  });

  test('renders required form fields', () => {
    render(
      <BrowserRouter>
        <AddExperience />
      </BrowserRouter>
    );

    // Check for required fields
    expect(screen.getByLabelText(/trip name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/places visited \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/trip type \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total cost \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/short description \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/experience \*/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty required fields', async () => {
    render(
      <BrowserRouter>
        <AddExperience />
      </BrowserRouter>
    );
  
    const submitButton = screen.getByRole('button', { name: /submit experience/i });
    fireEvent.click(submitButton);
  
    // Use findByText (awaits internally) to avoid waitFor issues
    expect(await screen.findByText(/Trip name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total cost must be greater than 0/i)).toBeInTheDocument();
    expect(await screen.findByText(/Start date is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Places visited is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/End date is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Short description is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Trip type is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Experience is required/i)).toBeInTheDocument();

  });
  

  test('validates date range', async () => {
    render(
      <BrowserRouter>
        <AddExperience />
      </BrowserRouter>
    );

    // Set end date before start date
    const startDate = screen.getByLabelText(/start date \*/i);
    const endDate = screen.getByLabelText(/end date \*/i);
    
    fireEvent.change(startDate, { target: { value: '2025-03-24' } });
    fireEvent.change(endDate, { target: { value: '2025-03-23' } });

    const submitButton = screen.getByText('Submit Experience');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });

  test('handles successful form submission', async () => {
    axios.post.mockResolvedValueOnce({ data: { _id: '123' } });

    render(
      <BrowserRouter>
        <AddExperience />
      </BrowserRouter>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/trip name \*/i), { target: { value: 'Test Trip' } });
    fireEvent.change(screen.getByLabelText(/start date \*/i), { target: { value: '2025-03-23' } });
    fireEvent.change(screen.getByLabelText(/end date \*/i), { target: { value: '2025-03-24' } });
    fireEvent.change(screen.getByLabelText(/places visited \*/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/trip type \*/i), { target: { value: 'leisure' } });
    fireEvent.change(screen.getByLabelText(/total cost \*/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/short description \*/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/experience \*/i), { target: { value: 'Test Experience' } });

    const submitButton = screen.getByText('Submit Experience');
    fireEvent.click(submitButton);

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  test('disables submit button while submitting', async () => {
    axios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BrowserRouter>
        <AddExperience />
      </BrowserRouter>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/trip name \*/i), { target: { value: 'Test Trip' } });
    fireEvent.change(screen.getByLabelText(/start date \*/i), { target: { value: '2025-03-23' } });
    fireEvent.change(screen.getByLabelText(/end date \*/i), { target: { value: '2025-03-24' } });
    fireEvent.change(screen.getByLabelText(/places visited \*/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/trip type \*/i), { target: { value: 'leisure' } });
    fireEvent.change(screen.getByLabelText(/total cost \*/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/short description \*/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/experience \*/i), { target: { value: 'Test Experience' } });

    const submitButton = screen.getByText('Submit Experience');
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });
});