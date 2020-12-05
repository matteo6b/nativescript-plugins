import {
  decodedHeightProperty,
  decodedWidthProperty,
  errorHolderProperty,
  fallbackProperty,
  filterProperty, headersProperty,
  ImageCacheItBase,
  placeHolderProperty, Priority, priorityProperty,
  srcProperty, stretchProperty, tintColorProperty
} from './common';
import {ImageSource, Background, Color, Length, ImageAsset, path, knownFolders, Application} from '@nativescript/core';
import {isString, isNumber, isNullOrUndefined} from "@nativescript/core/utils/types";

declare let jp, com, androidx;


interface ImageLoadedListener {
  new(owner: any): org.nativescript.widgets.image.Worker.OnImageLoadedListener;
}

let ImageLoadedListener: ImageLoadedListener;

function initializeImageLoadedListener() {
  if (ImageLoadedListener) {
    return;
  }

  @NativeClass
  @Interfaces([org.nativescript.widgets.image.Worker.OnImageLoadedListener])
  class ImageLoadedListenerImpl extends java.lang.Object implements org.nativescript.widgets.image.Worker.OnImageLoadedListener {
    constructor(public owner: any) {
      super();
      return global.__native(this);
    }

    onImageLoaded(success: boolean): void {
      const owner = this.owner;
      if (owner) {
        owner.isLoading = false;
      }
    }
  }

  ImageLoadedListener = ImageLoadedListenerImpl;
}


export class ImageCacheIt extends ImageCacheItBase {
  private emptyBackground;

  constructor() {
    super();
    this.emptyBackground = new Background();
  }

  public createNativeView() {
    return new com.github.triniwiz.imagecacheit.ImageView(this._context);
  }

  // nativeView: com.github.triniwiz.imagecacheit.ImageView;

  public initNativeView() {
    initializeImageLoadedListener();
    const nativeView = this.nativeViewProtected;
    const listener = new ImageLoadedListener(this);
    nativeView.setImageLoadedListener(listener);
    (<any>nativeView).listener = listener;
    const ref = new WeakRef<ImageCacheIt>(this);
    this.nativeView.setProgressListener(new com.github.triniwiz.imagecacheit.ProgressListener({
      onProgress(loaded, total, progress, url) {
        const owner = ref.get();
        if (owner) {
          owner._emitProgressEvent(loaded, total, progress, url);
        }
      }
    }));
    this.nativeView.setEventsListener(new com.github.triniwiz.imagecacheit.EventsListener({
      onLoadStart() {
        const owner = ref.get();
        if (owner) {
          owner._emitLoadStartEvent(owner.src);
        }
      },
      onLoadError(message) {
        const owner = ref.get();
        if (owner) {
          owner._emitErrorEvent(message, owner.src);
        }
      },
      onLoadedEnd(image) {
        const owner = ref.get();
        if (owner) {
          owner._emitLoadEndEvent(owner.src, image);
        }
      }
    }));
    this._setHeaders(this.headers);
    if (this.placeHolder) {
      ImageCacheIt._setPlaceHolder(this._context, this.placeHolder, this.nativeView);
    }
    if (this.errorHolder) {
      ImageCacheIt._setErrorHolder(this._context, this.errorHolder, this.nativeView);
    }
    if (this.fallback) {
      ImageCacheIt._setFallback(this._context, this.fallback, this.nativeView);
    }
    if (this.filter) {
      ImageCacheIt._setFilter(this.filter, this.nativeView);
    }
    if (this.stretch) {
      this._setStretch(this.stretch);
    }
    const image = ImageCacheIt.getImage(this._context, this.src);
    let decodeWidth = Length.toDevicePixels(this.decodedWidth, 0);
    let decodeHeight = Length.toDevicePixels(this.decodedHeight, 0);
    let keepAspectRatio = this._calculateKeepAspectRatio();
    if (isString(image) && this.nativeView) {
      this.nativeView.setSource(android.net.Uri.parse(image), decodeWidth, decodeHeight, keepAspectRatio, false, true);
    } else if (isNumber(image) || image instanceof java.lang.Integer) {
      this.nativeView.setSource(image, decodeWidth, decodeHeight, keepAspectRatio, false, true);
    } else if (image instanceof java.io.File) {
      this.nativeView.setSource(android.net.Uri.parse(image.getAbsolutePath()), decodeWidth, decodeHeight, keepAspectRatio, false, true);
    } else {
      if (this.src instanceof ImageAsset) {
        keepAspectRatio = !!(this.src as ImageAsset).options.keepAspectRatio;
      }
      this.nativeView.setSource(image, decodeWidth, decodeHeight, keepAspectRatio, false, true);
    }
  }

  private _calculateKeepAspectRatio(): boolean {
    return this.stretch !== 'fill';
  }

  public disposeNativeView(): void {
    super.disposeNativeView();
  }


  public resetNativeView(): void {
    super.resetNativeView();
    this.nativeViewProtected.setImageMatrix(new android.graphics.Matrix());
  }

  [filterProperty.setNative](filter: any) {
    if (this.nativeView) {
      this.nativeView.setFilter(filter);
    }
  }

  private static isNumber(value: any) {
    return typeof value === 'number';
  }

  private static getResourceId(context: any, res: string = '') {
    if (!context) return java.lang.Integer.valueOf(0);
    if (isString(res) && res.startsWith('res://')) {
      const packageName = context.getPackageName();
      try {
        const className = java.lang.Class.forName(`${packageName}.R$drawable`);
        return java.lang.Integer.valueOf(parseInt(String(className.getDeclaredField(res.replace('res://', '')).get(null))));
      } catch (e) {
        return java.lang.Integer.valueOf(0);
      }
    }
    return java.lang.Integer.valueOf(0);
  }

  private static _setFallback(context: any, fallback: any, nativeView?: any) {
    const holder = ImageCacheIt.getImage(context, fallback);
    if (nativeView) {
      if (isString(fallback) && fallback.startsWith('res://')) {
        nativeView.setFallbackImage(fallback);
      } else {
        nativeView.setFallbackImage(holder);
      }
    }
  }

  [fallbackProperty.setNative](fallback: any) {
    ImageCacheIt._setFallback(this._context, fallback, this.nativeView);
  }

  private static _setPlaceHolder(context: any, placeHolder: any, nativeView?: any) {
    const holder = ImageCacheIt.getImage(context, placeHolder);
    if (nativeView) {
      if (isString(placeHolder) && placeHolder.startsWith('res://')) {
        nativeView.setPlaceHolder(placeHolder);
      } else {
        nativeView.setPlaceHolder(holder);
      }
    }
  }

  [placeHolderProperty.setNative](placeHolder: any) {
    ImageCacheIt._setPlaceHolder(this._context, placeHolder, this.nativeView);
  }

  private static _setErrorHolder(context: any, errorHolder: any, nativeView?: any) {
    const holder = ImageCacheIt.getImage(context, errorHolder);
    if (nativeView) {
      if (isString(errorHolder) && errorHolder.startsWith('res://')) {
        nativeView.setErrorHolder(errorHolder);
      } else {
        nativeView.setErrorHolder(holder);
      }
    }
  }

  [errorHolderProperty.setNative](errorHolder: any) {
    ImageCacheIt._setErrorHolder(this._context, errorHolder, this.nativeView);
  }


  [srcProperty.getDefault](): any {
    return undefined;
  }

  private static _setSrc(context: any, src: any, nativeView?: any, base?: ImageCacheIt) {
    const image = ImageCacheIt.getImage(context, src);
    if (nativeView) {
      let decodeWidth = Length.toDevicePixels(base.decodedWidth, 0);
      let decodeHeight = Length.toDevicePixels(base.decodedHeight, 0);
      let keepAspectRatio = base._calculateKeepAspectRatio();

      if (isString(image)) {
        nativeView.setSource(android.net.Uri.parse(image), decodeWidth, decodeHeight, keepAspectRatio, false, true);
      } else if (isNumber(image) || image instanceof java.lang.Integer) {
        nativeView.setSource(image, decodeWidth, decodeHeight, keepAspectRatio, false, true);
      } else if (image instanceof java.io.File) {
        nativeView.setSource(image, decodeWidth, decodeHeight, keepAspectRatio, false, true);
      } else {
        nativeView.setSource(image, decodeWidth, decodeHeight, keepAspectRatio, false, true);
      }
    }
  }

  [srcProperty.setNative](src: any) {
    ImageCacheIt._setSrc(this._context, src, this.nativeView, this);
  }

  [decodedWidthProperty.setNative](width: number) {

  }

  [decodedHeightProperty.setNative](height: number) {

  }

  [priorityProperty.getDefault](): Priority {
    return Priority.Normal;
  }

  [priorityProperty.setNative](value: any) {
    if (!this.nativeView) return;
    switch (value) {
      case Priority.High:
        this.nativeView.setPriority(com.github.triniwiz.imagecacheit.ImageView.Priority.High);
        break;
      case Priority.Low:
        this.nativeView.setPriority(com.github.triniwiz.imagecacheit.ImageView.Priority.Low);
        break;
      default:
        this.nativeView.setPriority(com.github.triniwiz.imagecacheit.ImageView.Priority.Normal);
        break;
    }
  }

  [tintColorProperty.getDefault](): Color | string {
    return undefined;
  }

  [tintColorProperty.setNative](value: any) {
    if (!value) {
      this.nativeView.clearColorFilter();
    } else {
      this.nativeView.setColorFilter(value.android);
    }
  }

  [headersProperty.getDefault](): Map<string, string> {
    return new Map<string, string>();
  }


  private _setHeaders(value) {
    const headers = new java.util.HashMap<string, string>();
    if (value) {
      value.forEach((value, key) => {
        headers.put(key, value);
      });
    }
    if (this.nativeView) {
      this.nativeView.setHeaders(headers);
    }
  }

  [headersProperty.setNative](value: Map<string, string>) {
    this._setHeaders(value);
  }

  public static getImage(context: any, src: any): any {
    let nativeImage: any = null;
    if (isNullOrUndefined(src)) {
      return null;
    }

    if (isString(src)) {
      if (src.substr(0, 1) === '/') {
        nativeImage = new java.io.File(src);
      } else if (src.startsWith('~/')) {
        nativeImage = new java.io.File(
          path.join(knownFolders.currentApp().path, src.replace('~/', ''))
        );
      } else if (src.startsWith('http')) {
        nativeImage = src;
      } else if (src.startsWith('res://')) {
        nativeImage = this.getResourceId(context, src);
      }
    } else if (src instanceof ImageSource || src instanceof ImageAsset) {
      nativeImage = src.android;
    } else {
      nativeImage = src;
    }
    return nativeImage;
  }

  private static _setFilter(filter: string, nativeView?: any) {
    if (nativeView) {
      nativeView.setFilter(filter);
    }
  }

  [filterProperty.setNative](filter: string) {
    ImageCacheIt._setFilter(filter, this.nativeView);
  }

  [stretchProperty.getDefault](): 'aspectFit' {
    return 'aspectFit';
  }

  private _setStretch(value) {
    if (this.nativeView) {
      switch (value) {
        case 'aspectFit':
          this.nativeView.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
          break;
        case 'aspectFill':
          this.nativeView.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
          break;
        case 'fill':
          this.nativeView.setScaleType(android.widget.ImageView.ScaleType.FIT_XY);
          break;
        case 'none':
        default:
          this.nativeView.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
          break;
      }
    }
  }

  [stretchProperty.setNative](
    value: 'none' | 'aspectFill' | 'aspectFit' | 'fill'
  ) {
    this._setStretch(value);
  }

  public static getItem(src: string): Promise<any> {
    com.github.triniwiz.imagecacheit.ImageCache.init(Application.android.context);
    return new Promise<any>((resolve, reject) => {
      com.github.triniwiz.imagecacheit.ImageCache.getItem(src, null, new com.github.triniwiz.imagecacheit.ImageCache.Callback({
        onSuccess(value) {
          resolve(value);
        },
        onError(error) {
          reject(error.getMessage());
        }
      }));
    });
  }

  public static deleteItem(src: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // TODO
      resolve();
    });
  }

  public static hasItem(src: string): Promise<any> {
    com.github.triniwiz.imagecacheit.ImageCache.init(Application.android.context);
    return new Promise<any>((resolve, reject) => {
      com.github.triniwiz.imagecacheit.ImageCache.hasItem(src, new com.github.triniwiz.imagecacheit.ImageCache.Callback({
        onSuccess(value) {
          resolve();
        },
        onError(error) {
          reject(error.getMessage());
        }
      }));
    });
  }

  public static clear() {
    com.github.triniwiz.imagecacheit.ImageCache.init(Application.android.context);
    return new Promise<any>((resolve, reject) => {
      com.github.triniwiz.imagecacheit.ImageCache.clear();
      resolve();
    });
  }

  public static enableAutoMM() {
    (com as any).github.triniwiz.imagecacheit.ImageView.enableAutoMM(Application.android.nativeApp);
  }

  public static disableAutoMM() {
    (com as any).github.triniwiz.imagecacheit.ImageView.disableAutoMM(Application.android.nativeApp);
  }
}



