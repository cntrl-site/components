import type { FC } from 'react';
import type { ItemProps } from '../Item';
import Player from '@vimeo/player';
import { useEffect, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useEmbedVideoItem } from './useEmbedVideoItem';
import { LinkWrapper } from '../LinkWrapper';
import { useLayoutContext } from '../../useLayoutContext';
import { VimeoEmbedItem as TVimeoEmbedItem } from '../../../../sdk/types/article/Item';
import { getLayoutStyles } from '../../../../utils';

export const VimeoEmbedItem: FC<ItemProps<TVimeoEmbedItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const {
    radius: itemRadius,
    blur: itemBlur,
    opacity: itemOpacity
  } = useEmbedVideoItem(item, sectionId);
  const layoutId = useLayoutContext();
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const vimeoPlayer = useMemo(() => iframeRef ? new Player(iframeRef) : undefined, [iframeRef]);
  const itemAngle = useItemAngle(item, sectionId);
  const { url } = item.commonParams;
  const layoutParams = layoutId ? item.layoutParams[layoutId] : null;
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [isCoverVisible, setIsCoverVisible] = useState(false);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const wrapperStateParams = interactionCtrl?.getState<number>(['angle', 'blur', 'opacity']);
  const frameStateParams = interactionCtrl?.getState<number>(['radius']);
  const angle = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const radius = getStyleFromItemStateAndParams(frameStateParams?.styles?.radius, itemRadius);
  useRegisterResize(ref, onResize);
  const validUrl = useMemo(() => {
    if (!layoutParams) return url;
    const validURL = new URL(url);
    validURL.searchParams.append('controls', String(layoutParams.controls));
    validURL.searchParams.append('autoplay', String(layoutParams.play === 'auto'));
    validURL.searchParams.append('muted', String(layoutParams.muted));
    validURL.searchParams.append('loop', String(layoutParams.loop));
    validURL.searchParams.append('pip', String(layoutParams.pictureInPicture));
    validURL.searchParams.append('title', '0');
    validURL.searchParams.append('byline', '0');
    validURL.searchParams.append('portrait', '0');
    validURL.searchParams.append('autopause', 'false');
    return validURL.href;
  }, [url, layoutParams]);

  useEffect(() => {
    if (!vimeoPlayer || !imgRef || !layoutParams) return;
    if (layoutParams.play === 'on-click') {
      setIsCoverVisible(true);
    }
    vimeoPlayer.on('pause', (e) => {
      if (e.seconds === 0) {
        setIsCoverVisible(true);
      }
    });
    vimeoPlayer.on('ended', () => {
      setIsCoverVisible(true);
    });
  }, [vimeoPlayer, imgRef, layoutParams]);

  const handleClick = async () => {
    if (!vimeoPlayer) return;
    const isPaused = await vimeoPlayer.getPaused();
    if (isPaused) {
      vimeoPlayer.play();
      setIsCoverVisible(false);
    }
    else {
      vimeoPlayer.pause();
    }
  };

  const onCoverClick = () => {
    if (!vimeoPlayer || !imgRef) return;
    vimeoPlayer!.play();
    setIsCoverVisible(false);
  };

  const isInteractive = opacity !== 0;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
    if (!isInteractive && vimeoPlayer) {
      vimeoPlayer.pause();
    }
  }, [isInteractive, onVisibilityChange, vimeoPlayer]);

  useEffect(() => {
    if (!vimeoPlayer || !interactionCtrl) return;
    interactionCtrl.setActionReceiver((type) => {
      switch (type) {
        case 'play':
          vimeoPlayer.play();
          break;
        case 'pause':
          vimeoPlayer.pause();
          break;
      }
    });
  }, [interactionCtrl, vimeoPlayer]);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`embed-video-wrapper-${item.id}`}
        ref={setRef}
        style={{
          ...(opacity !== undefined ? { opacity } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
          transition: wrapperStateParams?.transition ?? 'none'
        }}
        onMouseEnter={() => {
          if (!vimeoPlayer || !layoutParams || layoutParams.play !== 'on-hover') return;
          vimeoPlayer.play();
        }}
        onMouseLeave={() => {
          if (!vimeoPlayer || !layoutParams || layoutParams.play !== 'on-hover') return;
          vimeoPlayer.pause();
        }}
      >
        {item.commonParams.coverUrl && (
          <img
            ref={setImgRef}
            onClick={() => onCoverClick()}
            src={item.commonParams.coverUrl ?? ''}
            style={{
              display: isCoverVisible ? 'block' : 'none',
              cursor: 'pointer',
              position: 'absolute',
              objectFit: 'cover',
              height: '100%',
              width: '100%',
              top: '0',
              left: '0'
            }}
            alt="Cover img"
          />
        )}
        {/* ↓ This is necessary to track clicks on an iframe. */}
        {layoutParams && (!layoutParams.controls && (layoutParams.play === 'on-click' || layoutParams.play === 'auto')) && (
          <div
            onClick={handleClick}
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              top: '0',
              left: '0'
            }}
          />
        )}
        <iframe
          ref={setIframeRef}
          className="embed-video"
          src={validUrl || ''}
          allow="autoplay; fullscreen; picture-in-picture;"
          allowFullScreen
          style={{
            ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
            transition: frameStateParams?.transition ?? 'none'
          }}
        />
      </div>
      <JSXStyle id={id}>
        {`
      .embed-video-wrapper-${item.id} {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .embed-video {
        width: 100%;
        height: 100%;
        z-index: 1;
        border: none;
        overflow: hidden;
      }
      ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
      return (`
          .embed-video-wrapper-${item.id} {
            opacity: ${layoutParams.opacity};
            transform: rotate(${area.angle}deg);
            filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
            ${layoutParams.blur !== 0 ? 'will-change: transform;' : ''}
          }
          .embed-video-wrapper-${item.id} .embed-video {
            border-radius: ${layoutParams.radius * 100}vw;
          }
        `);
    })}
    `}
      </JSXStyle>
    </LinkWrapper>
  );
};
