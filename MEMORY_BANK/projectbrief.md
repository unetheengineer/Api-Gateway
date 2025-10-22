# Project Brief

## Proje Adı
**API Gateway** - Microservices Mimarisi için Merkezi API Kapısı

## Proje Amacı
Microservices mimarisinde birden fazla backend servisi arasında merkezi bir giriş noktası sağlamak. Tüm istemci isteklerini yönetmek, kimlik doğrulama, yetkilendirme, rate limiting ve request/response transformasyonlarını gerçekleştirmek.

## Ana Hedefler
- **Merkezi Kimlik Doğrulama**: JWT ve OAuth (Google & GitHub) desteği
- **Rate Limiting**: İstek sayısını kontrol etme (100 requests/60s varsayılan)
- **Request Validation**: Gelen verilerin doğrulanması
- **Response Compression**: Gzip ile yanıt sıkıştırma
- **Request Tracking**: X-Request-ID ile istek takibi
- **Health Monitoring**: Sistem sağlık kontrolleri
- **Centralized Error Handling**: Merkezi hata yönetimi
- **API Documentation**: Swagger/OpenAPI dokümantasyonu

## Temel Gereksinimler
- Node.js runtime ortamı
- NestJS framework (v11.0.1)
- JWT token yönetimi
- HTTP proxy/routing yetenekleri
- Cache management (Cache Manager v7.2.4)
- Circuit breaker pattern desteği
- Prometheus metrics
- RabbitMQ entegrasyonu (hazırlanmış)
- TypeScript strict mode

## Teknoloji Stack
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Runtime**: Node.js (v22.10.7 type definitions)
- **Authentication**: JWT, Passport.js
- **HTTP Client**: Axios via @nestjs/axios
- **Caching**: Cache Manager
- **Monitoring**: Prometheus (@willsoto/nestjs-prometheus)
- **Rate Limiting**: @nestjs/throttler
- **Circuit Breaker**: Opossum
- **Documentation**: Swagger/OpenAPI

## Geliştirme Ortamı
- **Package Manager**: npm
- **Test Framework**: Jest
- **Linter**: ESLint 9.18.0
- **Code Formatter**: Prettier 3.4.2
- **Build Tool**: NestJS CLI
- **Port**: 3000 (varsayılan)
