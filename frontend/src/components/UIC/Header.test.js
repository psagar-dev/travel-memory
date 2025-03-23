import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  test('renders logo and title', () => {
    renderHeader();
    const title = screen.getByText('Travel Memory');
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('href', '/');
  });

  test('renders Add Experience link', () => {
    renderHeader();
    const addButton = screen.getByText('Add Experience');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('href', '/addexperience');
    expect(addButton).toHaveClass('bg-blue-500', 'text-white');
  });

  test('has correct layout structure', () => {
    renderHeader();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-white', 'shadow-lg');
  });
});