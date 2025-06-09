var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AutoDeleteAttachmentsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var AutoDeleteAttachmentsPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.attachmentFolderPath = "Assets/Attachments";
    this.attachmentReferences = /* @__PURE__ */ new Map();
  }
  async onload() {
    console.log("Auto Delete Attachments plugin loaded");
    await this.buildAttachmentReferenceMap();
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof import_obsidian.TFile && file.extension === "md") {
          this.handleFileModification(file);
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof import_obsidian.TFile && file.extension === "md") {
          this.handleFileDelete(file);
        }
      })
    );
  }
  onunload() {
    console.log("Auto Delete Attachments plugin unloaded");
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
          this.attachmentReferences.set(attachment, /* @__PURE__ */ new Set());
        }
        this.attachmentReferences.get(attachment).add(file.path);
      }
    }
  }
  // Extract attachment paths from markdown content
  extractAttachmentPaths(content) {
    const attachmentPaths = [];
    const wikiLinkRegex = /!\[\[([^\]]+)\]\]/g;
    const markdownLinkRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = wikiLinkRegex.exec(content)) !== null) {
      const filename = match[1].split("|")[0];
      if (this.isAttachmentFile(filename)) {
        attachmentPaths.push(`${this.attachmentFolderPath}/${filename}`);
      }
    }
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const filepath = match[1];
      if (filepath.startsWith(this.attachmentFolderPath)) {
        attachmentPaths.push(filepath);
      }
    }
    return attachmentPaths;
  }
  // Check if a file is an attachment (image, video, audio, etc.)
  isAttachmentFile(filename) {
    const extensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".bmp",
      ".svg",
      ".webp",
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".webm",
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx"
    ];
    return extensions.some((ext) => filename.toLowerCase().endsWith(ext));
  }
  // Handle when a file is modified
  async handleFileModification(file) {
    const content = await this.app.vault.read(file);
    const currentAttachments = this.extractAttachmentPaths(content);
    const previousAttachments = /* @__PURE__ */ new Set();
    for (const [attachment, referencingFiles] of this.attachmentReferences) {
      if (referencingFiles.has(file.path)) {
        previousAttachments.add(attachment);
      }
    }
    for (const [attachment, referencingFiles] of this.attachmentReferences) {
      referencingFiles.delete(file.path);
    }
    for (const attachment of currentAttachments) {
      if (!this.attachmentReferences.has(attachment)) {
        this.attachmentReferences.set(attachment, /* @__PURE__ */ new Set());
      }
      this.attachmentReferences.get(attachment).add(file.path);
    }
    for (const attachment of previousAttachments) {
      if (!currentAttachments.includes(attachment)) {
        await this.checkAndDeleteAttachment(attachment);
      }
    }
  }
  // Handle when a file is deleted
  async handleFileDelete(file) {
    for (const [attachment, referencingFiles] of this.attachmentReferences) {
      if (referencingFiles.has(file.path)) {
        referencingFiles.delete(file.path);
        await this.checkAndDeleteAttachment(attachment);
      }
    }
  }
  // Check if an attachment is still referenced, and delete if not
  async checkAndDeleteAttachment(attachmentPath) {
    const referencingFiles = this.attachmentReferences.get(attachmentPath);
    if (!referencingFiles || referencingFiles.size === 0) {
      const attachmentFile = this.app.vault.getAbstractFileByPath(attachmentPath);
      if (attachmentFile instanceof import_obsidian.TFile) {
        try {
          await this.app.vault.delete(attachmentFile);
          console.log(`Deleted unused attachment: ${attachmentPath}`);
          this.attachmentReferences.delete(attachmentPath);
        } catch (error) {
          console.error(`Failed to delete attachment ${attachmentPath}:`, error);
        }
      }
    }
  }
};
