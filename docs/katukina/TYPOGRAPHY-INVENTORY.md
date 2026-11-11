# Inventário tipográfico por seletor

Gerado por `node scripts/audit-typography.mjs --write`. Fonte: CSS local; não substitui os estilos computados em navegador. Valores ausentes são herdados ou definidos por outra regra. Regras posteriores e especificidade determinam o resultado final. Inclui folhas históricas para evitar reintroduzir estilos antigos.

Sistema e critérios: [TYPOGRAPHY.md](TYPOGRAPHY.md).

## app/catalog.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| .catalog-intro · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-intro h1 · base | inherit / see cascade | clamp(2.125rem, 4.5vw, 3.5rem) | inherit / see cascade | 1.12 | -0.04em |
| .catalog-intro > p:last-child · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-browse summary · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .subcategory-grid a · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-sidebar h2 · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | -0.02em |
| .catalog-filter-form · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-filter-form > label · base | inherit / see cascade | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .catalog-filter-form input, .catalog-filter-form select, .catalog-sort select, .purchase-fields select, .purchase-fields input · base | inherit | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-filter-form legend · base | inherit / see cascade | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .stock-checkbox span · base | inherit / see cascade | inherit / see cascade | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .catalog-filter-form .button · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .filter-clear · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-result-count · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-sort · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-sort select · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .active-filters a · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collection-intro h2 · base | inherit / see cascade | clamp(2rem, 3.8vw, 3.25rem) | inherit / see cascade | 1.15 | -0.035em |
| .collection-intro p · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | 1.6 | inherit / see cascade |
| .collection-intro .text-link · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collection-paths h3 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | 1.35 | -0.025em |
| .collection-paths-scroll-hint · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | 1.5 | inherit / see cascade |
| .category-photo-copy h4 · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.2 | -0.025em |
| .collection-paths h3 · @media (max-width: 1100px) | inherit / see cascade | var(--text-price) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collection-paths h3 · @media (max-width: 600px) | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collection-intro p · @media (max-width: 600px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-collection .product-grid-v2 .product-category · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | inherit / see cascade | 0.06em |
| .home-collection .product-grid-v2 .product-info h3 · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | 1.4 | inherit / see cascade |
| .home-collection .product-grid-v2 .product-price · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-collection .product-stock · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-collection .product-card-action, .home-collection .product-grid-v2 .purchase-actions .button · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .collections-banner .button · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .home-collection .product-grid-v2 .product-category · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-collection .product-grid-v2 .product-info h3 · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-collection .product-grid-v2 .product-price · @media (max-width: 600px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-image-placeholder · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-grid-v2 .product-info h3 · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.45 | -0.025em |
| .product-grid-v2 .product-category · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.5 | inherit / see cascade |
| .product-grid-v2 .product-price · base | inherit / see cascade | var(--text-price) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-stock · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-card-action · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .product-grid-v2 .purchase-actions .button · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-pagination a · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-range · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .filter-dialog-heading h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .gallery-expand · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .gallery-navigation · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .gallery-navigation button · base | inherit | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .gallery-placeholder p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-purchase-panel h1 · base | inherit / see cascade | clamp(1.875rem, 3.5vw, 3rem) | inherit / see cascade | 1.15 | -0.035em |
| .product-summary · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.7 | inherit / see cascade |
| .purchase-price > p · base | inherit / see cascade | var(--text-subheading) | var(--weight-semibold) | inherit / see cascade | -0.03em |
| .purchase-price > span · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .purchase-fields label · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .purchase-fields select · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .purchase-availability p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .stock-available · base | inherit / see cascade | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .purchase-availability .purchase-sku · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-quantity > p · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .purchase-delivery · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-information h2, .related-heading h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | -0.03em |
| .product-description-text · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.9 | inherit / see cascade |
| .product-category-tags a · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .mobile-filters-button · @media (max-width: 850px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-purchase-panel h1 · @media (max-width: 850px) | inherit / see cascade | var(--text-page-small) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-intro h1 · @media (max-width: 600px) | inherit / see cascade | var(--text-page-small) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-intro > p:last-child · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .subcategory-grid a · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-sort · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-sort select · @media (max-width: 600px) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-result-count · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-grid-v2 .product-info h3 · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-grid-v2 .product-price · @media (max-width: 600px) | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-grid-v2 .product-category · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-card-action · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-page-v2 .breadcrumbs · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .purchase-price > p · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-intro h1 · base | inherit / see cascade | clamp(1.875rem, 3.2vw, 2.75rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-list · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-list h2 · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-list a · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.4 | inherit / see cascade |
| .category-list a[aria-current="page"] · base | inherit / see cascade | inherit / see cascade | var(--weight-bold) | inherit / see cascade | inherit / see cascade |
| .category-count · base | inherit / see cascade | var(--text-meta) | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .category-list .category-ancestor · base | inherit / see cascade | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .filter-show-more, .swatch-clear · base | inherit | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .filter-section summary · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .catalog-filter-form .stock-checkbox · base | inherit / see cascade | inherit / see cascade | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .catalog-filter-form .rating-stars, .rating-stars · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1px |
| .product-sale-badge · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-grid-v2 .product-price del · base | inherit / see cascade | var(--text-meta) | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .product-rating · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-more-options · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .presentation-field > legend · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .presentation-selection · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .option-shared-details · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .purchase-fields .presentation-swatch · base | inherit / see cascade | var(--text-ui) | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .swatch-content strong · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .swatch-content > span · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .swatch-content small · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-results .product-info h3 · @media (min-width: 1200px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-summary, .product-description-text · base | inherit / see cascade | 1rem | inherit / see cascade | 1.75 | inherit / see cascade |
| .product-purchase-panel h1 · @media (max-width: 600px) | inherit / see cascade | clamp(1.75rem, 8vw, 2.25rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-price, .purchase-price, .commerce-totals · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-sort, .catalog-sort select, .catalog-result-count, .product-card-action · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |

## app/category-reference.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| .category-reference.catalog-page · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference > .breadcrumbs · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference > .catalog-intro · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference > .catalog-intro h1 · base | var(--font-display) | clamp(2rem, 3.2vw, 3rem) | var(--weight-semibold) | inherit / see cascade | -0.025em |
| .category-reference > .catalog-intro > p:last-child · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-campaign > div · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-campaign .eyebrow · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-campaign h2 · base | var(--font-display) | clamp(1.5rem, 2.5vw, 2.25rem) | inherit / see cascade | 1.15 | inherit / see cascade |
| .category-reference .category-campaign p:not(.eyebrow) · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-campaign .button · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-discovery > a · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.5 | inherit / see cascade |
| .category-reference .catalog-results .product-info h3 · base | var(--font-display) | var(--text-body) | var(--weight-semibold) | 1.5 | 0 |
| .category-reference .catalog-results .product-more-options · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .catalog-results .product-price · base | inherit / see cascade | var(--text-price) | var(--weight-semibold) | 1.4 | inherit / see cascade |
| .category-reference .catalog-results .product-stock · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-subscribe h2 · base | var(--font-display) | var(--text-price) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-subscribe p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-subscribe .button · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-editorial h2 · base | var(--font-display) | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-editorial > div > a · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-editorial h3 · base | var(--font-display) | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-editorial p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-campaign h2 · @media (max-width: 800px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .category-discovery > a · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .catalog-results .product-info h3 · @media (max-width: 800px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-reference .catalog-results .product-price · @media (max-width: 800px) | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |

## app/globals.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| body · base | 400 1rem/1.65 var(--font-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| button, input, select, textarea · base | inherit | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| h1, h2, h3, h4, h5, h6 · base | var(--font-display) | inherit / see cascade | var(--weight-semibold) | 1.2 | -0.025em |
| h2 · base | inherit / see cascade | clamp(2rem, 4vw, 3.375rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| img · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .shell · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .eyebrow · base | inherit / see cascade | var(--text-meta) | var(--weight-bold) | 1.5 | 0.15em |
| .button · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | 1.45 | inherit / see cascade |
| .text-link · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | 1.45 | inherit / see cascade |
| .site-note · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | 0.05em |
| .destination-selector · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .destination-selector select · base | inherit | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .purchase-actions select · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .wordmark · base | inherit / see cascade | var(--text-page-small) | var(--weight-bold) | 1 | -0.04em |
| .desktop-navigation · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .category-navigation · base | var(--font-display) | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .header-action-label · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .search input · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .search-status · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .search-suggestions strong · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .search-suggestions span span · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .live-search .search input · @media (max-width: 600px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .mobile-navigation a · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · base | inherit / see cascade | clamp(4.25rem, 7.7vw, 6.875rem) | inherit / see cascade | 0.99 | -0.035em |
| .hero-description · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.85 | inherit / see cascade |
| .hero-scroll · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-topline · base | inherit / see cascade | var(--text-meta) | var(--weight-bold) | inherit / see cascade | 0.15em |
| .feature-badge · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | 1.35 | inherit / see cascade |
| .feature-caption .eyebrow · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-caption h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-caption > span · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .hero-bottom · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-bottom > span:last-child · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | 0.12em |
| .section-heading h2 · base | inherit / see cascade | clamp(2rem, 4vw, 3.3125rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-aside · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-aside p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.8 | inherit / see cascade |
| .product-category · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | inherit / see cascade | 0.09em |
| .product-title-row h3 · base | inherit / see cascade | var(--text-price) | inherit / see cascade | 1.25 | -0.04em |
| .product-price · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .product-note · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | 1.8 | inherit / see cascade |
| .collection-paths > span · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collection-paths > a · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collections-banner-copy · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collections-banner-copy h2 · base | inherit / see cascade | clamp(2rem, 3vw, 3rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collections-banner-copy p · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.6 | inherit / see cascade |
| .journal-invite > div:last-child · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .journal-invite > div > p:not(.eyebrow) · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.9 | inherit / see cascade |
| .footer-intro h2 · base | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | -0.035em |
| .footer-intro p · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | 1.9 | inherit / see cascade |
| .footer-links h3 · base | inherit / see cascade | var(--text-meta) | var(--weight-bold) | inherit / see cascade | 0.04em |
| .footer-links a · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-links .footer-cta · base | inherit / see cascade | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .footer-signature · base | inherit / see cascade | clamp(3rem, 18cqw, 16.25rem) | var(--weight-semibold) | 1.05 | -0.035em |
| .footer-bottom · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .page-intro nav, .breadcrumbs · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .page-intro h1 · base | inherit / see cascade | clamp(2.5rem, 5.5vw, 4.75rem) | inherit / see cascade | 1.12 | -0.035em |
| .page-intro > p:last-child:not(.eyebrow) · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-links a · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-count · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .pagination · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .no-results h2 · base | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .no-results p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .journal-card h2 · base | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .journal-card p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .editorial-text · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.9 | inherit / see cascade |
| .editorial-text h2 · base | inherit / see cascade | clamp(1.5rem, 2.5vw, 2rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .service-message h2 · base | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .service-message p · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .muted · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .empty-page h1 · base | inherit / see cascade | clamp(2.5rem, 5vw, 4.375rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .detail-copy h1 · base | inherit / see cascade | clamp(2rem, 3.6vw, 3.0625rem) | inherit / see cascade | inherit / see cascade | -0.035em |
| .detail-copy .editorial-text · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.85 | inherit / see cascade |
| .detail-price · base | inherit / see cascade | var(--text-subheading) | var(--weight-semibold) | inherit / see cascade | -0.035em |
| .availability-note · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-facts > div · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-description h2 · base | inherit / see cascade | var(--text-subheading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-description p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.95 | inherit / see cascade |
| .origins-art p · base | inherit / see cascade | var(--text-page) | inherit / see cascade | 1.15 | -0.035em |
| .ornament · base | inherit / see cascade | var(--text-page) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .origins-copy h2 · base | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .origins-copy h2 em · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .origins-copy p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · @media (max-width: 1100px) | inherit / see cascade | var(--text-display-large) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .wordmark · @media (max-width: 800px) | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | -0.04em |
| .site-note · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .search input · @media (max-width: 800px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .search .button · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · @media (max-width: 800px) | inherit / see cascade | var(--text-display) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-description · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy .button · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-scroll · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-badge · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-topline · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-caption h2 · @media (max-width: 800px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-caption > span · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-bottom > span:last-child · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-aside · @media (max-width: 800px) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-aside p · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-title-row h3 · @media (max-width: 800px) | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-price · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-note · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-intro h2 · @media (max-width: 800px) | inherit / see cascade | var(--text-subheading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-links a · @media (max-width: 800px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .origins-art p · @media (max-width: 800px) | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .origins-copy h2 · @media (max-width: 800px) | inherit / see cascade | var(--text-subheading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · @media (max-width: 600px) | inherit / see cascade | clamp(4.0625rem, 17vw, 5.75rem) | inherit / see cascade | 1.02 | inherit / see cascade |
| .hero-description · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy .button · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-caption h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .feature-badge · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-bottom · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-heading h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-page-small) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-aside · @media (max-width: 600px) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-aside p · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .section-aside .text-link · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-title-row h3 · @media (max-width: 600px) | inherit / see cascade | var(--text-lead) | inherit / see cascade | 1.3 | inherit / see cascade |
| .product-price · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-category · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | 1.5 | 0.06em |
| .product-note · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .collection-paths > a · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .journal-invite h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-page-small) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .journal-invite > div:last-child · @media (max-width: 600px) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .journal-invite > div > p:not(.eyebrow) · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-intro h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-links h3 · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-links a · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-links .footer-cta · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-signature · @media (max-width: 600px) | inherit / see cascade | 18cqw | inherit / see cascade | inherit / see cascade | -0.035em |
| .footer-bottom · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .page-intro nav · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .page-intro h1 · @media (max-width: 600px) | inherit / see cascade | var(--text-page-large) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .page-intro > p:last-child:not(.eyebrow) · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .category-links a · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .catalog-count · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .journal-card h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-page .breadcrumbs · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .detail-copy h1 · @media (max-width: 600px) | inherit / see cascade | var(--text-page-small) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .detail-price · @media (max-width: 600px) | inherit / see cascade | var(--text-subheading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .detail-copy .editorial-text · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-description p · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-description h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .origins-art p · @media (max-width: 600px) | inherit / see cascade | var(--text-page) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .origins-copy h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .service-message h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-subheading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .service-message p · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .no-results h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .wordmark · @media (max-width: 360px) | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · @media (max-width: 360px) | inherit / see cascade | var(--text-display) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .product-title-row h3 · @media (max-width: 360px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-page>h1 · base | inherit / see cascade | clamp(2.25rem,5vw,3.875rem) | inherit / see cascade | inherit / see cascade | -.04em |
| .commerce-notice · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .commerce-error · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.5 | inherit / see cascade |
| .commerce-summary>h2,.commerce-form>h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .cart-line h2 · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | 1.5 | inherit / see cascade |
| .cart-line p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-totals>div · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-grand-total · base | inherit / see cascade | var(--text-lead)!important | var(--weight-bold) | inherit / see cascade | inherit / see cascade |
| .commerce-form label · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .commerce-form input,.commerce-form select,.coupon-form input · base | inherit | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-check · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.5 | inherit / see cascade |
| .shipping-options · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .shipping-options legend · base | inherit / see cascade | inherit / see cascade | var(--weight-bold) | inherit / see cascade | inherit / see cascade |
| .shipping-options label · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.5 | inherit / see cascade |
| .checkout-line · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .commerce-caption,.reviewed-address · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | 1.6 | inherit / see cascade |
| .commerce-empty,.commerce-success · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-success h2 · base | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-success p · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.7 | inherit / see cascade |
| .purchase-actions p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .account-form · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .account-orders article · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-layout .text-link · base | inherit | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .commerce-summary>p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .wordmark, .footer-signature, .button, .text-link, .desktop-navigation, .mobile-navigation · base | var(--font-display) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · base | inherit / see cascade | clamp(4rem, 7vw, 6rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-description, .editorial-text, .detail-copy .editorial-text · base | inherit / see cascade | 1rem | inherit / see cascade | 1.75 | inherit / see cascade |
| .commerce-form input, .commerce-form select, .coupon-form input · base | var(--font-body) | 1rem | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · @media (min-width: 801px) and (max-width: 1100px) | inherit / see cascade | clamp(3.5rem, 6.8vw, 4.75rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-copy h1 · @media (max-width: 600px) | inherit / see cascade | clamp(3rem, 13.5vw, 5rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .footer-signature · @media (max-width: 600px) | inherit / see cascade | 18cqw | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-campaign .hero-copy · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-campaign .hero-copy :is(h1, h2) · base | inherit / see cascade | clamp(2.75rem, 4.3vw, 4.25rem) | var(--weight-bold) | 1.16 | -0.035em |
| .hero-campaign .hero-description · base | inherit / see cascade | 1rem | inherit / see cascade | 1.75 | inherit / see cascade |
| .hero-highlights strong · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | 1.5 | inherit / see cascade |
| .hero-highlights small · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | 1.5 | inherit / see cascade |
| .hero-campaign .hero-copy · @media (min-width: 601px) and (max-width: 1100px) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-campaign .hero-copy :is(h1, h2) · @media (min-width: 601px) and (max-width: 1100px) | inherit / see cascade | clamp(2.4rem, 4.6vw, 3rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-campaign .hero-copy :is(h1, h2) · @media (max-width: 600px) | inherit / see cascade | clamp(2rem, 7.7vw, 2.85rem) | inherit / see cascade | 1.2 | inherit / see cascade |
| .hero-campaign .hero-description · @media (max-width: 600px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-highlights strong · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-highlights small · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-carousel .hero-copy :is(h1, h2) · base | inherit / see cascade | clamp(2rem, min(4.3vw, 6.6svh), 4.25rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .hero-carousel .hero-copy :is(h1, h2) · @media (max-width: 600px) | inherit / see cascade | clamp(1.65rem, min(7.7vw, 4.5svh), 2.85rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| h1 · base | inherit / see cascade | clamp(2rem, 3.5vw, 3rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| h3 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| h4 · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| h5, h6 · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| strong, b · base | inherit / see cascade | inherit / see cascade | var(--weight-bold) | inherit / see cascade | inherit / see cascade |
| h1 em, h2 em, h3 em · base | inherit / see cascade | inherit / see cascade | var(--weight-bold) | inherit / see cascade | inherit / see cascade |

## app/home.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| .home-modern .home-kicker · base | inherit / see cascade | var(--text-meta) | var(--weight-bold) | 1.6 | 0.13em |
| .home-hero h1 · base | inherit / see cascade | clamp(3.375rem, 6.6vw, 5.875rem) | var(--weight-semibold) | 1.02 | -0.03em |
| .home-intro · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.85 | inherit / see cascade |
| .home-story-link · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .home-scroll · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-photo-label > span · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | 1.6 | 0.14em |
| .home-photo-caption · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-featured h2 · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | -0.03em |
| .home-featured > div > span:last-child · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-manifesto span · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | inherit / see cascade | 0.045em |
| .home-section-heading h2 · base | inherit / see cascade | clamp(1.75rem, 3vw, 2.5625rem) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .home-section-heading .text-link · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-collection-image > span:first-of-type · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-collection h3 · base | inherit / see cascade | var(--text-card-title) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .home-collection p · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-modern .product-card h3 · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-roots-art > span · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | 0.18em |
| .home-roots-copy h2 · base | inherit / see cascade | clamp(3.125rem, 5.7vw, 4.875rem) | inherit / see cascade | 1.02 | inherit / see cascade |
| .home-roots-copy h2 em · base | var(--font-display) | inherit / see cascade | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .home-roots-copy > p:not(.home-kicker) · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.9 | inherit / see cascade |
| .home-journal h2 · base | inherit / see cascade | var(--text-page-large) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-journal > p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-journal-link · base | inherit / see cascade | var(--text-meta) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .home-hero h1 · @media (max-width: 1050px) | inherit / see cascade | var(--text-display) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-hero-copy > .home-kicker · @media (max-width: 760px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-hero h1 · @media (max-width: 760px) | inherit / see cascade | clamp(3.1875rem, 10vw, 4.625rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-intro · @media (max-width: 760px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-featured h2 · @media (max-width: 760px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-featured .home-kicker · @media (max-width: 760px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-manifesto span · @media (max-width: 760px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-modern .product-card h3 · @media (max-width: 760px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-roots-copy h2 · @media (max-width: 760px) | inherit / see cascade | var(--text-display) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .home-journal h2 · @media (max-width: 760px) | inherit / see cascade | var(--text-page) | inherit / see cascade | inherit / see cascade | inherit / see cascade |

## app/layout-refinement.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| html .page-intro nav, html .breadcrumbs · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | 1.6 | inherit / see cascade |
| html .page-intro h1, html .catalog-intro h1, html .commerce-page > h1, html .journal-card h2 · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| html .page-intro > p:last-child:not(.eyebrow) · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.7 | inherit / see cascade |
| html .catalog-intro > p:last-child · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.65 | inherit / see cascade |
| html .commerce-totals, html .purchase-price, html .product-price · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| html .journal-card h2 · base | inherit / see cascade | clamp(1.5rem, 2.6vw, 2rem) | inherit / see cascade | 1.25 | inherit / see cascade |
| html .journal-card p · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.7 | inherit / see cascade |
| html .editorial-text · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.8 | inherit / see cascade |
| html .footer-links a · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| html .footer-intro p · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.7 | inherit / see cascade |
| html .reference-home .rh-guidance-cards a · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.45 | inherit / see cascade |
| html .reference-home .rh-product-name · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.45 | inherit / see cascade |
| html .reference-home .rh-product-price · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| html .reference-home .rh-editorial-grid > a · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | 1.5 | inherit / see cascade |
| html .catalog-intro > p:last-child,   html .page-intro > p:last-child:not(.eyebrow) · @media (max-width: 600px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |

## app/privacy.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| .cookie-controls · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .cookie-settings-link · base | inherit | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .cookie-banner · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .cookie-banner h2 · base | inherit / see cascade | var(--text-price) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .cookie-banner p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .cookie-actions button · base | inherit | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .cookie-dialog h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .cookie-dialog h3 · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .cookie-dialog h3 span · base | inherit / see cascade | var(--text-meta) | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .cookie-dialog p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.7 | inherit / see cascade |
| .cookie-toggle · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .policy-page · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .policy-page h1 · base | inherit / see cascade | clamp(2.25rem, 5vw, 3.25rem) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .policy-page h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .policy-page p, .policy-page li · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.8 | inherit / see cascade |
| .policy-page table · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .policy-page caption · base | inherit / see cascade | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .cookie-banner p · @media (max-width: 700px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .policy-page p, .policy-page li · base | inherit / see cascade | 1rem | inherit / see cascade | 1.75 | inherit / see cascade |

## app/reference-home.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| .reference-home · base | var(--font-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home h2 · base | var(--font-display) | clamp(1.5rem, 2.2vw, 2rem) | var(--weight-semibold) | 1.3 | -0.025em |
| .reference-home .rh-wide · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-campaign h2 · base | inherit / see cascade | clamp(1.5rem, 2.7vw, 2.5rem) | var(--weight-bold) | 1.2 | inherit / see cascade |
| .reference-home .rh-campaign p · base | inherit / see cascade | clamp(1.125rem, 2.1vw, 1.875rem) | inherit / see cascade | 1.35 | inherit / see cascade |
| .reference-home .rh-campaign-counter · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-signin p · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-signin > a · base | inherit / see cascade | var(--text-ui) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-guidance h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-guidance p · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.6 | inherit / see cascade |
| .reference-home .rh-guidance-cards a · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-section-title > a · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-product-action · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-product-name · base | var(--font-display) | var(--text-body) | var(--weight-semibold) | 1.5 | -0.015em |
| .reference-home .rh-product-price · base | inherit / see cascade | var(--text-price) | var(--weight-semibold) | 1.3 | inherit / see cascade |
| .reference-home .rh-product-price del · base | inherit / see cascade | var(--text-meta) | var(--weight-regular) | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-rating · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-stock · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-category-circles a · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-category-chips a · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-tabs button · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-tabs button[aria-selected="true"] · base | inherit / see cascade | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-banner h2 · base | inherit / see cascade | var(--text-heading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-banner > p · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-features a · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-circles a · base | inherit / see cascade | var(--text-body) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-discovery-card > p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-discovery-card strong · base | var(--font-display) | var(--text-body) | var(--weight-semibold) | 1.5 | inherit / see cascade |
| .reference-home .rh-discovery-card a > span · base | inherit / see cascade | var(--text-price) | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-editorial-grid > a · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.3 | inherit / see cascade |
| .reference-home .rh-journal-tile strong · base | inherit / see cascade | var(--text-subheading) | inherit / see cascade | 1.1 | inherit / see cascade |
| .reference-home .rh-subscribe small · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-subscribe strong · base | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-campaign h2 · @media (max-width: 1100px) | inherit / see cascade | var(--text-page-small) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-campaign p · @media (max-width: 1100px) | inherit / see cascade | var(--text-subheading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-campaign h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-subheading) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-campaign p · @media (max-width: 600px) | inherit / see cascade | var(--text-price) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-signin p · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-signin > a · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-guidance h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-guidance p · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-guidance-cards a · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-section-title > a · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-product-name · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-product-price · @media (max-width: 600px) | inherit / see cascade | var(--text-lead) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-category-circles a · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-category-chips a · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-tabs button · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-banner h2 · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-banner > p · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-features a · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-story-circles a · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-discovery-card > p · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-discovery-card strong · @media (max-width: 600px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-discovery-card a > span · @media (max-width: 600px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-editorial-grid > a · @media (max-width: 600px) | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-journal-tile strong · @media (max-width: 600px) | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .reference-home .rh-subscribe strong · @media (max-width: 600px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |

## app/storefront.css

| Seletor / contexto | Família | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| .site-footer .footer-signature · base | inherit / see cascade | 0 | inherit / see cascade | 0 | inherit / see cascade |
| .header-search-slot · base | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .inline-search .search input · base | inherit / see cascade | var(--text-body) | inherit / see cascade | 1.5 | inherit / see cascade |
| .inline-search .search .button · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.5 | inherit / see cascade |
| .header-wrap .category-navigation · base | var(--font-display) | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .site-footer .footer-intro h2 · base | var(--font-display) | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | -.025em |
| .site-footer .footer-intro p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .site-footer .footer-links h3 · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .site-footer .footer-links a · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .departments-trigger · base | inherit | inherit / see cascade | var(--weight-semibold) | inherit / see cascade | inherit / see cascade |
| .departments-intro h2 · base | inherit / see cascade | var(--text-card-title) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .departments-intro p · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | 1.6 | inherit / see cascade |
| .departments-grid a · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .departments-grid span · base | inherit / see cascade | var(--text-meta) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .shopping-guidance strong · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .shopping-guidance span · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .shelf-heading h2 · base | inherit / see cascade | clamp(1.375rem,2.2vw,1.875rem) | inherit / see cascade | inherit / see cascade | -.03em |
| .shelf-heading p · base | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .shelf-actions a · base | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .header-search-slot · @media (max-width: 800px) | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .inline-search .search input · @media (max-width: 800px) | inherit / see cascade | var(--text-body) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
| .shelf-heading p · @media (max-width: 800px) | inherit / see cascade | var(--text-ui) | inherit / see cascade | inherit / see cascade | inherit / see cascade |
