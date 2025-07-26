# Arkaplan Kaldırıcı - AI Background Remover

Modern ve kullanıcı dostu bir web uygulaması ile resimlerinizin arkaplanını otomatik olarak kaldırın. Yapay zeka destekli bu araç, TensorFlow.js ve BodyPix modeli kullanarak tarayıcınızda yerel olarak çalışır.

## ✨ Özellikler

- 🎯 **AI Destekli**: TensorFlow.js BodyPix modeli ile hassas arkaplan tespiti
- 🖼️ **Çoklu Format Desteği**: JPG, PNG, WEBP, GIF formatlarını destekler
- 🚀 **Hızlı İşlem**: Tarayıcınızda yerel olarak çalışır, sunucuya yükleme gerekmez
- 📱 **Responsive Tasarım**: Mobil ve masaüstü cihazlarda mükemmel görünüm
- 🎨 **Modern UI**: Güzel animasyonlar ve kullanıcı dostu arayüz
- 📦 **Toplu İndirme**: Tüm işlenmiş resimleri ZIP olarak indirin
- ⌨️ **Klavye Kısayolları**: Ctrl+O (dosya seç), Ctrl+Enter (işle)
- 🔒 **Gizlilik**: Tüm işlemler yerel olarak yapılır, veriler sunucuya gönderilmez

## 🚀 Kullanım

1. **Resim Yükleme**: 
   - "Dosya Seç" butonuna tıklayın veya resimleri sürükleyin
   - Birden fazla resim seçebilirsiniz

2. **İşleme**:
   - "Arkaplanları Kaldır" butonuna tıklayın
   - AI modeli otomatik olarak arkaplanları tespit edip kaldırır

3. **İndirme**:
   - Her resmi ayrı ayrı indirin
   - Veya "Tümünü İndir (ZIP)" ile toplu indirin

## 🛠️ Teknolojiler

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: TensorFlow.js, BodyPix Model
- **Utilities**: JSZip (toplu indirme için)
- **Design**: Modern CSS Grid/Flexbox, Font Awesome icons

## 📁 Proje Yapısı

```
arkaplan-kaldirici/
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stil dosyası
├── script.js           # JavaScript işlevsellik
├── README.md           # Proje dokümantasyonu
└── .gitignore         # Git ignore kuralları
```

## 🌟 Özellikler Detayı

### AI Modeli
- **BodyPix**: Google'ın açık kaynak insan segmentasyon modeli
- **MobileNetV1**: Hızlı ve hafif işlem için optimize edilmiş
- **Tarayıcı Tabanlı**: Sunucu gerektirmez, tamamen istemci tarafında çalışır

### Kullanıcı Deneyimi
- **Drag & Drop**: Kolay dosya yükleme
- **Canlı Önizleme**: Yüklenen resimlerin küçük resimlerini görün
- **İlerleme Göstergesi**: İşlem durumunu takip edin
- **Bildirimler**: İşlem sonuçları hakkında anında geri bildirim

### Performans
- **Optimize Edilmiş**: Hızlı yükleme ve işlem süreleri
- **Bellek Yönetimi**: Object URL'lerin otomatik temizlenmesi
- **Responsive**: Tüm cihaz boyutlarında sorunsuz çalışma

## 🎨 Tasarım

Modern ve şık bir arayüz tasarımı:
- Gradient arkaplanlar
- Smooth animasyonlar ve geçişler
- Cam efekti (backdrop blur)
- Parçacık animasyonları
- Hover efektleri

## 📱 Responsive Tasarım

- **Desktop**: Full özellik seti ile geniş ekran deneyimi
- **Tablet**: Optimize edilmiş düzen ve touch etkileşimleri
- **Mobile**: Kompakt tasarım ve kolay navigasyon

## 🔧 Kurulum

Bu uygulama tamamen statik dosyalardan oluşur ve herhangi bir kurulum gerektirmez:

1. Projeyi klonlayın veya indirin
2. `index.html` dosyasını bir web tarayıcısında açın
3. Kullanmaya başlayın!

```bash
# Proje klonlama
git clone [repository-url]
cd arkaplan-kaldirici

# Yerel sunucu ile çalıştırma (opsiyonel)
python -m http.server 8000
# veya
npx serve .
```

## 🌐 Tarayıcı Desteği

- ✅ Chrome (önerilen)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11+ (sınırlı destek)

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🙏 Teşekkürler

- [TensorFlow.js](https://www.tensorflow.org/js) - AI model desteği
- [BodyPix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix) - İnsan segmentasyon modeli
- [Font Awesome](https://fontawesome.com/) - İkonlar
- [JSZip](https://stuk.github.io/jszip/) - ZIP dosya oluşturma

## 📞 İletişim

Sorularınız veya önerileriniz için GitHub issues kullanabilirsiniz.

---

**Not**: Bu uygulama tamamen istemci tarafında çalışır. Resimleriniz hiçbir zaman sunucuya gönderilmez ve gizliliğiniz korunur.