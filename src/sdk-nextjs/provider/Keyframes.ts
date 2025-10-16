import { KeyframeAny } from "../../sdk/types/keyframe/Keyframe";

export class Keyframes {
  constructor(
    private keyframes: KeyframeAny[] = []
  ) {}

  getItemKeyframes(itemId: string) {
    return this.keyframes.filter(kf => kf.itemId === itemId);
  }
}
