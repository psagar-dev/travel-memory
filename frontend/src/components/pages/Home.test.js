import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';

// Mock axios
jest.mock('axios');

const mockTrips = {
  data: {
    data: [
      {
        _id: '1',
        tripName: 'Featured Trip',
        shortDescription: 'A featured trip',
        image: 'featured.jpg',
        tripType: 'leisure',
        featured: true
      },
      {
        _id: '2',
        tripName: 'Regular Trip',
        shortDescription: 'A regular trip',
        image: 'regular.jpg',
        tripType: 'backpacking',
        featured: false
      }
    ]
  }
};

describe('Home Component', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('renders both featured and regular trips', async () => {
    axios.get.mockResolvedValueOnce(mockTrips);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Featured trip should be present
      expect(screen.getByText('Featured Trip')).toBeInTheDocument();
    });

    await waitFor(() => {
      // Regular trip should be present
      expect(screen.getByText('Regular Trip')).toBeInTheDocument();
    });
  });

  test('renders empty state when no trips', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No trips found.')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No trips found.')).toBeInTheDocument();
    });
  });

  test('displays correct trip types', async () => {
    axios.get.mockResolvedValueOnce(mockTrips);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('leisure')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('backpacking')).toBeInTheDocument();
    });
  });
});