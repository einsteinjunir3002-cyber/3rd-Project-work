// Polyfill browser globals that pdf-parse / pdfjs-dist expects in Node.js environments
if (typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === 'undefined') {
    global.ImageData = class ImageData {};
}
if (typeof global.Path2D === 'undefined') {
    global.Path2D = class Path2D {};
}

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts text from various document formats while preserving basic structure.
 */
class DocumentExtractor {
    static async extractText(fileBuffer, mimetype, originalName) {
        try {
            let extractedText = '';

            if (mimetype === 'application/pdf') {
                const data = await pdfParse(fileBuffer);
                extractedText = data.text;
            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword' || originalName.endsWith('.docx')) {
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                extractedText = result.value;
            } else if (mimetype === 'text/plain' || originalName.endsWith('.txt')) {
                extractedText = fileBuffer.toString('utf8');
            } else {
                throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
            }

            // Clean the text: remove excessive whitespace but preserve paragraphs
            return this.cleanText(extractedText);
        } catch (error) {
            console.error('Error extracting document text:', error);
            throw new Error('Failed to extract text from the document. The file might be corrupted or in an unsupported format.');
        }
    }

    static cleanText(text) {
        if (!text) return '';
        // Replace multiple newlines with a single double-newline to preserve paragraphs
        let cleaned = text.replace(/[\r\n]{3,}/g, '\n\n');
        // Replace multiple spaces with a single space
        cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
        return cleaned.trim();
    }
}

module.exports = DocumentExtractor;
