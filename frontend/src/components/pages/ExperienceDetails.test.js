import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ExperienceDetails from './ExperienceDetails';

// Mock useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '123'
  })
}));

// Mock axios
jest.mock('axios');

const mockTrip = {
  data: {
    data: {
      _id: '123',
      tripName: 'Test Trip',
      shortDescription: 'Test Description',
      experience: 'Detailed test experience',
      image: 'test-image.jpg',
      startDateOfJourney: '2025-03-23',
      endDateOfJourney: '2025-03-24',
      nameOfHotels: 'Test Hotel',
      placesVisited: 'Test Location',
      tripType: 'leisure',
      totalCost: 1000
    }
  }
};

describe('ExperienceDetails Component', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <ExperienceDetails />
      </BrowserRouter>
    );

    const loadingElement = screen.getByTestId('loading-spinner');
    expect(loadingElement).toBeInTheDocument();
  });

  test('renders trip details after successful fetch', async () => {
    axios.get.mockResolvedValueOnce(mockTrip);

    render(
      <BrowserRouter>
        <ExperienceDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockTrip.data.data.tripName)).toBeInTheDocument();
      expect(screen.getByText(mockTrip.data.data.experience)).toBeInTheDocument();
      expect(screen.getByText(mockTrip.data.data.placesVisited)).toBeInTheDocument();
      expect(screen.getByText(mockTrip.data.data.nameOfHotels)).toBeInTheDocument();
      expect(screen.getByText('₹1,000')).toBeInTheDocument();
    });
  });

  test('renders error state when fetch fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <ExperienceDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Trip not found.')).toBeInTheDocument();
    });
  });

  test('renders image with default fallback', async () => {
    const tripWithoutImage = {
      data: {
        data: {
          ...mockTrip.data.data,
          image: ''
        }
      }
    };
    
    axios.get.mockResolvedValueOnce(tripWithoutImage);

    render(
      <BrowserRouter>
        <ExperienceDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', expect.stringContaining('unsplash.com'));
    });
  });
});