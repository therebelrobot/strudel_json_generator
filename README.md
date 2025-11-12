# strudel-json-generator

A TypeScript utility that generates a JSON file containing your audio sample information for use with [Strudel](https://strudel.cc/). Now with watch mode support for automatic updates!

> **Note:** This is a TypeScript port of the original Python script by [zhouyuyang-joey](https://github.com/zhouyuyang-joey/strudel_json_generator). All credit for the original concept and implementation goes to the original author.

## Features

- 🎵 Automatically scans directories for audio files (`.wav`, `.mp3`, `.flac`, `.aiff`)
- 📝 Generates properly formatted `strudel.json` files
- 👀 **Watch mode** - automatically regenerates when files change
- 🚀 Easy to use via `npx` - no installation required
- 🔧 TypeScript for type safety and better maintainability

## Requirements

- Node.js 18.0.0 or higher

## Installation

You don't need to install anything! Use it directly with `npx`:

```bash
npx strudel-json-generator [options]
```

Or install globally:

```bash
npm install -g strudel-json-generator
```

## Usage

### Basic Usage

1. First, organize your audio samples into a root directory where each subfolder represents a sample category (e.g., `kick`, `perc`, `synth`, `vocal`).

![Sample Directory Structure](media/image-0.png)

2. Run the generator:

```bash
npx strudel-json-generator -p <path> -u <username> -r <repo>
```

**Required Options:**
- `-p, --path <path>`: Path to your root sample directory
- `-u, --username <username>`: Your GitHub username
- `-r, --repo <repo>`: Your GitHub repository name

**Optional Options:**
- `-b, --branch <branch>`: Repository branch name (defaults to `main`)
- `-w, --watch`: Enable watch mode for automatic regeneration

### Examples

**Basic generation:**
```bash
npx strudel-json-generator -p /Users/yourname/Desktop/audio -u yourname -r super_samples
```

**With custom branch:**
```bash
npx strudel-json-generator -p ./audio -u yourname -r super_samples -b develop
```

**Watch mode (automatically regenerates on file changes):**
```bash
npx strudel-json-generator -p ./audio -u yourname -r super_samples --watch
```

The generator will create a `strudel.json` file in the specified directory.

## Watch Mode

Watch mode is perfect for development! It monitors your sample directory and automatically regenerates the `strudel.json` file whenever you:
- Add new audio files
- Remove audio files  
- Add new category folders
- Remove category folders

To use watch mode, simply add the `--watch` or `-w` flag:

```bash
npx strudel-json-generator -p ./audio -u yourname -r super_samples --watch
```

Press `Ctrl+C` to stop watching.

## Publishing Your Samples

After generating the `strudel.json` file:

1. Create a GitHub repository with the same name you specified in the command

![Create Repository](media/image-1.png)
![Repository Settings](media/image-2.png)

2. Upload all your sample folders and the `strudel.json` file to your GitHub repo

![Upload Files](media/image-3.png)
![Files Uploaded](media/image-4.png)

3. Commit the changes

![Commit Changes](media/image-5.png)

## Using Your Samples in Strudel

Now you can load your samples in Strudel using:

```javascript
samples('github:<your-username>/<your-repo>')
```

For example:
```javascript
samples('github:yourname/super_samples')
```

## Troubleshooting

If you update your repo and Strudel still doesn't load your samples correctly, please refer to: [Loading Samples from a strudel.json file](https://strudel.cc/learn/samples/#loading-samples-from-a-strudeljson-file)

## Development

To work on this project locally:

```bash
# Clone the repository
git clone https://github.com/therebelrobot/strudel_json_generator.git
cd strudel_json_generator

# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/cli.js -p <path> -u <username> -r <repo>
```

## Migrating from Python Version

If you were using the Python version, the TypeScript version works exactly the same way, with these additions:
- Use `npx strudel-json-generator` instead of `python generator.py`
- Add the `--watch` flag for automatic regeneration
- No Python installation required

## License

MIT

## Disclaimer

Due to copyright issues, sample repositories used in demonstrations cannot be shared publicly. Users should only distribute samples they have the right to redistribute.