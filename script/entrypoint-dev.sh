cd /app

echo "Prepare dev setup"
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

echo "Running dev entrypoint script"
node ./dev_tools/entrypoint-dev.js -c ./openimis-dev.json -p /frontend-packages

echo "Updating package.json"
node ./modules-config.js openimis-dev.json

echo "Install application"
yarn install

echo "Application has been updated!, will start now"
yarn start openimis-dev.json
