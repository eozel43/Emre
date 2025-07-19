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
        this.filesContainer = document.getElementById('filesContainer');
        this.filesList = document.getElementById('filesList');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsList = document.getElementById('resultsList');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    bindEvents() {
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
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
            this.handleFiles(e.dataTransfer.files);
        });

        // Button events
        this.convertBtn.addEventListener('click', () => {
            this.convertImages();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearFiles();
        });

        this.downloadAllBtn.addEventListener('click', () => {
            this.downloadAll();
        });
    }

    handleFiles(fileList) {
        const validFiles = Array.from(fileList).filter(file => {
            const isValidType = file.type === 'image/jpeg' || file.type === 'image/jpg';
            if (!isValidType) {
                this.showNotification(`${file.name} geçerli bir JPG dosyası değil.`, 'error');
            }
            return isValidType;
        });

        if (validFiles.length === 0) return;

        this.files = [...this.files, ...validFiles];
        this.updateFilesList();
        this.updateConvertButton();
        this.showNotification(`${validFiles.length} dosya başarıyla yüklendi.`);
    }

    updateFilesList() {
        this.filesList.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-image file-icon"></i>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="clear-btn" onclick="converter.removeFile(${index})" style="padding: 8px 15px; font-size: 0.9rem;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            this.filesList.appendChild(fileItem);
        });

        this.filesContainer.style.display = this.files.length > 0 ? 'block' : 'none';
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesList();
        this.updateConvertButton();
    }

    updateConvertButton() {
        this.convertBtn.disabled = this.files.length === 0;
    }

    async convertImages() {
        if (this.files.length === 0) return;

        this.showProgress();
        this.convertedFiles = [];

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const progress = ((i + 1) / this.files.length) * 100;
            
            this.updateProgress(progress, `${file.name} dönüştürülüyor...`);
            
            try {
                const convertedFile = await this.convertToPNG(file);
                this.convertedFiles.push(convertedFile);
            } catch (error) {
                console.error('Dönüştürme hatası:', error);
                this.showNotification(`${file.name} dönüştürülürken hata oluştu.`, 'error');
            }
        }

        this.hideProgress();
        this.showResults();
        this.showNotification(`${this.convertedFiles.length} dosya başarıyla PNG'ye dönüştürüldü.`);
    }

    convertToPNG(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    const fileName = file.name.replace(/\.(jpg|jpeg)$/i, '.png');
                    const convertedFile = new File([blob], fileName, {
                        type: 'image/png',
                        lastModified: Date.now()
                    });
                    resolve(convertedFile);
                }, 'image/png', 0.9);
            };

            img.onerror = () => {
                reject(new Error('Resim yüklenemedi'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    showProgress() {
        this.progressContainer.style.display = 'block';
        this.updateProgress(0, 'Hazırlanıyor...');
    }

    updateProgress(percentage, text) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = text;
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    showResults() {
        this.resultsList.innerHTML = '';
        
        this.convertedFiles.forEach((file, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <i class="fas fa-file-image result-icon"></i>
                <div class="result-info">
                    <div class="result-name">${file.name}</div>
                    <div class="result-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="download-all-btn" onclick="converter.downloadFile(${index})" style="padding: 8px 15px; font-size: 0.9rem; margin: 0;">
                    <i class="fas fa-download"></i>
                    İndir
                </button>
            `;
            this.resultsList.appendChild(resultItem);
        });

        this.resultsContainer.style.display = 'block';
    }

    downloadFile(index) {
        const file = this.convertedFiles[index];
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`${file.name} indirildi.`);
    }

    downloadAll() {
        if (this.convertedFiles.length === 0) return;

        this.convertedFiles.forEach((file, index) => {
            setTimeout(() => {
                this.downloadFile(index);
            }, index * 100);
        });

        this.showNotification('Tüm dosyalar indiriliyor...');
    }

    clearFiles() {
        this.files = [];
        this.convertedFiles = [];
        this.filesContainer.style.display = 'none';
        this.resultsContainer.style.display = 'none';
        this.updateConvertButton();
        this.showNotification('Tüm dosyalar temizlendi.');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        
        // Update icon based on type
        const icon = this.notification.querySelector('i');
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            this.notification.style.background = 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
        } else {
            icon.className = 'fas fa-check-circle';
            this.notification.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        }

        this.notification.classList.add('show');
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the converter when the page loads
let converter;
document.addEventListener('DOMContentLoaded', () => {
    converter = new ImageConverter();
});

// Add some nice animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation to the page
    const body = document.body;
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        body.style.opacity = '1';
    }, 100);

    // Add hover effects to file items
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.file-item, .result-item')) {
            e.target.closest('.file-item, .result-item').style.transform = 'translateX(5px) scale(1.02)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.file-item, .result-item')) {
            e.target.closest('.file-item, .result-item').style.transform = 'translateX(0) scale(1)';
        }
    });
});