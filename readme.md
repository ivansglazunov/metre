# samovar

dev

```sh
MONGO_URL="mongodb://<login>:<password>@ds263295.mlab.com:63295/ivansglazunov" npm start -- --port 3003
```

build

```sh
rm -rf build && (meteor build --server 88.99.24.138:8446 --server-only --directory build && cd build/bundle/ && (cd programs/server && npm install) && export MONGO_URL='mongodb://<login>:<password>@ds263295.mlab.com:63295/ivansglazunov' export ROOT_URL='http://88.99.24.138:8446' && PORT=3003 node main.js)
```