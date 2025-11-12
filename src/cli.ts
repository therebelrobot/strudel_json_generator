#!/usr/bin/env node

import { Command } from 'commander';
import { watch } from 'chokidar';
import { createStrudelJson } from './generator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getPackageVersion(): Promise<string> {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

interface CliOptions {
  path: string;
  baseUrl?: string;
  username?: string;
  repo?: string;
  branch?: string;
  watch?: boolean;
}

async function generate(options: CliOptions): Promise<void> {
  try {
    await createStrudelJson({
      rootPath: path.resolve(options.path),
      baseUrl: options.baseUrl,
      githubUser: options.username,
      githubRepo: options.repo,
      githubBranch: options.branch,
    });
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

async function startWatchMode(options: CliOptions): Promise<void> {
  const absolutePath = path.resolve(options.path);

  console.log(`🔍 Watch mode enabled. Monitoring '${absolutePath}' for changes...`);
  console.log('Press Ctrl+C to stop.\n');

  // Generate initial file
  await generate(options);

  // Setup debouncing to avoid multiple rapid regenerations
  let debounceTimer: NodeJS.Timeout | null = null;
  const DEBOUNCE_MS = 1000;

  const watcher = watch(absolutePath, {
    persistent: true,
    ignoreInitial: true,
    ignored: /strudel\.json$/, // Ignore changes to strudel.json itself
    depth: 1, // Only watch one level deep (root and immediate subdirectories)
  });

  watcher
    .on('add', (filePath) => {
      console.log(`📁 File added: ${filePath}`);
      scheduleRegeneration();
    })
    .on('unlink', (filePath) => {
      console.log(`🗑️  File removed: ${filePath}`);
      scheduleRegeneration();
    })
    .on('addDir', (dirPath) => {
      console.log(`📂 Directory added: ${dirPath}`);
      scheduleRegeneration();
    })
    .on('unlinkDir', (dirPath) => {
      console.log(`📂 Directory removed: ${dirPath}`);
      scheduleRegeneration();
    })
    .on('error', (error) => {
      console.error('Watcher error:', error);
    });

  function scheduleRegeneration(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      console.log('🔄 Regenerating strudel.json...');
      await generate(options);
    }, DEBOUNCE_MS);
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping watch mode...');
    watcher.close();
    process.exit(0);
  });
}

async function main(): Promise<void> {
  const version = await getPackageVersion();

  const program = new Command();

  program
    .name('strudel-json')
    .description('Generate strudel.json files for audio sample libraries')
    .version(version)
    .requiredOption('-p, --path <path>', 'Path to the local root directory to scan')
    .option('--base-url <url>', 'Full base URL for samples (alternative to username/repo)')
    .option('-u, --username <username>', 'Your GitHub username')
    .option('-r, --repo <repo>', 'Your GitHub repository name')
    .option('-b, --branch <branch>', 'Your GitHub repository branch name', 'main')
    .option('-w, --watch', 'Watch mode: automatically regenerate on file changes')
    .action(async (options: CliOptions) => {
      // Validate that either baseUrl OR both username+repo are provided
      const hasBaseUrl = !!options.baseUrl;
      const hasGithubInfo = !!(options.username && options.repo);

      if (!hasBaseUrl && !hasGithubInfo) {
        console.error('Error: Either --base-url or both --username and --repo must be provided.');
        process.exit(1);
      }

      if (options.watch) {
        await startWatchMode(options);
      } else {
        await generate(options);
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});