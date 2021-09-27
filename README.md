# Status Bot

Simple Discord bot, allowing you to automate giving or taking a role from guild members based on their custom status.

## Docker Image

```
ghcr.io/jakubmeysner/status-bot
```

# Environment Variables

- `DISCORD_TOKEN` (string) - Discord bot token
- `DISCORD_GUILD_ID` (string) - Discord guild ID
- `DISCORD_ROLE_ID` (string) - Discord role ID
- `STATUS` (string) - expected custom status
- `MODE` (`inclusive`/`start`/`exclusive`) - status check mode
