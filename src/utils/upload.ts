import fs from 'fs';
import path from 'path';

// Caminho para a pasta temporária de uploads
export const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

// Garante que a pasta tmp exista
export function ensureTmpFolderExists() {
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder, { recursive: true });
  }
}
