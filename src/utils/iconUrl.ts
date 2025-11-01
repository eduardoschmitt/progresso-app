import { apiConfig } from '@/api/httpClient';

const ensurePngExtension = (value: string): string => {
  if (/\.png(\?.*)?$/i.test(value)) {
    return value;
  }

  if (/\.svg(\?.*)?$/i.test(value)) {
    return value.replace(/\.svg(\?.*)?$/i, (_match, query = '') => `.png${query}`);
  }

  return value;
};

const toAbsoluteUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const base = apiConfig.baseUrl?.replace(/\/$/, '') ?? '';
  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${base}${normalizedPath}`;
};

export const resolveIconUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withPngExtension = ensurePngExtension(trimmed);
  return toAbsoluteUrl(withPngExtension);
};

