import { Plugin, TFile, TAbstractFile, Vault } from 'obsidian';

export default class AutoDeleteAttachmentsPlugin extends Plugin {
    private attachmentFolderPath = 'Assets/Attachments';
    private attachmentReferences = new Map<string, Set<string>>();

    async onload() {
        console.log('Auto Delete Attachments plugin loaded');
        
        // Scan all files when plugin loads to build reference map
        await this.buildAttachmentReferenceMap();
        
        // Listen for file modifications
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (file instanceof TFile && file.extension === 'md') {
                    this.handleFileModification(file);
                }
            })
        );
        
        // Listen for file deletions
        this.registerEvent(
            this.app.vault.on('delete', (file) => {
                if (file instanceof TFile && file.extension === 'md') {
                    this.handleFileDelete(file);
                }
            })
        );
    }

    onunload() {
        console.log('Auto Delete Attachments plugin unloaded');
    }

    // Build a map of which attachments are referenced by which files
    async buildAttachmentReferenceMap() {
        const markdownFiles = this.app.vault.getMarkdownFiles();
        this.attachmentReferences.clear();
        
        for (const file of markdownFiles) {
            const content = await this.app.vault.read(file);
            const attachments = this.extractAttachmentPaths(content);
            
            for (const attachment of attachments) {
                if (!this.attachmentReferences.has(attachment)) {
                    this.attachmentReferences.set(attachment, new Set());
                }
                this.attachmentReferences.get(attachment)!.add(file.path);
            }
        }
    }

    // Extract attachment paths from markdown content
    extractAttachmentPaths(content: string): string[] {
        const attachmentPaths: string[] = [];
        
        // Match both ![[filename]] and ![](filename) formats
        const wikiLinkRegex = /!\[\[([^\]]+)\]\]/g;
        const markdownLinkRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
        
        let match;
        
        // Find wiki-style links
        while ((match = wikiLinkRegex.exec(content)) !== null) {
            const filename = match[1].split('|')[0]; // Remove display text if present
            if (this.isAttachmentFile(filename)) {
                attachmentPaths.push(`${this.attachmentFolderPath}/${filename}`);
            }
        }
        
        // Find markdown-style links
        while ((match = markdownLinkRegex.exec(content)) !== null) {
            const filepath = match[1];
            if (filepath.startsWith(this.attachmentFolderPath)) {
                attachmentPaths.push(filepath);
            }
        }
        
        return attachmentPaths;
    }

    // Check if a file is an attachment (image, video, audio, etc.)
    isAttachmentFile(filename: string): boolean {
        const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp', 
                          '.mp4', '.mov', '.avi', '.mkv', '.webm',
                          '.mp3', '.wav', '.ogg', '.m4a',
                          '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
        
        return extensions.some(ext => filename.toLowerCase().endsWith(ext));
    }

    // Handle when a file is modified
    async handleFileModification(file: TFile) {
        const content = await this.app.vault.read(file);
        const currentAttachments = this.extractAttachmentPaths(content);
        
        // Get previously referenced attachments for this file
        const previousAttachments = new Set<string>();
        for (const [attachment, referencingFiles] of this.attachmentReferences) {
            if (referencingFiles.has(file.path)) {
                previousAttachments.add(attachment);
            }
        }
        
        // Update the reference map
        // First, remove this file from all attachment references
        for (const [attachment, referencingFiles] of this.attachmentReferences) {
            referencingFiles.delete(file.path);
        }
        
        // Then add current attachments
        for (const attachment of currentAttachments) {
            if (!this.attachmentReferences.has(attachment)) {
                this.attachmentReferences.set(attachment, new Set());
            }
            this.attachmentReferences.get(attachment)!.add(file.path);
        }
        
        // Check for attachments that were removed
        for (const attachment of previousAttachments) {
            if (!currentAttachments.includes(attachment)) {
                await this.checkAndDeleteAttachment(attachment);
            }
        }
    }

    // Handle when a file is deleted
    async handleFileDelete(file: TFile) {
        // Remove this file from all attachment references
        for (const [attachment, referencingFiles] of this.attachmentReferences) {
            if (referencingFiles.has(file.path)) {
                referencingFiles.delete(file.path);
                await this.checkAndDeleteAttachment(attachment);
            }
        }
    }

    // Check if an attachment is still referenced, and delete if not
    async checkAndDeleteAttachment(attachmentPath: string) {
        const referencingFiles = this.attachmentReferences.get(attachmentPath);
        
        if (!referencingFiles || referencingFiles.size === 0) {
            // No files reference this attachment, so delete it
            const attachmentFile = this.app.vault.getAbstractFileByPath(attachmentPath);
            
            if (attachmentFile instanceof TFile) {
                try {
                    await this.app.vault.delete(attachmentFile);
                    console.log(`Deleted unused attachment: ${attachmentPath}`);
                    
                    // Remove from reference map
                    this.attachmentReferences.delete(attachmentPath);
                } catch (error) {
                    console.error(`Failed to delete attachment ${attachmentPath}:`, error);
                }
            }
        }
    }
}