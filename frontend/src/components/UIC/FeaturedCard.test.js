import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeaturedCard from './FeaturedCard';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('FeaturedCard Component', () => {
  const mockProps = {
    id: '123',
    title: 'Featured Trip',
    description: 'Test Description',
    image: 'test-image.jpg',
    tripType: 'leisure'
  };

  const renderFeaturedCard = (props = mockProps) => {
    return render(
      <BrowserRouter>
        <FeaturedCard {...props} />
      </BrowserRouter>
    );
  };

  test('renders featured card with all content', () => {
    renderFeaturedCard();
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByText(mockProps.tripType)).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockProps.image);
    expect(screen.getByRole('button')).toHaveTextContent('More Details');
  });

  test('renders with default image when image prop is missing', () => {
    const propsWithoutImage = { ...mockProps, image: '' };
    renderFeaturedCard(propsWithoutImage);
    
    const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop";
    expect(screen.getByRole('img')).toHaveAttribute('src', defaultImage);
  });

  test('navigates to details page when clicked', () => {
    renderFeaturedCard();
    
    const moreDetailsButton = screen.getByText('More Details');
    fireEvent.click(moreDetailsButton);
    expect(mockNavigate).toHaveBeenCalledWith(`/experiencedetails/${mockProps.id}`);
  });

  test('has featured badge', () => {
    renderFeaturedCard();
    
    const featuredBadge = screen.getByText('Featured');
    expect(featuredBadge).toHaveClass('bg-yellow-400', 'text-gray-900');
  });
});