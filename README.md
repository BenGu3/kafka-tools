# kafka-tools
[![npm version](https://badge.fury.io/js/@bengu3%2Fkafka-tools.svg)](https://badge.fury.io/js/@bengu3%2Fkafka-tools)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Installation 

#### Homebrew

```bash
brew tap bengu3/tap
brew install kafka-tools
```

#### NPM

```bash
npm install -g @bengu3/kafka-tools
```

## 🚀 Usage 🚀

### `config`
List config
```bash
kafka-tools config
```

Set `kafkaHost`
```bash
kafka-tools config set kafkaHost [kafkaHost]
```

### `consumer`
Fetch consumer offsets
```bash
kafka-tools consumer fetch-offsets
```

Reset consumer offsets
```bash
kafka-tools consumer reset-offsets
```
