import {
  flattenConnection,
  gql,
  ProductProvider,
  Seo,
  useRouteParams,
  useSession,
  useShop,
  useShopQuery,
} from '@shopify/hydrogen';
import {
  Product,
  ProductVariant,
} from '@shopify/hydrogen/dist/esnext/storefront-api-types';
import groq from 'groq';
import {useSanityQuery} from 'hydrogen-plugin-sanity';
import clientConfig from '../../../sanity.config';
import Gallery from '../../components/Gallery.client';
import Layout from '../../components/Layout.server';
import NotFound from '../../components/NotFound.server';
import ProductDetails from '../../components/product/ProductDetails.client';
import ProductEditorial from '../../components/product/ProductEditorial.server';
import ProductWidget from '../../components/product/ProductWidget.client';
import RelatedProducts from '../../components/RelatedProducts.server';
import {PRODUCT_PAGE} from '../../fragments/productPage';
import type {SanityProductPage} from '../../types';

type SanityPayload = {
  sanityData: SanityProductPage;
};

type ShopifyPayload = {
  data: {
    product: Pick<
      Product,
      | 'compareAtPriceRange'
      | 'featuredImage'
      | 'handle'
      | 'id'
      | 'media'
      | 'priceRange'
      | 'seo'
      | 'title'
      | 'variants'
      | 'vendor'
    >;
  };
};

export default function ProductRoute() {
  const {languageCode} = useShop();
  const {handle} = useRouteParams();
  const {countryCode = 'US'} = useSession();

  // Fetch Sanity document
  const {sanityData: sanityProduct} = useSanityQuery({
    clientConfig,
    getProductGraphQLFragment: () => false,
    params: {slug: handle},
    query: QUERY,
  }) as SanityPayload;

  // Fetch Shopify document
  const {
    data: {product: storefrontProduct},
  } = useShopQuery({
    query: QUERY_SHOPIFY,
    variables: {
      country: countryCode,
      id: sanityProduct.store.gid,
      language: languageCode,
    },
  }) as ShopifyPayload;

  if (!sanityProduct || !storefrontProduct) {
    // @ts-expect-error <NotFound> doesn't require response
    return <NotFound />;
  }

  const initialVariant = flattenConnection(
    storefrontProduct.variants,
  )[0] as ProductVariant;

  return (
    <ProductProvider
      data={storefrontProduct}
      initialVariantId={initialVariant.id}
    >
      <Layout>
        <div className="relative min-h-screen w-full">
          <Gallery />
          {/* Mobile */}
          <div className="mb-8 lg:hidden">
            <ProductWidget sanityProduct={sanityProduct} />
          </div>

          <div className="w-full border-2 border-blue-500 lg:w-[calc(100%-315px)]">
            <ProductDetails />
            <ProductEditorial sanityProduct={sanityProduct} />
          </div>

          {/* Desktop */}
          <div className="pointer-events-none absolute top-0 right-0 z-10 hidden h-full w-[315px] lg:block">
            <div className="sticky top-0 h-screen">
              <div className="absolute bottom-0 w-full p-4">
                <ProductWidget sanityProduct={sanityProduct} />
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts
          colorTheme={sanityProduct?.colorTheme}
          storefrontProduct={storefrontProduct}
        />

        <Seo type="product" data={storefrontProduct} />
      </Layout>
    </ProductProvider>
  );
}

const QUERY = groq`
  *[
    _type == 'product'
    && store.slug.current == $slug
  ][0]{
    ${PRODUCT_PAGE}
  }
`;

const QUERY_SHOPIFY = gql`
  query product($country: CountryCode, $id: ID!, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product: product(id: $id) {
      compareAtPriceRange {
        maxVariantPrice {
          currencyCode
          amount
        }
        minVariantPrice {
          currencyCode
          amount
        }
      }
      featuredImage {
        url
        width
        height
        altText
      }
      handle
      id
      media(first: 20) {
        edges {
          node {
            ... on MediaImage {
              mediaContentType
              image {
                altText
                height
                id
                url
                width
              }
            }
            ... on Video {
              mediaContentType
              id
              previewImage {
                url
              }
              sources {
                mimeType
                url
              }
            }
            ... on ExternalVideo {
              mediaContentType
              id
              embedUrl
              host
            }
            ... on Model3d {
              mediaContentType
              id
              alt
              mediaContentType
              previewImage {
                url
              }
              sources {
                url
              }
            }
          }
        }
      }
      priceRange {
        maxVariantPrice {
          currencyCode
          amount
        }
        minVariantPrice {
          currencyCode
          amount
        }
      }
      seo {
        description
        title
      }
      title
      variants(first: 250) {
        edges {
          node {
            availableForSale
            compareAtPriceV2 {
              amount
              currencyCode
            }
            id
            image {
              altText
              height
              id
              url
              width
            }
            priceV2 {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            sku
            title
            unitPrice {
              amount
              currencyCode
            }
            unitPriceMeasurement {
              measuredType
              quantityUnit
              quantityValue
              referenceUnit
              referenceValue
            }
          }
        }
      }
      vendor
    }
  }
`;
