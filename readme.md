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
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Credenciais

```bash
mkdir secrets
# Evite que os comandos fiquem no histórico do shell, desabilitando o histórico
set +o history
echo -n 'seu_dado_secreto' > ./secrets/sua_secret.txt

cat > .env << EOF
MONGO_URI=mongodb://root:example@mongo:27017/study_control?authSource=admin
JWS_ALGORITHM=HS256
JWS_SIGN_SECRET=abcd # or private key
JWS_VERIFY_SECRET=abcd # or public key
EMAIL_SMTP_HOST=mailpit
# Porta SMTP do Mailpit (NÃO é a 8025, é a 1025)
EMAIL_SMTP_PORT=1025
EMAIL_SMTP_SECURE=false
# Deixe vazio ou nem declare user/pass
EMAIL_USER=
EMAIL_PASSWORD=
EOF
# Reabilite o histórico do shell
set -o history

# Opcional, mas recomendado:
# Torne a pasta secrets acessível apenas para o root, por segurança:
sudo chown -R root:root ./secrets/
# Define as permissões para que APENAS o dono (root) possa ler os ficheiros
# Ninguém mais, nem mesmo outros utilizadores no mesmo grupo, pode ver o conteúdo.
## obs: alguns serviços não são executados como root (p.e. www-data), assim 0600 tornaria os secrets inacessíveis
sudo chmod 644 ./secrets/*.txt
```
