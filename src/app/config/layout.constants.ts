/**
 * ASSORTIS LAYOUT CONSTANTS
 * Compressed SaaS-grade layout system
 */

export const LAYOUT = {
  // Container Widths - COMPRESSED
  container: {
    maxWidth: '1200px',        // Reduced from 1280px
    className: 'max-w-6xl',    // Tailwind class (1152px, closest to 1200px)
  },

  // Banner Heights - COMPRESSED
  banner: {
    default: '240px',          // Reduced from 280px
    compact: '180px',          // Reduced from 200px
    large: '280px',            // Reduced from 320px
  },

  // Spacing Scale - COMPRESSED
  spacing: {
    containerY: 'py-6',        // Reduced from py-8 (24px instead of 32px)
    containerX: {
      mobile: 'px-4',          // 16px
      tablet: 'sm:px-5',       // 20px (reduced from 24px)
      desktop: 'lg:px-6',      // 24px (reduced from 32px)
    },
    sectionGap: 'gap-5',       // 20px (reduced from 24px)
    cardGap: 'gap-5',          // 20px (reduced from 24px)
    margin: {
      section: 'mb-6',         // 24px (reduced from 32px)
      container: 'my-6',       // 24px (reduced from 32px)
    },
  },

  // Grid Configurations
  grid: {
    kpi: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    features: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    actions: 'grid-cols-1 md:grid-cols-2',
  },

  // Padding Presets
  padding: {
    page: 'px-4 sm:px-5 lg:px-6 py-6',
    tight: 'px-4 sm:px-5 lg:px-6 py-4',
    banner: 'px-4 sm:px-5 lg:px-6',
  },
} as const;

export type LayoutConfig = typeof LAYOUT;
