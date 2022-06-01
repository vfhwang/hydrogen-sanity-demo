import {Block} from '@sanity/types';

export type SanityCollection = {
  _id: string;
  colorTheme: SanityColorTheme;
  hero?: SanityHeroPage;
  slug: string;
  store: Record<string, any>;
  title: string;
  vector?: string;
};

export type SanityCollectionPage = {
  _id: string;
  colorTheme: SanityColorTheme;
  hero?: SanityHeroCollection;
  modules: (SanityModuleImage | SanityModuleInstagram)[];
  slug: string;
  store: Record<string, any>;
  title: string;
};

export type SanityCollectionGroup = {
  _key: string;
  _type: 'collectionGroup';
  // TODO: use separate type
  collectionLinks?: SanityCollection[];
  collectionProducts?: SanityCollection;
  title: string;
};

export type SanityColorTheme = {
  background: string;
  text: string;
};

export type SanityCustomProductOption =
  | SanityCustomProductOptionColor
  | SanityCustomProductOptionSize;

interface SanityCustomProductOptionBase {
  _key: string;
  title: string;
}
export interface SanityCustomProductOptionColor
  extends SanityCustomProductOptionBase {
  _type: 'customProductOption.color';
  colors: {
    hex: string;
    title: string;
  }[];
}

export interface SanityCustomProductOptionSize
  extends SanityCustomProductOptionBase {
  _type: 'customProductOption.size';
  sizes: {
    height: number;
    title: string;
    width: number;
  }[];
}

export type SanityHeroCollection = {
  description?: string;
  module?:
    | SanityProductWithVariant
    | {
        _type: 'imageWithOptions';
        image: any;
      };
  title?: string;
};

export type SanityHeroPage = {
  module?:
    | SanityProductWithVariant
    | {
        _type: 'imageWithOptions';
        image: any;
      };
  title?: string;
};

export type SanityLink = SanityLinkExternal | SanityLinkInternal;

export type SanityLinkExternal = {
  _key: string;
  _type: 'linkExternal';
  newWindow?: boolean;
  url: string;
  title: string;
};

export type SanityLinkInternal = {
  _key: string;
  _type: 'linkInternal';
  documentType: string;
  slug: string;
  title: string;
};

export type SanityMenuLink =
  | SanityCollectionGroup
  | SanityLinkExternal
  | SanityLinkInternal;

export type SanityModule = SanityModuleImage | SanityModuleInstagram;

export type SanityModuleImage =
  | SanityModuleImageCallToAction
  | SanityModuleImageCaption
  | SanityModuleImageProducts;

export type SanityModuleImageBase = {
  _key?: string;
  _type: 'module.image';
  image: any;
};

export interface SanityModuleImageCallToAction extends SanityModuleImageBase {
  callToAction?: {
    link: SanityLink;
    title?: string;
  };
  variant: 'callToAction';
}

export interface SanityModuleImageCaption extends SanityModuleImageBase {
  caption?: string;
  variant: 'caption';
}
export interface SanityModuleImageProducts extends SanityModuleImageBase {
  products: SanityProductWithVariant[];
  variant: 'products';
}

export type SanityModuleInstagram = {
  _key?: string;
  _type: 'module.instagram';
  url: string;
};

export type SanityPage = {
  body: Block[];
  colorTheme?: SanityColorTheme;
  hero?: SanityHeroPage;
  // seo: null,
  showHeader?: boolean;
  title: string;
};

export type SanityProductWithVariant = {
  _id: string;
  _type: 'productWithVariant';
  available: boolean;
  slug: string;
  store: Record<string, any>;
  variantId: number;
};

export type SanityProductPage = {
  _id: string;
  available: boolean;
  body: Block[];
  colorTheme?: SanityColorTheme;
  customProductOptions?: SanityCustomProductOption[];
  images?: any;
  slug: string;
  sections?: any;
  seo?: any;
  store: Record<string, any>;
};
