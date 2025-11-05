import { render, screen } from '@testing-library/react';
import { Sidebar } from '../sidebar';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/employees'),
}));

describe('Sidebar', () => {
  it('should render sidebar with 5 menu items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Overtime')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should highlight active menu item', () => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/employees');

    render(<Sidebar />);

    const employeesLink = screen.getByText('Employees').closest('a');
    expect(employeesLink).toHaveClass('bg-sidebar-primary');
  });

  it('should render correct icons for each menu item', () => {
    render(<Sidebar />);

    // Check that all menu items have icons (SVG elements)
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);

    links.forEach((link) => {
      const svg = link.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('should have correct hrefs for navigation links', () => {
    render(<Sidebar />);

    expect(screen.getByText('Employees').closest('a')).toHaveAttribute('href', '/employees');
    expect(screen.getByText('Data').closest('a')).toHaveAttribute('href', '/data');
    expect(screen.getByText('Overtime').closest('a')).toHaveAttribute('href', '/overtime');
    expect(screen.getByText('Reports').closest('a')).toHaveAttribute('href', '/reports');
    expect(screen.getByText('Admin').closest('a')).toHaveAttribute('href', '/admin');
  });
});
