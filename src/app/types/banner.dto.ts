// DIMENSIONS DES BANNIÈRES ASSORTIS
export const BANNER_DIMENSIONS = {
  height: {
    default: '140px',
    compact: '120px',
    large: '180px',
  },
  iconSize: {
    width: '48px',     // Compressed from 56px
    height: '48px',    // Compressed from 56px
  },
} as const;

export type BannerSize = 'default' | 'compact' | 'large';
