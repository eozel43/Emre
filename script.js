class BackgroundRemover {
    constructor() {
        this.files = [];
        this.processedFiles = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.filesContainer = document.getElementById('filesContainer');
        this.filesList = document.getElementById('filesList');
        this.removeBgBtn = document.getElementById('removeBgBtn');
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
        this.removeBgBtn.addEventListener('click', () => {
            this.removeBackgrounds();
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
            const isValidType = file.type === 'image/jpeg' || 
                              file.type === 'image/jpg' || 
                              file.type === 'image/png' || 
                              file.type === 'image/webp';
            if (!isValidType) {
                this.showNotification(`${file.name} geçerli bir resim dosyası değil.`, 'error');
            }
            return isValidType;
        });

        if (validFiles.length === 0) return;

        this.files = [...this.files, ...validFiles];
        this.updateFilesList();
        this.updateRemoveButton();
        this.showNotification(`${validFiles.length} resim başarıyla yüklendi.`);
    }

    updateFilesList() {
        this.filesList.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            // Create image preview
            const img = document.createElement('img');
            img.className = 'image-preview';
            img.src = URL.createObjectURL(file);
            
            fileItem.innerHTML = `
                <img src="${URL.createObjectURL(file)}" class="image-preview" alt="Preview">
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="clear-btn" onclick="remover.removeFile(${index})" style="padding: 8px 15px; font-size: 0.9rem;">
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
        this.updateRemoveButton();
    }

    updateRemoveButton() {
        this.removeBgBtn.disabled = this.files.length === 0;
    }

    async removeBackgrounds() {
        if (this.files.length === 0) return;

        this.showProgress();
        this.processedFiles = [];

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const progress = ((i + 1) / this.files.length) * 100;
            
            this.updateProgress(progress, `${file.name} işleniyor...`);
            
            try {
                const processedFile = await this.removeBackground(file);
                this.processedFiles.push(processedFile);
            } catch (error) {
                console.error('Arkaplan kaldırma hatası:', error);
                this.showNotification(`${file.name} işlenirken hata oluştu.`, 'error');
            }
        }

        this.hideProgress();
        this.showResults();
        this.showNotification(`${this.processedFiles.length} resmin arkaplanı başarıyla kaldırıldı.`);
    }

    async removeBackground(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw the original image
                ctx.drawImage(img, 0, 0);
                
                // Get image data for processing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Simple background removal algorithm
                // This is a basic implementation - in a real app, you'd use AI/ML services
                this.simpleBackgroundRemoval(data, canvas.width, canvas.height);
                
                // Put the processed image data back
                ctx.putImageData(imageData, 0, 0);

                canvas.toBlob((blob) => {
                    const fileName = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '_nobg.png');
                    const processedFile = new File([blob], fileName, {
                        type: 'image/png',
                        lastModified: Date.now()
                    });
                    resolve(processedFile);
                }, 'image/png', 0.9);
            };

            img.onerror = () => {
                reject(new Error('Resim yüklenemedi'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    simpleBackgroundRemoval(data, width, height) {
        // This is a simplified background removal algorithm
        // In a real application, you would integrate with AI services like:
        // - Remove.bg API
        // - Cloudinary AI Background Removal
        // - Google Cloud Vision API
        // - Azure Computer Vision
        
        // For demo purposes, we'll create a simple edge detection and color-based removal
        const threshold = 30;
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // Calculate distance from center
                const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                const normalizedDistance = distanceFromCenter / maxDistance;
                
                // Simple edge detection
                const isEdge = this.isEdgePixel(data, x, y, width, height, threshold);
                
                // Remove background based on distance and edge detection
                if (normalizedDistance > 0.8 && !isEdge) {
                    data[index + 3] = 0; // Make transparent
                } else if (this.isBackgroundColor(r, g, b)) {
                    // Reduce opacity for background-like colors
                    data[index + 3] = Math.max(0, data[index + 3] - 100);
                }
            }
        }
    }

    isEdgePixel(data, x, y, width, height, threshold) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
            return true;
        }
        
        const currentIndex = (y * width + x) * 4;
        const currentR = data[currentIndex];
        const currentG = data[currentIndex + 1];
        const currentB = data[currentIndex + 2];
        
        // Check neighboring pixels
        const neighbors = [
            [x-1, y], [x+1, y], [x, y-1], [x, y+1]
        ];
        
        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const neighborIndex = (ny * width + nx) * 4;
                const neighborR = data[neighborIndex];
                const neighborG = data[neighborIndex + 1];
                const neighborB = data[neighborIndex + 2];
                
                const diff = Math.abs(currentR - neighborR) + 
                           Math.abs(currentG - neighborG) + 
                           Math.abs(currentB - neighborB);
                
                if (diff > threshold) {
                    return true;
                }
            }
        }
        
        return false;
    }

    isBackgroundColor(r, g, b) {
        // Simple background color detection
        // Check for white, light gray, or very light colors
        const brightness = (r + g + b) / 3;
        const isLight = brightness > 200;
        const isGrayish = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
        
        return isLight && isGrayish;
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
        
        this.processedFiles.forEach((file, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <img src="${URL.createObjectURL(file)}" class="image-preview" alt="Processed">
                <div class="result-info">
                    <div class="result-name">${file.name}</div>
                    <div class="result-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="download-all-btn" onclick="remover.downloadFile(${index})" style="padding: 8px 15px; font-size: 0.9rem; margin: 0;">
                    <i class="fas fa-download"></i>
                    İndir
                </button>
            `;
            this.resultsList.appendChild(resultItem);
        });

        this.resultsContainer.style.display = 'block';
    }

    downloadFile(index) {
        const file = this.processedFiles[index];
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
        if (this.processedFiles.length === 0) return;

        this.processedFiles.forEach((file, index) => {
            setTimeout(() => {
                this.downloadFile(index);
            }, index * 100);
        });

        this.showNotification('Tüm dosyalar indiriliyor...');
    }

    clearFiles() {
        this.files = [];
        this.processedFiles = [];
        this.filesContainer.style.display = 'none';
        this.resultsContainer.style.display = 'none';
        this.updateRemoveButton();
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

// Initialize the background remover when the page loads
let remover;
document.addEventListener('DOMContentLoaded', () => {
    remover = new BackgroundRemover();
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