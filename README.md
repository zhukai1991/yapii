## changelog

> wiki 有一些截图，方便查看

see `CHANGELOG.v2.md` or [wiki](https://github.com/gozeon/yapii/wiki)

## 使用

1. `git clone https://github.com/gozeon/yapii.git` or 下载项目
2. `npm install --production`
3. 修改 `config.json` 配置文件
4. `pm2 start server/app.js --name yapii`

> 这是部署方式，如果你在本地启动，直接运行`npm start` or `node server/app.js`
> 日志管理建议使用 `pm2-logrotate`

## 设置系统管理员

```bash
npm run install-server
```

## develop

[常见问题](https://github.com/gozeon/yapii/wiki/FAQ)

```bash
docker build . -t yapii
docker run --rm -it -p 4000:4000 -v $PWD:/app -w /app yapii /bin/sh
```

使用`npm start`启动`node server`，如果前端有改动，使用`npm run build-client`即可

## note

知道你们忙，所以我来了。


- yapi不维护了
- 我还挺喜欢用
- 万恶的`node_modules`，弄得js开发者跟`诈骗犯`一样 
