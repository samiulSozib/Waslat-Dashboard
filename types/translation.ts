// types/translation.ts

export interface TranslationLanguage {
  id: number;
  language_name: string;
  language_code: string;
  direction: 'ltr' | 'rtl';
}

export interface TranslationField {
  key: string;
  label: string;
  source_field: string;
  translation_field: string;
}

export interface TranslationType {
  type: string;
  label: string;
  fields: TranslationField[];
  searchable: boolean;
  sort_fields: string[];
}

export interface TranslationStatistics {
  total: number;
  missing: number;
  translated: number;
  partial: number;
}

export interface TranslationContext {
  [key: string]: any; // dynamic per type (company_name, service_name, etc.)
}

export interface TranslationSource {
  [key: string]: string | null;
}

export interface TranslationValues {
  [key: string]: string | null;
}

export interface TranslationItem {
  id: number;
  context: TranslationContext;
  source: TranslationSource;
  translation: TranslationValues;
  translation_status: 'translated' | 'missing' | 'partial';
}

export interface TranslationWorkspaceResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    type: string;
    entity_label: string;
    language: TranslationLanguage;
    fields: TranslationField[];
    statistics: TranslationStatistics;
    active_filters: {
      search: string;
      translation_status: string;
      sort_by: string;
      sort_direction: string;
      [key: string]: any;
    };
    items: TranslationItem[];
  };
  payload: {
    pagination: {
      page: number;
      first_page_url: string;
      from: number;
      last_page: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
        page: number | null;
      }>;
      items_per_page: number;
      total: number;
    };
  };
}

export interface TranslationLanguagesResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    languages: TranslationLanguage[];
  };
  payload: any[];
}

export interface TranslationTypesResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    types: TranslationType[];
  };
  payload: any[];
}

export interface BulkTranslationItem {
  id: number;
  [key: string]: string | number; // dynamic translation fields
}

export interface BulkTranslationPayload {
  items: BulkTranslationItem[];
}

// Filters supported by the workspace
export interface TranslationFilters {
  search: string;
  translation_status: 'all' | 'missing' | 'partial' | 'translated';
  sort_by: string;
  sort_direction: 'asc' | 'desc';
  // Bundle-specific
  filter_company_id?: number | null;
  filter_service_id?: number | null;
  filter_service_category_type?: string | null;
  filter_bundle_type?: string | null;
  filter_validity_type?: string | null;
  filter_currency_id?: number | null;
  filter_api_provider_id?: number | null;
  // generic
  [key: string]: any;
}
