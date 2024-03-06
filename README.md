## run

```bash
yarn

npm start
```

## set admin account

```bash
npm run install-server
```

## develop client

```bash
docker build -t yappi
docker run --rm -it -p 4000:4000 -v $PWD:/app -w /app yappi /bin/sh

```
