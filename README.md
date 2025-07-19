# JPG to PNG Converter

Modern ve kullanıcı dostu bir web uygulaması ile JPG resimlerinizi PNG formatına dönüştürün.

## Özellikler

- ✨ **Modern Arayüz**: Gradient renkler ve smooth animasyonlarla modern tasarım
- 🖱️ **Sürükle & Bırak**: Dosyaları kolayca sürükleyip bırakarak yükleyin
- 📱 **Responsive**: Mobil ve masaüstü cihazlarda mükemmel görünüm
- 🚀 **Hızlı Dönüştürme**: Tarayıcı tabanlı, sunucu gerektirmez
- 📦 **Toplu İndirme**: Tüm dönüştürülmüş dosyaları ZIP olarak indirin
- 🔄 **Canlı Önizleme**: Dönüştürülmüş resimlerin anlık önizlemesi
- 🎯 **Sadece JPG/JPEG**: Güvenli dosya filtreleme

## Kullanım

### 1. Web Uygulamasını Başlatma

Projeyi klonladıktan sonra, herhangi bir web sunucusu ile `index.html` dosyasını açın:

```bash
# Python 3 ile basit sunucu
python -m http.server 8000

# Node.js ile live-server (global kurulu ise)
live-server

# VS Code Live Server eklentisi ile
# index.html'e sağ tıklayıp "Open with Live Server"
```

### 2. Dosya Yükleme

- **Yöntem 1**: "Dosya Seç" butonuna tıklayarak dosyalarınızı seçin
- **Yöntem 2**: JPG dosyalarınızı yükleme alanına sürükleyip bırakın

### 3. Dönüştürme

1. Dosyalarınızı yükledikten sonra "Tümünü Dönüştür" butonuna tıklayın
2. Dönüştürme işlemi tamamlandığında sonuçlar görüntülenecek
3. Her dosyayı tek tek veya tümünü ZIP olarak indirebilirsiniz

## Teknik Detaylar

### Dosya Yapısı

```
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri ve animasyonlar
├── script.js           # JavaScript fonksiyonları
└── README.md           # Bu dosya
```

### Kullanılan Teknolojiler

- **HTML5**: Modern semantic markup
- **CSS3**: Flexbox, Grid, Gradients, Animations
- **JavaScript ES6+**: Classes, Async/Await, Modules
- **Canvas API**: Resim dönüştürme işlemleri
- **Font Awesome**: İkonlar
- **JSZip**: ZIP dosyası oluşturma (dinamik yükleme)

### Tarayıcı Desteği

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### Özellikler Detayı

#### Drag & Drop
- Dosyaları sürüklerken görsel geri bildirim
- Sadece JPG/JPEG dosyalarını kabul eder
- Çoklu dosya desteği

#### Dönüştürme Süreci
- Canvas API kullanarak client-side dönüştürme
- Beyaz arkaplan ekleyerek şeffaflık desteği
- Orijinal kaliteyi koruma

#### Kullanıcı Deneyimi
- Loading animasyonları
- Toast bildirimleri
- Responsive tasarım
- Smooth hover efektleri

## Geliştirme

### Yerel Geliştirme Ortamı

1. Repoyu klonlayın
2. Herhangi bir kod editörü ile açın (VS Code önerilen)
3. Live Server ile çalıştırın

### Customization

CSS değişkenleri kullanarak renkleri ve stilleri kolayca özelleştirebilirsiniz:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --success-color: #28a745;
    --error-color: #dc3545;
    --info-color: #17a2b8;
}
```

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz.

---

**Not**: Bu uygulama tamamen tarayıcı tabanlıdır ve hiçbir veri sunucuya gönderilmez. Tüm işlemler yerel olarak gerçekleştirilir.