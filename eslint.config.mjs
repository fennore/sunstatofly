export default [{
    "root": true,
    "extends": [
      "eslint:recommended"
    ],
    "parserOptions": {
      "ecmaVersion": 2022,
      "sourceType": "module"
    },
    "env": {
      "browser": true
    },
    "rules": {
      "no-prototype-builtins": "off"
    },
    "ignores": [
      "dist/",
      "node_modules/*",
      "docs/*",
      "docs-src/*",
      "rollup-config.js",
      "custom-elements.json",
      "web-dev-server.config.js"
    ]
}]