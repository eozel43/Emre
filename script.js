class BackgroundRemover {
    constructor() {
        this.files = [];
        this.processedImages = [];
        this.model = null;
        this.isModelLoaded = false;
        this.initializeElements();
        this.bindEvents();
        this.loadModel();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.filesContainer = document.getElementById('filesContainer');
        this.filesList = document.getElementById('filesList');
        this.processBtn = document.getElementById('processBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.newImagesBtn = document.getElementById('newImagesBtn');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
        this.loadingOverlay = document.getElementById('loadingOverlay');
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
        this.processBtn.addEventListener('click', () => {
            this.processImages();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearFiles();
        });

        this.downloadAllBtn.addEventListener('click', () => {
            this.downloadAllAsZip();
        });

        this.newImagesBtn.addEventListener('click', () => {
            this.addNewImages();
        });
    }

    async loadModel() {
        try {
            this.showLoadingOverlay(true);
            this.showNotification('AI modeli yükleniyor... Bu işlem birkaç saniye sürebilir.');
            
            // Load BodyPix model
            this.model = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2
            });
            
            this.isModelLoaded = true;
            this.showLoadingOverlay(false);
            this.showNotification('AI modeli başarıyla yüklendi! Artık resim yükleyebilirsiniz.');
        } catch (error) {
            console.error('Model yükleme hatası:', error);
            this.showLoadingOverlay(false);
            this.showNotification('AI modeli yüklenirken hata oluştu. Lütfen sayfayı yenileyin.', 'error');
        }
    }

    showLoadingOverlay(show) {
        if (show) {
            this.loadingOverlay.classList.add('show');
        } else {
            this.loadingOverlay.classList.remove('show');
        }
    }

    handleFiles(fileList) {
        const validFiles = Array.from(fileList).filter(file => {
            const isValidType = file.type.startsWith('image/');
            if (!isValidType) {
                this.showNotification(`${file.name} geçerli bir resim dosyası değil.`, 'error');
            }
            return isValidType;
        });

        if (validFiles.length === 0) return;

        this.files = [...this.files, ...validFiles];
        this.updateFilesList();
        this.updateProcessButton();
        this.showNotification(`${validFiles.length} resim başarıyla yüklendi.`);
    }

    updateFilesList() {
        this.filesList.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            // Create image preview
            const reader = new FileReader();
            reader.onload = (e) => {
                fileItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" class="file-icon" style="width: 60px; height: 60px; object-fit: cover; border-radius: 10px;">
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <button class="clear-btn" onclick="backgroundRemover.removeFile(${index})" style="padding: 8px 15px; font-size: 0.9rem;">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            };
            reader.readAsDataURL(file);
            
            this.filesList.appendChild(fileItem);
        });

        this.filesContainer.style.display = this.files.length > 0 ? 'block' : 'none';
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesList();
        this.updateProcessButton();
    }

    updateProcessButton() {
        this.processBtn.disabled = this.files.length === 0 || !this.isModelLoaded;
        if (!this.isModelLoaded) {
            this.processBtn.innerHTML = '<i class="fas fa-clock"></i> AI Modeli Yükleniyor...';
        } else {
            this.processBtn.innerHTML = '<i class="fas fa-magic"></i> Arkaplanları Kaldır';
        }
    }

    async processImages() {
        if (this.files.length === 0 || !this.isModelLoaded) return;

        this.showProgress();
        this.processedImages = [];

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const progress = ((i + 1) / this.files.length) * 100;
            
            this.updateProgress(progress, `${file.name} işleniyor...`);
            
            try {
                const processedImage = await this.removeBackground(file);
                this.processedImages.push({
                    name: file.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '_no_bg.png'),
                    blob: processedImage.blob,
                    url: processedImage.url,
                    originalFile: file
                });
            } catch (error) {
                console.error('Arkaplan kaldırma hatası:', error);
                this.showNotification(`${file.name} işlenirken hata oluştu.`, 'error');
            }
        }

        this.hideProgress();
        this.showResults();
        this.showNotification(`${this.processedImages.length} resmin arkaplanı başarıyla kaldırıldı.`);
    }

    async removeBackground(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = async () => {
                try {
                    // Create canvas for the image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas size to match image
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw image on canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // Get person segmentation from BodyPix
                    const segmentation = await this.model.segmentPerson(canvas, {
                        flipHorizontal: false,
                        internalResolution: 'medium',
                        segmentationThreshold: 0.7
                    });
                    
                    // Create result canvas
                    const resultCanvas = document.createElement('canvas');
                    const resultCtx = resultCanvas.getContext('2d');
                    resultCanvas.width = img.width;
                    resultCanvas.height = img.height;
                    
                    // Get image data
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Apply mask - make background transparent
                    for (let i = 0; i < segmentation.data.length; i++) {
                        if (segmentation.data[i] === 0) {
                            // Background pixel - make transparent
                            data[i * 4 + 3] = 0; // Alpha channel
                        }
                    }
                    
                    // Put modified image data on result canvas
                    resultCtx.putImageData(imageData, 0, 0);
                    
                    // Convert to blob
                    resultCanvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        resolve({ blob, url });
                    }, 'image/png', 1.0);
                    
                } catch (error) {
                    reject(error);
                }
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
        this.resultsGrid.innerHTML = '';
        
        this.processedImages.forEach((image, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <img src="${image.url}" alt="Processed" class="result-preview">
                <div class="result-info">
                    <div class="result-name">${image.name}</div>
                    <div class="result-size">${this.formatFileSize(image.blob.size)}</div>
                </div>
                <button class="download-all-btn" onclick="backgroundRemover.downloadSingle(${index})" style="padding: 8px 15px; font-size: 0.9rem; margin: 0; width: auto;">
                    <i class="fas fa-download"></i>
                    İndir
                </button>
            `;
            this.resultsGrid.appendChild(resultItem);
        });

        this.resultsContainer.style.display = 'block';
    }

    downloadSingle(index) {
        const image = this.processedImages[index];
        const a = document.createElement('a');
        a.href = image.url;
        a.download = image.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.showNotification(`${image.name} indirildi.`);
    }

    async downloadAllAsZip() {
        if (this.processedImages.length === 0) return;

        try {
            this.showNotification('ZIP dosyası hazırlanıyor...');
            
            const zip = new JSZip();
            const folder = zip.folder('arkaplan_kaldirilmis_resimler');
            
            // Add all processed images to zip
            for (let i = 0; i < this.processedImages.length; i++) {
                const image = this.processedImages[i];
                folder.file(image.name, image.blob);
            }
            
            // Generate and download zip
            const zipBlob = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(zipBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `arkaplan_kaldirilmis_resimler_${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showNotification('Tüm resimler ZIP olarak indirildi.');
            
        } catch (error) {
            console.error('ZIP indirme hatası:', error);
            this.showNotification('ZIP dosyası oluşturulurken hata oluştu.', 'error');
        }
    }

    addNewImages() {
        this.fileInput.click();
    }

    clearFiles() {
        this.files = [];
        this.processedImages = [];
        this.filesContainer.style.display = 'none';
        this.resultsContainer.style.display = 'none';
        this.updateProcessButton();
        
        // Clean up URLs
        this.processedImages.forEach(image => {
            URL.revokeObjectURL(image.url);
        });
        
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
        
        // Update icon and color based on type
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
        }, 4000);
    }
}

// Initialize the background remover when the page loads
let backgroundRemover;
document.addEventListener('DOMContentLoaded', () => {
    backgroundRemover = new BackgroundRemover();
});

// Add nice loading animations
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation to the page
    const body = document.body;
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.6s ease';
    
    setTimeout(() => {
        body.style.opacity = '1';
    }, 100);

    // Add hover effects and animations
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.file-item, .result-item')) {
            const item = e.target.closest('.file-item, .result-item');
            item.style.transform = 'translateY(-5px) scale(1.02)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.file-item, .result-item')) {
            const item = e.target.closest('.file-item, .result-item');
            item.style.transform = 'translateY(0) scale(1)';
        }
    });

    // Add particles effect to upload area
    createParticles();
});

// Particle animation for visual appeal
function createParticles() {
    const uploadArea = document.getElementById('uploadArea');
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #ffd700;
                border-radius: 50%;
                pointer-events: none;
                opacity: 0;
                z-index: 1;
            `;
            
            uploadArea.style.position = 'relative';
            uploadArea.appendChild(particle);
            
            // Animate particle
            const x = Math.random() * uploadArea.offsetWidth;
            const y = Math.random() * uploadArea.offsetHeight;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            particle.animate([
                { opacity: 0, transform: 'scale(0)' },
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0)' }
            ], {
                duration: 2000,
                easing: 'ease-out'
            }).addEventListener('finish', () => {
                particle.remove();
            });
            
        }, i * 400);
    }
    
    // Repeat animation
    setTimeout(createParticles, 3000);
}

// Performance optimization for better user experience
window.addEventListener('beforeunload', () => {
    // Clean up object URLs to prevent memory leaks
    if (backgroundRemover && backgroundRemover.processedImages) {
        backgroundRemover.processedImages.forEach(image => {
            URL.revokeObjectURL(image.url);
        });
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'o':
                e.preventDefault();
                document.getElementById('fileInput').click();
                break;
            case 'Enter':
                e.preventDefault();
                if (backgroundRemover && backgroundRemover.processBtn && !backgroundRemover.processBtn.disabled) {
                    backgroundRemover.processImages();
                }
                break;
        }
    }
});