# @pipeworx/cisa-kev

CISA [Known Exploited Vulnerabilities](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) catalog MCP — actively exploited CVEs with required-action dates. Keyless. Cached 1h in-pack.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `catalog()` — full KEV catalog (metadata + entries)
- `entry(cve_id)` — single KEV entry by CVE id
- `vendors()` — list distinct vendors with entries
- `recent(days)` — entries added in the last N days

## Data source

`https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "cisa-kev": {
      "url": "https://gateway.pipeworx.io/cisa-kev/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Cisa Kev data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
