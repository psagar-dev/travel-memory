import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Home from './components/pages/Home';
import AddExperience from './components/pages/AddExperience';
import ExperienceDetails from './components/pages/ExperienceDetails';
import Header from './components/UIC/Header';
import axios from 'axios';
// Mock axios
jest.mock('axios');

const routes = [
  {
    path: '/',
    element: (
      <>
        <Header />
        <Home />
      </>
    )
  },
  {
    path: '/addexperience',
    element: (
      <>
        <Header />
        <AddExperience />
      </>
    )
  },
  {
    path: '/experiencedetails/:id',
    element: (
      <>
        <Header />
        <ExperienceDetails />
      </>
    )
  }
];

describe('App Component', () => {

  beforeEach(() => {
    // Provide default mock response for axios.get
    axios.get.mockResolvedValue({
      data: {
        data: [], // Simulate empty list of trips
      },
    });
  });

  test('renders home page with header',async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);

    
    expect(await screen.findByText(/Travel Memory/i)).toBeInTheDocument();
    expect(await screen.findByText(/add experience/i)).toBeInTheDocument();
  });

  test('renders add experience page', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/addexperience'],
    });

    render(<RouterProvider router={router} />);
    expect(screen.getByText(/add new experience/i)).toBeInTheDocument();
  });
});