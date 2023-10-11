import { AxiosResponse } from "axios";
import { LocalFileStream, LocalFileBuffer } from "./File";

export type ImagePreviewEffect = (
  fileId: string,
  width: number,
  height: number,
  fit: string,
  cancelToken: AbortSignal | any,
  type: string | undefined
) => any;

export type CallbackTypeNames =
  | "onStart"
  | "onSuccess"
  | "onError"
  | "onProgress";

export type Callback = ({
  type,
  params,
}: {
  type: CallbackTypeNames;
  params: any;
}) => void;

export interface IDownloadFile {
  file: File | any;
  oneTimeToken: string;
  signal: any;
  endpoint: string;
  isEncrypted: boolean;
  key?: string | undefined;
  callback?: Callback;
  handlers?: any[];
}
export interface IEncodeExistingFile {
  file: File | any;
  oneTimeToken: string;
  endpoint: string;
  downloadToken: string;
  downloadEndpoint: string;
  callback: Callback;
  handlers: any[];
  key: CryptoKey;
}
export interface ISendChunk {
  chunk: ArrayBuffer;
  index: number;
  file: LocalFileStream | LocalFileBuffer;
  startTime: any;
  oneTimeToken: string;
  endpoint: string;
  iv?: Uint8Array | null;
  clientsideKeySha3Hash?: string | null;
  totalProgress: { number: number };
  callback: Callback;
  handlers: any[];
  listUploadIdsOfCancelledFiles?: Set<string>;
  controller?: AbortController;
  totalSize?: number;
}

export interface IUploadFile {
  file: LocalFileStream | LocalFileBuffer;
  oneTimeToken: string;
  endpoint: string;
  callback: Callback;
  handlers: any[];
  key?: CryptoKey;
  progress?: number;
  totalSize?: number;
  startedAt?: any;
}

export interface ISwapChunk {
  file: File | any;
  endpoint: string;
  base64iv: string;
  clientsideKeySha3Hash: string;
  index: number;
  oneTimeToken: string;
  encryptedChunk: ArrayBuffer;
  fileSize: number;
  startTime: any;
  totalProgress: { number: number };
  callback: Callback;
  handlers: any[];
}

export interface IEncryptChunk {
  chunk: ArrayBuffer;
  iv: Uint8Array;
  key: CryptoKey;
}

export interface IDecryptChunk {
  chunk: ArrayBuffer;
  iv: string;
  key: any;
}

export interface IDownloadChunk {
  index: number;
  sha3_hash: string | null;
  oneTimeToken: string;
  controller: any;
  endpoint: string;
  file: File | any;
  startTime: any;
  totalProgress: { number: number };
  callback: Callback;
  handlers: any[];
}

export interface ICountChunks {
  endpoint: string;
  oneTimeToken: string;
  slug: string;
  controller: any;
}

export interface IGetThumbnail {
  path?: string;
  ffmpegCommand?: any;
  file?: File | any;
  quality: number;
  oneTimeToken: string;
  endpoint: string;
  slug: string;
  sharp?: any;
}
