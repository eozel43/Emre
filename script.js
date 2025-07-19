class ImageConverter {
    constructor() {
        this.files = [];
        this.convertedFiles = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.filesSection = document.getElementById('filesSection');
        this.filesList = document.getElementById('filesList');
        this.convertAllBtn = document.getElementById('convertAllBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsList = document.getElementById('resultsList');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    bindEvents() {
        // Upload button click
        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type === 'image/jpeg' || file.type === 'image/jpg'
            );
            this.handleFiles(files);
        });

        // Convert all button
        this.convertAllBtn.addEventListener('click', () => {
            this.convertAllFiles();
        });

        // Clear all button
        this.clearAllBtn.addEventListener('click', () => {
            this.clearAllFiles();
        });

        // Download all button
        this.downloadAllBtn.addEventListener('click', () => {
            this.downloadAllFiles();
        });

        // Click upload area to select files
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
    }

    handleFiles(files) {
        const validFiles = files.filter(file => 
            file.type === 'image/jpeg' || file.type === 'image/jpg'
        );

        if (validFiles.length === 0) {
            this.showNotification('Lütfen sadece JPG/JPEG dosyaları seçin!', 'error');
            return;
        }

        validFiles.forEach(file => {
            if (!this.files.some(f => f.name === file.name && f.size === file.size)) {
                this.files.push(file);
            }
        });

        this.updateFilesDisplay();
        this.showNotification(`${validFiles.length} dosya eklendi!`, 'success');
    }

    updateFilesDisplay() {
        if (this.files.length === 0) {
            this.filesSection.style.display = 'none';
            return;
        }

        this.filesSection.style.display = 'block';
        this.filesList.innerHTML = '';

        this.files.forEach((file, index) => {
            const fileItem = this.createFileItem(file, index);
            this.filesList.appendChild(fileItem);
        });
    }

    createFileItem(file, index) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const fileSize = this.formatFileSize(file.size);

        fileItem.innerHTML = `
            <div class="file-icon">
                <i class="fas fa-image"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
            </div>
            <div class="file-actions">
                <button class="btn btn-danger" onclick="imageConverter.removeFile(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return fileItem;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesDisplay();
        this.showNotification('Dosya kaldırıldı!', 'info');
    }

    clearAllFiles() {
        this.files = [];
        this.convertedFiles = [];
        this.updateFilesDisplay();
        this.updateResultsDisplay();
        this.showNotification('Tüm dosyalar temizlendi!', 'info');
    }

    async convertAllFiles() {
        if (this.files.length === 0) {
            this.showNotification('Dönüştürülecek dosya bulunamadı!', 'error');
            return;
        }

        this.showLoading(true);
        this.convertedFiles = [];

        try {
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                const convertedFile = await this.convertToPNG(file);
                this.convertedFiles.push(convertedFile);
            }

            this.updateResultsDisplay();
            this.showNotification(`${this.files.length} dosya başarıyla dönüştürüldü!`, 'success');
        } catch (error) {
            console.error('Conversion error:', error);
            this.showNotification('Dönüştürme sırasında hata oluştu!', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    convertToPNG(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Set white background for transparency
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    const fileName = file.name.replace(/\.(jpg|jpeg)$/i, '.png');
                    const convertedFile = new File([blob], fileName, { type: 'image/png' });
                    
                    resolve({
                        file: convertedFile,
                        originalName: file.name,
                        url: URL.createObjectURL(blob),
                        size: blob.size
                    });
                }, 'image/png', 1.0);
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${file.name}`));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    updateResultsDisplay() {
        if (this.convertedFiles.length === 0) {
            this.resultsSection.style.display = 'none';
            return;
        }

        this.resultsSection.style.display = 'block';
        this.resultsList.innerHTML = '';

        this.convertedFiles.forEach((result, index) => {
            const resultItem = this.createResultItem(result, index);
            this.resultsList.appendChild(resultItem);
        });
    }

    createResultItem(result, index) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        const fileSize = this.formatFileSize(result.size);

        resultItem.innerHTML = `
            <img src="${result.url}" alt="Preview" class="result-preview">
            <div class="result-info">
                <div class="result-name">${result.file.name}</div>
                <div class="result-details">
                    Boyut: ${fileSize} | Orijinal: ${result.originalName}
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-download" onclick="imageConverter.downloadFile(${index})">
                    <i class="fas fa-download"></i> İndir
                </button>
            </div>
        `;

        return resultItem;
    }

    downloadFile(index) {
        const result = this.convertedFiles[index];
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`${result.file.name} indirildi!`, 'success');
    }

    async downloadAllFiles() {
        if (this.convertedFiles.length === 0) {
            this.showNotification('İndirilecek dosya bulunamadı!', 'error');
            return;
        }

        // Create and download a zip file with all converted images
        const JSZip = await this.loadJSZip();
        const zip = new JSZip();

        this.convertedFiles.forEach(result => {
            zip.file(result.file.name, result.file);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'converted_images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Tüm dosyalar ZIP olarak indirildi!', 'success');
    }

    async loadJSZip() {
        if (window.JSZip) {
            return window.JSZip;
        }

        // Load JSZip dynamically
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the image converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.imageConverter = new ImageConverter();
});

// Add some helper functions to global scope for button onclick handlers
window.imageConverter = null;