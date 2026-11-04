import { WebGLConfig } from "@lottiefiles/dotlottie-web/webgl";
import { ComponentProps, ReactNode, RefCallback } from "react";
import { Config, DotLottie as DotLottie$1, DotLottieWorker } from "@lottiefiles/dotlottie-web";
export * from "@lottiefiles/dotlottie-web";

//#region src/base-dotlottie-react.d.ts
type BaseDotLottieProps<T extends DotLottie$1 | DotLottieWorker> = Omit<Config, 'canvas'> & ComponentProps<'canvas'> & {
  animationId?: string;
  /**
   * A function that creates a `DotLottie` or `DotLottieWorker` instance.
   */
  createDotLottie: (config: T extends DotLottieWorker ? Config & {
    workerId?: string;
  } : Config) => T;
  /**
   * A callback function that receives the `DotLottie` or `DotLottieWorker` instance.
   *
   * @example
   * ```tsx
   * const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
   *
   * <DotLottieReact
   *   dotLottieRefCallback={setDotLottie}
   * />
   * ```
   */
  dotLottieRefCallback?: RefCallback<T | null>;
  /**
   * @deprecated The `playOnHover` property is deprecated.
   * Instead, use the `onMouseEnter` and `onMouseLeave` events to control animation playback.
   * Utilize the `dotLottieRefCallback` to access the `DotLottie` instance and invoke the `play` and `pause` methods.
   *
   * Example usage:
   * ```tsx
   * const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
   *
   * <DotLottieReact
   *   dotLottieRefCallback={setDotLottie}
   *   onMouseEnter={() => dotLottie?.play()}
   *   onMouseLeave={() => dotLottie?.pause()}
   * />
   * ```
   */
  playOnHover?: boolean;
  themeData?: string;
  workerId?: T extends DotLottieWorker ? string : undefined;
};
//#endregion
//#region src/webgl/index.d.ts
type DotLottieReactProps = Omit<BaseDotLottieProps<DotLottie$1>, 'createDotLottie'>;
declare const DotLottieReact: (props: DotLottieReactProps) => ReactNode;
declare const setWasmUrl: (url: string) => void;
//#endregion
export { DotLottieReact, DotLottieReactProps, type WebGLConfig, setWasmUrl };
//# sourceMappingURL=index.d.ts.map