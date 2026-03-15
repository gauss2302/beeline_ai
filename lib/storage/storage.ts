export interface UploadedAsset {
  key: string;
  url: string;
  mimeType: string;
}

export interface StorageAdapter {
  upload(params: {
    key: string;
    bytes: Uint8Array;
    mimeType: string;
  }): Promise<UploadedAsset>;
  delete(key: string): Promise<void>;
}

export class InMemoryStorageAdapter implements StorageAdapter {
  async upload(params: { key: string; bytes: Uint8Array; mimeType: string }): Promise<UploadedAsset> {
    return {
      key: params.key,
      url: `/files/${params.key}`,
      mimeType: params.mimeType
    };
  }

  async delete(): Promise<void> {}
}
