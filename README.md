# Auto Delete Attachments

Automatically deletes unused attachments from your Assets/Attachments folder when you remove them from notes.

## Features

- 🗑️ **Automatic Cleanup**: Deletes attachments immediately when removed from notes
- 🔍 **Smart Detection**: Only deletes truly unused files by scanning all notes
- 📁 **Configurable Path**: Works with standard Assets/Attachments folder structure
- 🛡️ **Safe Operation**: Conservative approach - won't delete if there's any uncertainty
- 📎 **Multiple Formats**: Supports images, videos, audio, PDFs, and documents
- 🔗 **Link Support**: Handles both `![[filename]]` and `![](path)` syntax

## How It Works

1. The plugin monitors all markdown files for changes
2. When you delete an attachment reference from a note, it checks if that file is used elsewhere
3. If the file isn't referenced in any other notes, it gets automatically deleted from your vault
4. Works in real-time as you edit your notes

## Installation

### From Obsidian Community Plugins (Coming Soon)
1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Browse and search for "Auto Delete Attachments"
4. Install and enable the plugin

### Manual Installation
1. Download the latest release from [GitHub](https://github.com/Sohil1926/obsidian-auto-delete-attachments/releases)
2. Extract the files to `VaultFolder/.obsidian/plugins/auto-delete-attachments/`
3. Reload Obsidian and enable the plugin in settings

## Usage

The plugin works automatically once enabled. Make sure your attachments are stored in `Assets/Attachments/` folder.

**Example workflow:**
1. Insert an image: `![[my-image.png]]`
2. Later, delete that line from your note
3. The plugin automatically deletes `Assets/Attachments/my-image.png` if no other notes reference it

## Safety Features

- Only deletes files from the `Assets/Attachments` folder
- Scans all notes to ensure files are truly unused
- Conservative approach - won't delete if there's any uncertainty
- Real-time reference tracking

## Supported File Types

- **Images**: .png, .jpg, .jpeg, .gif, .bmp, .svg, .webp
- **Videos**: .mp4, .mov, .avi, .mkv, .webm
- **Audio**: .mp3, .wav, .ogg, .m4a
- **Documents**: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx

## Contributing

Found a bug or have a feature request? Please [open an issue](https://github.com/Sohil1926/obsidian-auto-delete-attachments/issues) on GitHub.

## License

MIT License - see [LICENSE](LICENSE) for details.
EOF
