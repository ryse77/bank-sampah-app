/**
 * Helper functions untuk artikel
 */

export interface ImageUrls {
  desktop: string;
  tablet: string;
  mobile: string;
}

/**
 * Get image URL dari artikel
 * Support both legacy (string URL) dan new format (JSON object)
 *
 * @param gambar - Bisa berupa string URL atau JSON string dengan {desktop, tablet, mobile}
 * @param deviceType - Type device: 'desktop' | 'tablet' | 'mobile' (default: 'desktop')
 * @returns URL gambar atau empty string
 */
export function getArtikelImageUrl(
  gambar: string | null | undefined,
  deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): string {
  if (!gambar) return '';

  // Legacy format: direct URL string
  if (!gambar.startsWith('{')) {
    return gambar;
  }

  // New format: JSON object with multiple sizes
  try {
    const parsed: ImageUrls = JSON.parse(gambar);

    // Return URL based on device type, with fallbacks
    switch (deviceType) {
      case 'mobile':
        return parsed.mobile || parsed.tablet || parsed.desktop || '';
      case 'tablet':
        return parsed.tablet || parsed.desktop || parsed.mobile || '';
      case 'desktop':
      default:
        return parsed.desktop || parsed.tablet || parsed.mobile || '';
    }
  } catch (error) {
    // If parse fails, assume it's a legacy URL
    console.warn('Failed to parse artikel gambar:', error);
    return gambar;
  }
}

/**
 * Get responsive image URLs for <picture> element
 *
 * @param gambar - Bisa berupa string URL atau JSON string dengan {desktop, tablet, mobile}
 * @returns Object with URLs for each device type
 */
export function getResponsiveImageUrls(
  gambar: string | null | undefined
): { desktop: string; tablet: string; mobile: string } {
  if (!gambar) {
    return { desktop: '', tablet: '', mobile: '' };
  }

  // Legacy format: use same URL for all devices
  if (!gambar.startsWith('{')) {
    return { desktop: gambar, tablet: gambar, mobile: gambar };
  }

  // New format: parse and return all URLs
  try {
    const parsed: ImageUrls = JSON.parse(gambar);
    return {
      desktop: parsed.desktop || '',
      tablet: parsed.tablet || parsed.desktop || '',
      mobile: parsed.mobile || parsed.tablet || parsed.desktop || ''
    };
  } catch (error) {
    console.warn('Failed to parse artikel gambar:', error);
    return { desktop: gambar, tablet: gambar, mobile: gambar };
  }
}
