import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[DiskStorage] Warning initializing data directory:', e.message);
}

export class DiskStorage {
  static getFilePath(tableName) {
    return path.join(DATA_DIR, `${tableName}.json`);
  }

  static readTable(tableName) {
    try {
      const filePath = this.getFilePath(tableName);
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw || !raw.trim()) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`[DiskStorage] Error reading table '${tableName}':`, err.message);
      return [];
    }
  }

  static writeTable(tableName, items) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const filePath = this.getFilePath(tableName);
      const tempPath = `${filePath}.tmp`;
      const data = JSON.stringify(items, null, 2);
      fs.writeFileSync(tempPath, data, 'utf-8');
      fs.renameSync(tempPath, filePath);
      return true;
    } catch (err) {
      console.warn(`[DiskStorage] Error writing table '${tableName}':`, err.message);
      return false;
    }
  }
}

