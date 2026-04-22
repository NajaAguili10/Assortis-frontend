// DIMENSIONS DES BANNIÈRES ASSORTIS
export const BANNER_DIMENSIONS = {
  height: {
    default: '240px',  // Compressed from 280px
    compact: '180px',  // Compressed from 200px
    large: '280px',    // Compressed from 320px
  },
  iconSize: {
    width: '48px',     // Compressed from 56px
    height: '48px',    // Compressed from 56px
  },
} as const;

export type BannerSize = 'default' | 'compact' | 'large';