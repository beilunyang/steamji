<div align="center">
  <h1 align="center">steamji | 蒸汽姬云挂卡</h1>

  <p align="center">
    一款基于 ASF 的24小时免费自动 Steam 挂卡小程序
  </p>

[![twitter](https://img.shields.io/twitter/follow/beilunyang.svg?label=beilunyang
)](https://x.com/beilunyang)
![wechat2](https://img.shields.io/badge/微信公众号-悖论的技术小屋-brightgreen?style=flat-square)
</div>

## 特性
- 支持QQ/微信小程序
- 支持 Steam 挂卡/挂时长
- 支持任务中心/硬币兑换中心/邀请送硬币等营销模块
- 支持基于企业微信机器人的消息通知
- 支持管理后台，方便数据管理

## 架构
![https://pic.otaku.ren/20240223/AQADebkxG8liwFZ9.jpg](https://pic.otaku.ren/20240223/AQADebkxG8liwFZ9.jpg)


Steamji 项目主要由三部分构造
1. 使用 Taro 开发的小程序前端（QQ/微信小程序）
2. 使用 Strapi 开发的 API 服务后端以及管理后台前端
3. 开源的 ASF 挂卡程序

## 部署
### 部署 API 服务
0. 请确保部署的目标服务器环境已安装如下组件
    1. NodeJS LTS版本（14，16）
    2. Postgres 数据库
1. 进入server目录
```bash
cd ./server
```
2. 安装依赖
```bash
npm install
```
3. 设置环境变量
```bash
cp .env.example .env
vi .env
```
4. 使用 pm2 运行 server
  ```bash
  npm i -g pm2
  pm2 start ecosystem.config.js
  ```

### 部署 ASF 服务
0. 请确保部署的目标服务器环境已安装如下组件
    1. Docker
1. 进入 server 目录
```bash
cd ./server
```
2. 将 asf 目录下的配置文件存放到服务器 `/home/asf/config`下
3. 部署 ASF
```bash
docker run -p 0.0.0.0:2222:1242 -v /home/asf/config:/app/config --name asf --pull always justarchi/archisteamfarm
```
4. 打开 Steamji 管理后台, 将新部署的 ASF 服务地址，添加到Content-Type Server下

### 部署小程序
1. 进入 miniapp 目录
```bash
cd ./miniapp
```
2. 安装依赖
```
npm install
```
3. 打开 `.\src\constants\endpoints.js`, 将 `https://exmple.com/api` 更改为你部署的 API 服务地址
4. 编译QQ小程序
```
npm run build:qq
```
5. 编译微信小程序
```
npm run build:weapp
```
6. 使用微信/QQ小程序开发者工具上传编译后的代码然后提审

## 预览图
![preview-home](https://pic.otaku.ren/20240223/AQADW7oxG8liyFZ-.jpg)

![preview-admin](https://pic.otaku.ren/20240223/AQADYroxG8liyFZ-.jpg)

## 设计稿
- 设计稿源文件存放在 figma 目录，可以使用 Figma 打开
- 在线预览地址:
https://www.figma.com/file/cjaGfDgFVzC8JujUiUKaWF/%E8%92%B8%E6%B1%BD%E5%A7%AC.%E4%BA%91%E6%8C%82%E5%8D%A1?type=design&node-id=0%3A1&mode=dev&t=jlllmERwiFBFflc0-1


## 注意
- 此项目是个人独立开发项目，由于没能盈利（项目失败），所以将源码开源
- 此项目不会进行后期维护, 建议各位 fork 后自行维护以及进行二次开发

## 赞助
<img src="https://pic.otaku.ren/20240212/AQADPrgxGwoIWFZ-.jpg" style="width: 400px;"/>
<br />
<a href="https://www.buymeacoffee.com/beilunyang" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="width: 400px;" ></a>

## License
MIT License.
