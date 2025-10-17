<!-- 4ced6a8f-3cbc-4087-8bce-22f9179765c2 00035659-bf88-4fdb-bb6b-18c2e3cce9c2 -->
# API Gateway – Uygulama Planı (Faz 1→3)

## Kapsam ve Hedef

- Faz 1: NestJS tabanı, paylaşılan JWT ile doğrulama, Core Service’e HTTP proxy (Auth + Users), Swagger, logging, hata yönetimi.
- Faz 2: RabbitMQ entegrasyonu; HTTP proxy → ClientProxy, komut/olay desenleri.
- Faz 3: Oran sınırlama, cache, circuit breaker, telemetri, health/metrics, WS, versiyonlama.

## Proje Yapısı (Faz 1)

- Dosyalar:
- `src/main.ts`
- `src/app.module.ts`
- `src/config/jwt.config.ts`
- `src/common/guards/jwt-auth.guard.ts`
- `src/common/decorators/current-user.decorator.ts`
- `src/common/interceptors/logging.interceptor.ts`
- `src/common/interceptors/transform.interceptor.ts`
- `src/common/filters/http-exception.filter.ts`
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/jwt.strategy.ts`
- `src/modules/auth/dto/login.dto.ts`
- `src/modules/auth/dto/register.dto.ts`
- `src/modules/users/users.module.ts`
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`
- `src/modules/users/dto/update-user.dto.ts`
- `src/types/user.interface.ts`
- `.env`, `.env.example`, `package.json`, `tsconfig.json`, `README.md`

## Ortam Değişkenleri

- `.env`:
- `PORT=3000`
- `JWT_SECRET=<Core ile aynı>`
- `JWT_EXPIRES_IN=15m`
- `CORE_SERVICE_URL=http://localhost:3001`
- (Faz 2) `RABBITMQ_URL`, `RABBITMQ_QUEUE_USER`

## Bağımlılıklar (Faz 1)

- `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/config`, `@nestjs/axios`, `class-validator`, `class-transformer`, `@nestjs/swagger`.

## Ana Uygulama (özet)

- `main.ts`: ValidationPipe, Swagger setup, global interceptors/filters, CORS; port `PORT` ile.
- `app.module.ts`: ConfigModule, Auth/Users modülleri, HttpModule (Core proxy için).

## JWT Doğrulama

- `src/config/jwt.config.ts`: `JWT_SECRET`, `JWT_EXPIRES_IN` Config.
- `src/modules/auth/jwt.strategy.ts`: Bearer token doğrulama; payload: `{ sub, email }` → request.user.
- `src/common/guards/jwt-auth.guard.ts`: Koruma; `@UseGuards(JwtAuthGuard)`.
- `src/common/decorators/current-user.decorator.ts`: `@CurrentUser()` için.

## Proxy Katmanı

- Auth (`auth.controller.ts`):
- `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` → `CORE_SERVICE_URL`’e HttpService ile ilet.
- Users (`users.controller.ts`, `users.service.ts`):
- `GET /users/me`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id` → HttpService proxy (JWT korumalı).

## Swagger ve Hata Yönetimi

- `@nestjs/swagger` ile temel dokümantasyon; DTO’lara class-validator.
- `http-exception.filter.ts` ile standart hata formatı; `logging.interceptor.ts`, `transform.interceptor.ts` global.

## Test Senaryoları (Faz 1)

- Core (3001) ve Gateway (3000) çalıştır; `/auth/login` akışı ve `Authorization: Bearer <token>` ile `/users/me` doğrula.

## Faz 2 – RabbitMQ’ya Geçiş

- `docker-compose.yml` ile RabbitMQ ekle (5672, 15672).
- Gateway + Core’a `@nestjs/microservices` ekle.
- Core: `user_commands` kuyruğu; `@MessagePattern` komutları, `@EventPattern` olayları.
- Gateway: `UsersService` Http yerine `ClientProxy` (`send/emit`) kullanacak; Auth akışları kararına göre HTTP bırakılabilir veya RPC’ye taşınabilir.

## Faz 3 – İleri Özellikler

- Oran sınırlandırma (IP/kullanıcı), Redis cache, circuit breaker, OpenTelemetry, `/health`, Prometheus metrics, WS bildirimleri, API versiyonlama.

## Dikkat Edilecekler

- Güvenlik: `JWT_SECRET` senkronizasyonu, parola/log sızıntısı yok, CORS.
- Performans: bağlantı havuzu, timeouts, ileride cache.
- Dağıtım: `.env` commit etme; prod’da secret store.

## Kabul Kriterleri (Faz 1)

- JWT doğrulama Gateway üzerinde bağımsız çalışır.
- Auth ve Users uçları Core’a doğru proxy’lenir.
- Swagger açılır ve DTO doğrulamaları işler.
- Temel loglama ve hata formatı tutarlı çalışır.

### To-dos

- [ ] NestJS projesini başlat ve temel bağımlılıkları yükle
- [ ] Env dosyalarını oluştur ve JWT_SECRET’i kopyala
- [ ] JWT config ve passport strategy’yi uygula
- [ ] JwtAuthGuard ve CurrentUser decorator’u ekle
- [ ] Auth controller’da login/register/refresh proxy’le
- [ ] Users controller/service ile CRUD proxy’si yaz
- [ ] Swagger ve global ValidationPipe’ı ekle
- [ ] Logging ve HTTP exception filter’ı uygula
- [ ] AppModule/Main global yapılandırmaları bağla
- [ ] Core ve Gateway’i aç ve akışları test et
- [ ] RabbitMQ docker-compose ve mesaj şemalarını hazırla