import { IToken } from '@/interfaces/IToken';
import { resolve } from 'path';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { StorageService } from './storageService';

@Service()
export class UploadService {
  protected storageServiceInstance: StorageService;
  protected logger: Logger;

  constructor(storageService: StorageService, @Inject('logger') logger: Logger) {
    this.logger = logger;
    this.storageServiceInstance = storageService;
  }

  public uploadFiles = async (
    userId: IToken['userId'],
    files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[],
  ) => {
    const photosPromises = [];
    const videosPromises = [];

    if (files['photos']) {
      const photos = files['photos'];
      photos.map(photo => {
        const fileName = photo.filename;
        const path = resolve(photo.path);
        const metaData = { userId, original_name: photo.originalname };
        const fileType = photo.mimetype;
        photosPromises.push(this.storageServiceInstance.uploadToStore(fileName, path, metaData, fileType));
      });
    }

    if (files['videos']) {
      const videos = files['videos'];
      videos.map(video => {
        const fileName = video.filename;
        const path = resolve(video.path);
        const metaData = { userId, original_name: video.originalname };
        const fileType = video.mimetype;
        videosPromises.push(this.storageServiceInstance.uploadToStore(fileName, path, metaData, fileType));
      });
    }
    const photos = (await Promise.all(photosPromises)).map(promise => promise.url);
    const videos = (await Promise.all(videosPromises)).map(promise => promise.url);

    return { photos, videos };
  };
}
