import { IDownloadChunk } from "../types";
export declare const downloadChunk: ({ index, sha3_hash, oneTimeToken, controller, endpoint, file, startTime, totalProgress, callback, handlers, }: IDownloadChunk) => Promise<any>;
