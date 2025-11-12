import fs from 'fs/promises';
import path from 'path';

export interface StrudelData {
  _base: string;
  [key: string]: string | string[];
}

export interface GeneratorOptions {
  rootPath: string;
  baseUrl?: string;
  githubUser?: string;
  githubRepo?: string;
  githubBranch?: string;
}

const AUDIO_EXTENSIONS = new Set(['.wav', '.mp3', '.flac', '.aiff']);

export async function createStrudelJson(options: GeneratorOptions): Promise<void> {
  const { rootPath, baseUrl, githubUser, githubRepo, githubBranch = 'main' } = options;

  // Verify the path exists and is a directory
  try {
    const stats = await fs.stat(rootPath);
    if (!stats.isDirectory()) {
      throw new Error(`The specified path '${rootPath}' is not a directory.`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`The specified path '${rootPath}' does not exist.`);
    }
    throw error;
  }

  // Determine the base URL
  let finalBaseUrl: string;
  if (baseUrl) {
    // Use the provided base URL directly
    finalBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  } else if (githubUser && githubRepo) {
    // Build GitHub raw URL from user/repo/branch
    finalBaseUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/${githubBranch}/`;
  } else {
    throw new Error('Either --base-url or both --username and --repo must be provided.');
  }

  const strudelData: StrudelData = { _base: finalBaseUrl };

  let foundAudioFiles = false;

  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const folderName = entry.name;
      const folderPath = path.join(rootPath, folderName);
      const audioFiles: string[] = [];

      try {
        const files = await fs.readdir(folderPath, { withFileTypes: true });

        for (const file of files) {
          if (!file.isFile()) {
            continue;
          }

          const ext = path.extname(file.name).toLowerCase();
          if (AUDIO_EXTENSIONS.has(ext)) {
            const correctPath = `${folderName}/${file.name}`;
            audioFiles.push(correctPath);
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${folderPath}:`, error);
        continue;
      }

      if (audioFiles.length === 0) {
        continue;
      }

      foundAudioFiles = true;

      if (audioFiles.length === 1) {
        strudelData[folderName] = audioFiles[0];
      } else {
        strudelData[folderName] = audioFiles.sort();
      }
    }
  } catch (error) {
    throw new Error(`Error scanning directory ${rootPath}: ${error}`);
  }

  if (!foundAudioFiles) {
    console.warn('Warning: No audio files found in the subdirectories of the specified path.');
  }

  const outputFilename = path.join(rootPath, 'strudel.json');
  try {
    await fs.writeFile(
      outputFilename,
      JSON.stringify(strudelData, null, 4) + '\n',
      'utf-8'
    );
    console.log(`Successfully generated 'strudel.json' inside '${rootPath}'`);
  } catch (error) {
    throw new Error(`Error writing to file ${outputFilename}: ${error}`);
  }
}