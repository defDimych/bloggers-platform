import { writeFile } from 'node:fs/promises';

/**
 * Writes SQL text into a file asynchronously.
 * @param filePath — absolute or relative path to the file.
 * @param sql — SQL query string to write.
 */

const staticPath = 'sql.txt';

export const writeSql = async (
  sql: string,
  filePath: string = staticPath,
): Promise<void> => {
  try {
    await writeFile(filePath, sql, { encoding: 'utf8' });
  } catch (err) {
    console.error('Failed to write SQL file:', err);
  }
};
