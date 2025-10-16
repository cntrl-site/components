import { KeyframeAny, KeyframeType } from '../../types/keyframe/Keyframe';

export const keyframesMock: KeyframeAny[] = [
  {
    id: 'keyframeId',
    type: KeyframeType.TextColor,
    position: 100,
    value: {
      color: 'black'
    },
    itemId: 'itemId',
    layoutId: 'layoutId'
  }
];
