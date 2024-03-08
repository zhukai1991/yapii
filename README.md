## note

知道你们忙，所以我来了。


- yapi不维护了
- 我还挺喜欢用
- 万恶的`node_modules`，弄得js开发者跟`诈骗犯`一样 

## develop

```bash
docker build . -t yapii
docker run --rm -it -p 4000:4000 -v $PWD:/app -w /app yapii /bin/sh
```

## set admin account

```bash
npm run install-server
```
