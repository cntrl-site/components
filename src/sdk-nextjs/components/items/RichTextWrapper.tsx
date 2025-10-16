import React, { FC, PropsWithChildren } from 'react';

interface RTWrapperProps {
  isRichText: boolean;
  transformOrigin?: string;
}

export const RichTextWrapper: FC<PropsWithChildren<RTWrapperProps>> = ({ isRichText, children, transformOrigin = 'top left' }) => {
  if (!isRichText) return <>{children}</>;
  return (
    <div style={{ transformOrigin, transform: 'scale(var(--layout-deviation))' }}>
      {children}
    </div>
  );
};
