declare module "pdf-parse" {
  export interface LoadParameters {
    data?: Uint8Array;
    url?: string;
  }

  export class TextResult {
    text: string;
  }

  export class PDFParse {
    constructor(options: LoadParameters);
    getText(): Promise<TextResult>;
    destroy(): Promise<void>;
  }
}
