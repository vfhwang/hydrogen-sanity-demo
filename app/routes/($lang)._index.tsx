import {Await, useLoaderData} from '@remix-run/react';
import {AnalyticsPageType, type SeoHandleFunction} from '@shopify/hydrogen';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import clsx from 'clsx';
import {SanityPreview} from 'hydrogen-sanity';
import {Suspense} from 'react';
import {useCallback, useEffect} from 'react';

import HomeHero from '~/components/heroes/Home';
import ModuleGrid from '~/components/modules/ModuleGrid';
import type {SanityHomePage} from '~/lib/sanity';
import {fetchGids, notFound, validateLocale} from '~/lib/utils';
import {HOME_PAGE_QUERY} from '~/queries/sanity/home';
import type {SanityCollection, SanityCollectionGroup} from '~/lib/sanity';

import CollectionGroup from '~/components/global/collectionGroup/CollectionGroup';
import {Link} from '~/components/Link';
import CollectionCard from '~/components/collection/Card';
import type {SanityMenuLink} from '~/lib/sanity';
import {useRootLoaderData} from '~/root';
import {useFetcher} from '@remix-run/react';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import type {Product} from '@shopify/hydrogen/storefront-api-types';


type Props = {
  collection?: SanityCollection;
  collectionGroup?: SanityCollectionGroup;
  onClose: () => void;
};


const seo: SeoHandleFunction = ({data}) => ({
  title: data?.page?.seo?.title || 'Sanity x Hydrogen',
  description:
    data?.page?.seo?.description ||
    'A custom storefront powered by Hydrogen and Sanity',
});

export const handle = {
  seo,
};

export async function loader({context, params}: LoaderFunctionArgs) {
  validateLocale({context, params});


  const cache = context.storefront.CacheCustom({
    mode: 'public',
    maxAge: 60,
    staleWhileRevalidate: 60,
  });

  const page = await context.sanity.query<SanityHomePage>({
    query: HOME_PAGE_QUERY,
    cache,
  });

  if (!page) {
    throw notFound();
  }

  // Resolve any references to products on the Storefront API
  const gids = fetchGids({page, context});

  const PRODUCT_QUERY = `#graphql
  query ProductQuery($handle: String!) {
    product(handle: $handle) {
      title
    }
  }`;


  const ALL_PRODUCTS_QUERY = `#graphql
  query AllProductsQuery {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }`;

  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle: 'some-sort-of-photography-workshop'},
  });

  const result = await context.storefront.query(ALL_PRODUCTS_QUERY);
  const allProducts = result.products.edges.map(edge => edge.node);

  console.log('Product:', product);

  return defer({
    page,
    gids,
    product, 
    allProducts,
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export default function Index({data}: {data: any}): React.ReactElement{
  const {page, gids, product, allProducts} = useLoaderData<typeof loader>();

  const {layout} = useRootLoaderData();
  const {menuLinks} = layout || {};

  console.log('products', allProducts)

  return (
    <SanityPreview data={page} query={HOME_PAGE_QUERY}>
      {(page) => (
        <Suspense>
          <Await resolve={gids}>
            {/* Page hero */}
            {page?.hero && <HomeHero hero={page.hero} />}

            {page?.modules && (
              <div className={clsx('mb-32 mt-24 px-4', 'md:px-8')}>
                <ModuleGrid items={page.modules} />
              </div>
            )}
        <div className="px-8">
          <div className="text-lg font-bold">Collections</div>
          <div className="relative mt-3 grid grid-cols-2 gap-2">
            <div className="product-list">
              {allProducts.map((product: Product) => (
                <div key={product.id} className="product">
                  <h2>{product.title}</h2>
                  <Link to={`/products/${product.handle}`}>View</Link>
                </div>
              ))}
            </div>

          </div>
      </div>
          </Await>
        </Suspense>
      )}
    </SanityPreview>
  );
}


