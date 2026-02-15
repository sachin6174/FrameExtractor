import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export const FileSystemUtils = {
    /**
     * Gets a clean folder name from a video path.
     */
    getFolderFromVideo(videoUri: string): string {
        const filename = videoUri.split('/').pop() || 'video';
        const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
        return nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    },

    /**
     * Gets the base path for saving screenshots.
     */
    async getBaseDir(): Promise<string> {
        if (Platform.OS === 'ios') {
            return RNFS.DocumentDirectoryPath + '/Screenshots';
        } else if (Platform.OS === 'android') {
            return RNFS.ExternalDirectoryPath + '/Screenshots';
        } else {
            // macOS or other
            return RNFS.DocumentDirectoryPath + '/Screenshots';
        }
    },

    /**
     * Creates a dedicated folder for a video's screenshots.
     */
    async createVideoFolder(videoUri: string): Promise<string> {
        const baseDir = await this.getBaseDir();
        const folderName = this.getFolderFromVideo(videoUri);
        const targetDir = `${baseDir}/${folderName}_${Date.now()}`;

        await RNFS.mkdir(targetDir);
        return targetDir;
    }
};
