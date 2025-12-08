## Como rodar

### 1. Para Desenvolvimento (Dia a dia)

Como o arquivo `compose.override.yml` é o padrão, você não precisa digitar nada extra. Basta rodar:

```bash
docker compose up -d
# ou para usar o recurso de watch do dev
docker compose up --watch
```

### 2. Para Produção

Em produção, dizemos explicitamente ao Docker para ignorar o override e
usar o arquivo de prod. A ordem importa (o último arquivo sobrescreve o anterior):

```bash
docker compose -f compose.yml -f compose.prod.yml up -d
```

## Credenciais

Duplique o `.env.example` e copie as credenciais e outros dados de ambiente:

```bash
cp .env.example .env
# Em produção, restrinja as permissões do .env
chmod 0600 .env
# em Produção, se você usar a estratégia de montar o arquivo,
# garanta que o Dono (Owner) do arquivo no servidor seja
# o mesmo UID do usuário que roda o processo dentro do Docker,
# ou use 0640 (dando acesso de leitura ao grupo, caso o GID coincida)
```
