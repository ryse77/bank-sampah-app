declare module 'html5-qrcode' {
  export interface Html5QrcodeCameraConfig {
    facingMode?: 'user' | 'environment';
    deviceId?: string;
  }

  export interface Html5QrcodeScannerConfig {
    fps?: number;
    qrbox?: number | { width: number; height: number };
  }

  export class Html5Qrcode {
    constructor(elementId: string, configOrVerbosityFlag?: unknown);
    start(
      cameraConfigOrDeviceId: string | Html5QrcodeCameraConfig,
      configuration: Html5QrcodeScannerConfig,
      qrCodeSuccessCallback: (decodedText: string, decodedResult?: unknown) => void,
      qrCodeErrorCallback?: (errorMessage: string, error?: unknown) => void
    ): Promise<unknown>;
    stop(): Promise<void>;
    clear(): void;
  }
}
