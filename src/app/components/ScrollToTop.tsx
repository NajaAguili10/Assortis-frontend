import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * ScrollToTop Component
 * Automatically scrolls to the top of the page when navigating to a new route
 */
export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' for immediate scroll, 'smooth' for animated
    });
  }, [location.pathname, location.search]); // Trigger on pathname or search params change

  return null; // This component doesn't render anything
}