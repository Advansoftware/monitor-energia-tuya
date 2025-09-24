# Dockerfile para o microservice
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY src/ ./src/

# Build da aplicação
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm prune --production

# Expor porta
EXPOSE 3013

# Comando de execução
CMD ["npm", "run", "start:prod"]