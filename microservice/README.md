# Microservice de Coleta de Dados - Monitor de Energia

Microservice desenvolvido em NestJS para coleta automática de dados dos dispositivos Tuya.

## Configuração

1. Instalar dependências:
```bash
cd microservice
npm install
```

2. Configurar variáveis de ambiente (`.env`):
```env
TUYA_ACCESS_ID=seu_access_id
TUYA_ACCESS_SECRET=seu_access_secret
TUYA_ENDPOINT=https://openapi.tuyaus.com
MONGODB_URI=mongodb://192.168.3.13:27017/monitor_energia
CRON_SCHEDULE=*/5 * * * *
PORT=3002
```

3. Executar:
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Funcionalidades

- ✅ Coleta automática de dados via cron job (a cada 5 minutos)
- ✅ Integração com API Tuya
- ✅ Armazenamento no MongoDB
- ✅ Logs detalhados de execução
- ✅ Health check endpoint
- ✅ Configuração flexível via environment variables

## Endpoints

- `GET /health` - Status do serviço
- `POST /collect` - Forçar coleta manual
- `GET /stats` - Estatísticas de coleta