import { render, screen } from '@testing-library/react';
import Card from './Card';
import { BrowserRouter } from 'react-router-dom';

describe('Card Component', () => {
  const mockProps = {
    id: '123',
    title: 'Test Trip',
    description: 'Test Description',
    image: 'test-image.jpg',
    tripType: 'leisure'
  };

  const renderCard = (props = mockProps) => {
    return render(
      <BrowserRouter>
        <Card {...props} />
      </BrowserRouter>
    );
  };

  test('renders card with correct content', () => {
    renderCard();
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByText(mockProps.tripType)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockProps.image);
  });

  test('renders with default image when image prop is missing', () => {
    const propsWithoutImage = { ...mockProps, image: '' };
    renderCard(propsWithoutImage);
    
    const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop";
    expect(screen.getByRole('img')).toHaveAttribute('src', defaultImage);
  });

  test('has correct link to experience details', () => {
    renderCard();
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/experiencedetails/${mockProps.id}`);
  });
});