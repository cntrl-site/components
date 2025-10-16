import React, { ReactElement, ReactNode } from 'react';

interface Props {
  url?: string;
  children: ReactElement | ReactNode[];
  target?: string;
}

export const LinkWrapper: React.FC<Props> = ({ url, children, target }) => {
  const validUrl = url && buildValidUrl(url);
  const targetParams = target === '_blank' ? { target, rel: 'noreferrer' } : {};
  return url ? (
    <a
      href={validUrl}
      {...targetParams}
    >
      {children}
    </a>
  ) : (
    <>{children}</>
  );
};

function buildValidUrl(url: string): string {
  const prefixes = [
    'http://',
    'https://',
    '/',
    'mailto:',
    'tel:',
    'file:',
    'ftp:',
    'javascript',
    '#'
  ];
  const protocolCheck = prefixes.some(prefix => url.startsWith(prefix));
  if (protocolCheck) return url;
  return `//${url}`;
}
