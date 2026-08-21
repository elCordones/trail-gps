import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { GpxTrack } from '../types';
import { parseGpxString } from './gpxParser';

export async function pickAndParseGpxFile(): Promise<GpxTrack | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['*/*', 'application/gpx+xml', 'application/xml', 'text/xml'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'utf8',
    });

    return parseGpxString(fileContent);
  } catch (error) {
    console.error('Error carregant el fitxer GPX:', error);
    throw error;
  }
}
