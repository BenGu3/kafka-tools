# `consumer`

### Configuration 
([config precedence](config.md#precedence-of-config-highest-to-lowest))
- `--interactive`
  - Type: Boolean
  - Prompt for missing configuration
- `--kafkaAuth`
  - Type: String
  - Type of auth to use for Kafka connection ('none' or 'IAM')
- `--kafkaHost`
  - Type: String
  - Host of Kafka instance
- `--consumerGroupId`
  - Type: String
  - ID of consumer group
- `--topic`
  - Type: String
  - Topic name

---
Fetch consumer offsets
```bash
kafka-tools consumer fetch-offsets
```
---
Reset consumer offsets
```bash
kafka-tools consumer reset-offsets
```

#### Configuration
- `--earliest`
  - Type: Boolean
  - Reset offsets to the earliest offset
- `--latest`
  - Type: Boolean
  - Reset offsets to the latest offset
- `--timestamp`
  - Type: Number
  - Reset offsets to specific timestamp. Timestamp can be any date format accepted by the [JavaScript Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#syntax)

---
