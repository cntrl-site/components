import { CSSProperties, FC } from 'react';

export type TSectionImage = {
  url: string;
  type: 'image';
  size: string;
  position: string;
  offsetX: number | null;
};

interface Props {
  media: TSectionImage;
  sectionId: string;
}

export const SectionImage: FC<Props> = ({ media, sectionId }) => {
  const { url, size, position, offsetX } = media;
  const isContainHeight = size === 'contain-height';
  const hasOffsetX = offsetX !== null && size === 'contain';
  return (
    <>
      <div
        className={`section-image-wrapper-${sectionId}`}
        style={{
          position: position === 'fixed' ? 'sticky' : 'relative',
          height: position === 'fixed' ? '100vh' : '100%',
          top: position === 'fixed' ? '100vh' : '0',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <img
          src={url}
          className={`image-background-${sectionId}`}
          style={{
            objectFit: isContainHeight ? 'unset' : (size ?? 'cover') as CSSProperties['objectFit'],
            width: isContainHeight || hasOffsetX ? 'auto' : '100%',
            transform: isContainHeight ? 'translateX(-50%)' : 'none',
            position: 'relative',
            left: isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0'),
            height: '100%'
          }}
        />
      </div>
    </>
  );
};
