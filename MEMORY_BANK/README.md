# Memory Bank - API Gateway

Bu dizin, API Gateway projesinin kapsamlı belgelendirmesini içerir. Proje hakkında hızlı bilgi almak ve geliştirme süreci boyunca referans almak için bu dosyaları kullanın.

## 📚 Belge Yapısı

### 1. **projectbrief.md**
Proje hakkında genel bilgiler:
- Proje adı ve amacı
- Ana hedefler
- Temel gereksinimler
- Teknoloji stack özeti

**Kullanım**: Proje hakkında hızlı genel bakış için okuyun.

### 2. **techContext.md**
Teknik detaylar ve teknoloji yığını:
- Tespit edilen tüm bağımlılıklar
- Framework ve kütüphaneler
- Geliştirme ortamı gereksinimleri
- Build ve run scriptleri
- Konfigürasyon dosyaları
- Environment variables

**Kullanım**: Teknoloji hakkında detaylı bilgi, bağımlılık versiyonları, setup talimatları.

### 3. **systemPatterns.md**
Sistem mimarisi ve tasarım desenleri:
- Klasör yapısı
- Mimari desenleri (Microservices Gateway, DI, Guards, vb.)
- Ana bileşenler ve ilişkileri
- Module dependencies
- Request flow örnekleri
- Architectural decisions

**Kullanım**: Kod yapısını anlamak, yeni özellik eklemek, mimari kararları anlamak.

### 4. **productContext.md**
Ürün ve kullanıcı perspektifi:
- Ürün açıklaması
- Çözülen problem
- Kullanıcı deneyimi hedefleri
- Desteklenen endpoints
- Response format
- Konfigürasyon seçenekleri
- Performance targets
- Future enhancements

**Kullanım**: Ürün hakkında bilgi, API kullanımı, feature planning.

### 5. **progress.md**
Proje ilerleme ve durum:
- Tamamlanmış özellikler ✅
- Devam eden işler 🔄
- Eksik/planlanmış işler 📋
- Bug fixes ve issues
- Code quality metrics
- Deployment status
- Version history
- Next steps

**Kullanım**: Proje durumunu takip etmek, yapılacak işleri görmek, tamamlanmış özellikleri kontrol etmek.

### 6. **activeContext.md**
Aktif çalışma alanı ve geliştirme bilgileri:
- Son commit mesajları
- Son değişiklikler özeti
- Aktif çalışma alanı durumu
- Proje durumu
- Yapılması gereken işler (Immediate)
- Geliştirme ipuçları
- Bağımlılıklar ve entegrasyonlar
- Performance metrics
- Security checklist
- Known limitations
- Useful commands

**Kullanım**: Günlük geliştirme, debugging, komutlar, son değişiklikleri takip etmek.

## 🚀 Hızlı Başlangıç

### Proje Hakkında Bilgi Almak
1. **projectbrief.md** → Proje amacı ve hedefleri
2. **productContext.md** → Ürün özellikleri ve API

### Geliştirme Ortamını Kurmak
1. **techContext.md** → Teknoloji ve setup
2. **activeContext.md** → Komutlar ve ipuçları

### Kod Yazarken
1. **systemPatterns.md** → Mimarı ve yapı
2. **activeContext.md** → Debugging ve testing

### Proje Durumunu Takip Etmek
1. **progress.md** → Tamamlanmış ve yapılacak işler
2. **activeContext.md** → Aktif çalışmalar

## 📋 Önemli Bilgiler

### Proje Özellikleri
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Port**: 3000
- **API Version**: v1 (URI-based)

### Temel Modüller
- **AuthModule**: JWT authentication
- **UsersModule**: User management
- **HealthModule**: Health checks
- **MetricsModule**: Prometheus metrics
- **CacheModule**: Caching

### Önemli Endpoints
- `POST /v1/auth/login` - Login
- `POST /v1/auth/register` - Register
- `GET /v1/users/me` - Get current user
- `GET /health` - Health check
- `GET /api/docs` - Swagger UI

### Komutlar
```bash
npm run start:dev      # Development
npm run test          # Testing
npm run lint          # Linting
npm run format        # Formatting
```

## 🔗 İlişkiler

```
projectbrief.md
    ↓
    ├─→ techContext.md (Teknoloji detayları)
    ├─→ systemPatterns.md (Mimari)
    ├─→ productContext.md (Ürün)
    ├─→ progress.md (İlerleme)
    └─→ activeContext.md (Aktif çalışma)
```

## 📝 Kullanım Önerileri

### Yeni Geliştirici
1. projectbrief.md oku
2. techContext.md'de setup talimatlarını takip et
3. systemPatterns.md'de mimarıyı öğren
4. activeContext.md'de komutları öğren

### Hata Ayıklama
1. activeContext.md'de debugging ipuçlarını kontrol et
2. systemPatterns.md'de request flow'u takip et
3. progress.md'de known issues'ları kontrol et

### Yeni Özellik Ekleme
1. productContext.md'de feature requirements'ı kontrol et
2. systemPatterns.md'de nereye ekleyeceğini belirle
3. progress.md'de related tasks'ı kontrol et
4. activeContext.md'de development tips'i takip et

### Deployment
1. progress.md'de deployment status'unu kontrol et
2. techContext.md'de environment variables'ı ayarla
3. activeContext.md'de production checklist'i takip et

## 🔄 Güncelleme

Bu belgeleri güncel tutmak için:
- Yeni özellik eklendiğinde progress.md'yi güncelle
- Teknik değişiklik yapıldığında techContext.md'yi güncelle
- Mimari değişiklik yapıldığında systemPatterns.md'yi güncelle
- Aktif çalışma değiştiğinde activeContext.md'yi güncelle

## 📞 İletişim

Sorular veya öneriler için:
- GitHub Issues
- Team Discord
- Code Review Comments

---

**Last Updated**: 2024-01-15
**Version**: 1.0
**Status**: Active Development
