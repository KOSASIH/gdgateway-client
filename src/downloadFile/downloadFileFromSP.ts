import * as lib from 'ipfs-unixfs-exporter';

import { decryptChunk } from '../decryptChunk/index.js';

import { convertBase64ToArrayBuffer } from '../utils/convertBase64ToArrayBuffer.js';
import { joinChunks } from '../utils/joinChunks.js';
import { chunkFile } from '../utils/chunkFile.js';
import { IDownloadFileFromSP, ISaveFileFromGenerator } from '../types/index.js';

export async function downloadFileFromSP({
  carReader,
  url,
  isEncrypted,
  uploadChunkSize,
  key,
  iv,
  file,
  level,
}: IDownloadFileFromSP) {
  return fetch(url)
    .then(async (data) => await data.arrayBuffer())
    .then((blob) => {
      const uint8 = new Uint8Array(blob);
      const reader = carReader.fromBytes(uint8);
      return reader;
    })
    .then(async (reader) => {
      const roots = await reader.getRoots();

      const entries = lib.recursive(roots[0], {
        async get(cid) {
          const block = await reader.get(cid);
          return block.bytes;
        },
      });
      let typesEntries = { count: {}, length: {} };
      let fileBlob: Blob;
      for await (const entry of entries) {
        if (entry.type === 'file' || entry.type === 'raw') {
          const cont = entry.content();
          fileBlob = await saveFileFromGenerator({
            generator: cont,
            type: file.mime,
            isEncrypted,
            uploadChunkSize,
            key,
            iv,
            level,
          });
          typesEntries['count'][entry.type] =
            (typesEntries['count'][entry.type] || 0) + 1;
          typesEntries['length'][entry.type] =
            // @ts-ignore
            (typesEntries['length'][entry.type] || 0) + entry.length;
        } else if (entry.type === 'directory') {
          typesEntries['count'][entry.type] =
            (typesEntries['count'][entry.type] || 0) + 1;
        }
      }
      return fileBlob;
    })
    .catch((err) => {
      console.log({ dfsp: err.message, st: err.stack });
    });
}

async function saveFileFromGenerator({
  generator,
  type,
  isEncrypted,
  uploadChunkSize,
  key,
  iv,
  level,
}: ISaveFileFromGenerator) {
  let prev = [];

  for await (const chunk of generator) {
    prev.push(...chunk);
  }

  const uin8 = new Uint8Array(prev);
  const arrayBuffer = uin8.buffer;

  if (!isEncrypted) {
    return arrayBuffer;
  }

  if (isEncrypted && (level === 'root' || level === 'interim')) {
    const bufferKey = convertBase64ToArrayBuffer(key);
    const chunks = [];

    for await (const chunk of chunkFile({
      file: {
        size: arrayBuffer.byteLength,
        arrayBuffer: async () => arrayBuffer,
      },
      uploadChunkSize: uploadChunkSize + 16, // test if we need +16 bytes
    })) {
      const chunkArrayBuffer =
        typeof chunk === 'string' ? Buffer.from(chunk).buffer : chunk;
      const decryptedChunk = await decryptChunk({
        chunk: chunkArrayBuffer,
        iv,
        key: bufferKey,
      });
      chunks.push(decryptedChunk);
    }

    return joinChunks(chunks);
  }

  if (isEncrypted && level === 'upload') {
    const bufferKey = convertBase64ToArrayBuffer(key);

    const decryptedChunk = await decryptChunk({
      chunk: arrayBuffer,
      iv,
      key: bufferKey,
    });

    return joinChunks([decryptedChunk]);
  }
}
