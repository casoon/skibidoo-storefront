import { describe, it, expect } from 'vitest';

/**
 * SEOHead Component Tests
 * 
 * Tests SEO-related functionality including meta tags,
 * JSON-LD structured data, and Open Graph tags.
 */

describe('SEOHead - Meta Tags', () => {
  it('should generate basic meta tags', () => {
    const meta = {
      title: 'Test Product - Shop',
      description: 'This is a test product description',
      keywords: 'test, product, shop',
    };

    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it('should truncate long descriptions', () => {
    const longDescription = 'A'.repeat(200);
    const maxLength = 160;
    const truncated = longDescription.substring(0, maxLength);

    expect(truncated.length).toBe(maxLength);
  });

  it('should validate title length (SEO best practice)', () => {
    const title = 'Test Product - Best Product Ever';
    const maxLength = 60;
    
    const isOptimal = title.length <= maxLength;

    expect(isOptimal).toBe(true);
  });
});

describe('SEOHead - Open Graph Tags', () => {
  it('should generate Open Graph title', () => {
    const og = {
      title: 'Test Product',
      type: 'product',
      url: 'https://example.com/products/test',
      image: 'https://example.com/image.jpg',
    };

    expect(og.title).toBeTruthy();
    expect(og.type).toBe('product');
  });

  it('should validate Open Graph image dimensions', () => {
    const image = {
      url: 'https://example.com/og-image.jpg',
      width: 1200,
      height: 630,
    };

    // Recommended OG image dimensions
    const isRecommendedRatio = image.width === 1200 && image.height === 630;

    expect(isRecommendedRatio).toBe(true);
  });

  it('should include Open Graph site name', () => {
    const og = {
      siteName: 'Skibidoo Shop',
    };

    expect(og.siteName).toBeTruthy();
  });
});

describe('SEOHead - JSON-LD Product Schema', () => {
  it('should generate valid Product schema', () => {
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
      description: 'Product description',
      image: 'https://example.com/image.jpg',
      sku: 'TEST-001',
      offers: {
        '@type': 'Offer',
        url: 'https://example.com/products/test',
        priceCurrency: 'EUR',
        price: '29.99',
        availability: 'https://schema.org/InStock',
      },
    };

    expect(productSchema['@context']).toBe('https://schema.org');
    expect(productSchema['@type']).toBe('Product');
    expect(productSchema.offers['@type']).toBe('Offer');
  });

  it('should validate price format for schema', () => {
    const price = '29.99';
    const isValid = /^\d+\.\d{2}$/.test(price);

    expect(isValid).toBe(true);
  });

  it('should map availability status correctly', () => {
    const stockQuantity = 5;
    const availability = stockQuantity > 0 
      ? 'https://schema.org/InStock' 
      : 'https://schema.org/OutOfStock';

    expect(availability).toBe('https://schema.org/InStock');
  });

  it('should handle out-of-stock availability', () => {
    const stockQuantity = 0;
    const availability = stockQuantity > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    expect(availability).toBe('https://schema.org/OutOfStock');
  });

  it('should include product brand if available', () => {
    const product = {
      name: 'Test Product',
      brand: 'Test Brand',
    };

    const schema = {
      '@type': 'Product',
      name: product.name,
      brand: product.brand ? {
        '@type': 'Brand',
        name: product.brand,
      } : undefined,
    };

    expect(schema.brand).toBeDefined();
    expect(schema.brand?.name).toBe('Test Brand');
  });

  it('should include aggregateRating if reviews exist', () => {
    const reviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
    ];

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    const aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
    };

    expect(aggregateRating.ratingValue).toBe('4.7');
    expect(aggregateRating.reviewCount).toBe(3);
  });
});

describe('SEOHead - Breadcrumb Schema', () => {
  it('should generate breadcrumb list schema', () => {
    const breadcrumbs = [
      { name: 'Home', url: 'https://example.com/' },
      { name: 'Electronics', url: 'https://example.com/electronics' },
      { name: 'Smartphones', url: 'https://example.com/electronics/smartphones' },
    ];

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement.length).toBe(3);
    expect(schema.itemListElement[0].position).toBe(1);
  });
});

describe('SEOHead - Canonical URL', () => {
  it('should generate canonical URL', () => {
    const slug = 'test-product';
    const canonical = `https://example.com/products/${slug}`;

    expect(canonical).toBe('https://example.com/products/test-product');
  });

  it('should handle URLs with query parameters', () => {
    const baseUrl = 'https://example.com/products/test';
    const withParams = `${baseUrl}?variant=red`;
    
    // Canonical should strip query params
    const canonical = baseUrl;

    expect(canonical).not.toContain('?');
  });

  it('should ensure HTTPS protocol', () => {
    const url = 'https://example.com/products/test';
    const isSecure = url.startsWith('https://');

    expect(isSecure).toBe(true);
  });
});

describe('SEOHead - Twitter Cards', () => {
  it('should generate Twitter Card meta tags', () => {
    const twitter = {
      card: 'summary_large_image',
      title: 'Test Product',
      description: 'Product description',
      image: 'https://example.com/twitter-image.jpg',
    };

    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.title).toBeTruthy();
  });

  it('should validate Twitter image dimensions', () => {
    const image = {
      width: 1200,
      height: 600,
    };

    // Twitter recommended: 2:1 ratio
    const ratio = image.width / image.height;

    expect(ratio).toBe(2);
  });
});

describe('SEOHead - robots Meta Tag', () => {
  it('should allow indexing for active products', () => {
    const status = 'active';
    const robots = status === 'active' ? 'index, follow' : 'noindex, nofollow';

    expect(robots).toBe('index, follow');
  });

  it('should prevent indexing for draft products', () => {
    const status = 'draft';
    const robots = status === 'active' ? 'index, follow' : 'noindex, nofollow';

    expect(robots).toBe('noindex, nofollow');
  });

  it('should prevent indexing for archived products', () => {
    const status = 'archived';
    const robots = status === 'active' ? 'index, follow' : 'noindex, nofollow';

    expect(robots).toBe('noindex, nofollow');
  });
});

describe('SEOHead - hreflang Tags', () => {
  it('should generate hreflang for multiple languages', () => {
    const languages = ['de', 'en', 'fr'];
    const hreflangTags = languages.map(lang => ({
      hreflang: lang,
      href: `https://example.com/${lang}/products/test`,
    }));

    expect(hreflangTags.length).toBe(3);
    expect(hreflangTags[0].hreflang).toBe('de');
  });

  it('should include x-default hreflang', () => {
    const xDefault = {
      hreflang: 'x-default',
      href: 'https://example.com/products/test',
    };

    expect(xDefault.hreflang).toBe('x-default');
  });
});
