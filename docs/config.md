# `config`
(Stores config in `~/.kafka-tools`)

### Precedence of config (highest to lowest)
1. command line arguments (`kafka-tools consumer fetch-offsets --topic=my-topic`)
2. config values
3. If interactive, prompt for config
4. If non-interactive, error if missing needed config

---
### Configurable configKeys
- `kafkaHost`
- `consumerGroupId`
- `topic`

---
Set `configKey` in config
```bash
kafka-tools config set [configKey] [configValue]
```

---
Unset `configKey` in config
```bash
kafka-tools config unset [configKey]
```

---
Print config
```bash
kafka-tools config
```
---
