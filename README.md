# Monitor de Energia - Tuya Smart

Aplicação web para monitoramento de consumo de energia de dispositivos Tuya Smart, com design dark e foco mobile first.

## 🚀 Funcionalidades

- **Dashboard Principal**: Visualização em tempo real de dispositivos e consumo
- **Analytics Avançadas**: Previsões mensais, cálculos de custo e análise por dispositivo  
- **Gerenciamento de Dispositivos**: Descoberta automática, nomeação e remoção de dispositivos
- **Histórico Completo**: Dados históricos, relatórios e exportação em CSV
- **Design Responsivo**: Mobile first com tema dark moderno

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Gráficos**: Recharts
- **Integração**: Tuya Smart API
- **Ícones**: Lucide React

## ⚙️ Configuração

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd monitor_energia
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` com:
```env
# MongoDB
MONGODB_URI=mongodb://192.168.3.13:27017/energia_monitor

# Tuya API
TUYA_ENDPOINT=https://openapi.tuyaus.com
TUYA_ACCESS_KEY=your_access_key
TUYA_SECRET_KEY=your_secret_key
TUYA_APP_ACCOUNT_ID=your_app_account_id

# App
NEXT_PUBLIC_APP_NAME=Monitor de Energia
```

4. **Execute a aplicação**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📱 Interface

### Dashboard
- Cards com estatísticas em tempo real
- Gráficos de consumo histórico
- Lista de dispositivos com status

### Analytics  
- Configuração do preço do kWh
- Previsões mensais de consumo e custo
- Análise detalhada por dispositivo

### Dispositivos
- Descoberta automática de novos dispositivos
- Nomeação personalizada
- Remoção com limpeza de dados

### Histórico
- Coleta manual de dados dos dispositivos
- Visualização de dados históricos
- Exportação em CSV
- Estatísticas mensais

## 🔄 API Endpoints

- `GET/POST /api/devices` - Listar e gerenciar dispositivos
- `GET/POST /api/readings` - Leituras de energia
- `GET/PUT /api/settings` - Configurações da aplicação  
- `GET/POST /api/predictions` - Previsões mensais
- `POST /api/collect` - Coleta manual de dados
- `POST /api/devices/discover` - Descoberta de dispositivos

## 📊 Banco de Dados

### Collections MongoDB:
- `devices` - Dispositivos cadastrados
- `energy_readings` - Leituras de energia
- `monthly_predictions` - Previsões mensais
- `settings` - Configurações da aplicação

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── api/           # APIs Next.js
│   ├── globals.css    # Estilos globais
│   └── page.tsx       # Página principal
├── components/        # Componentes React
├── lib/              # Utilitários e configurações
└── types/            # Tipos TypeScript
```

## 🔧 Funcionalidades Técnicas

- **Coleta Automática**: API para coletar dados periodicamente dos dispositivos Tuya
- **Previsões Inteligentes**: Cálculos baseados no histórico de consumo
- **Exportação de Dados**: Relatórios em formato CSV
- **Design Responsivo**: Interface otimizada para mobile e desktop
- **Tema Dark**: Interface moderna com cores personalizadas

## 📈 Próximos Passos

- [ ] Coleta automática via cron jobs
- [ ] Notificações de consumo alto
- [ ] Comparação entre dispositivos
- [ ] Dashboard de administração
- [ ] Sistema de usuários

## 🎯 Uso

1. Configure suas credenciais Tuya no `.env.local`
2. Acesse a aplicação e vá para "Dispositivos"
3. Clique em "Descobrir Novos" para encontrar seus dispositivos
4. Use "Coletar Dados" no histórico para começar o monitoramento
5. Configure o preço do kWh nas Analytics para cálculos precisos

Desenvolvido com foco na experiência mobile e gestão eficiente de energia residencial! ⚡
