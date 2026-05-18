interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * CISA KEV MCP.
 */


const URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const UA = 'pipeworx-mcp-cisa-kev/1.0 (+https://pipeworx.io)';
const TTL_MS = 60 * 60 * 1000;

type Entry = {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse?: string;
  notes?: string;
  cwes?: string[];
};

let CACHE: { at: number; catalog: { title?: string; catalogVersion?: string; dateReleased?: string; count?: number; vulnerabilities: Entry[] } } | null = null;

const tools: McpToolExport['tools'] = [
  { name: 'catalog', description: 'Full KEV catalog (metadata + entries).', inputSchema: { type: 'object', properties: {} } },
  { name: 'entry', description: 'Single KEV entry by CVE id.', inputSchema: { type: 'object', properties: { cve_id: { type: 'string' } }, required: ['cve_id'] } },
  { name: 'vendors', description: 'Distinct vendors with entries.', inputSchema: { type: 'object', properties: {} } },
  { name: 'recent', description: 'Entries added in the last N days.', inputSchema: { type: 'object', properties: { days: { type: 'number', description: '1-365 (default 30)' } } } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const data = await load();
  switch (name) {
    case 'catalog':
      return data;
    case 'entry': {
      const cve = reqStr(args, 'cve_id', '"CVE-2022-22965"');
      const hit = data.vulnerabilities.find((e) => e.cveID === cve);
      return hit ?? null;
    }
    case 'vendors': {
      const counts: Record<string, number> = {};
      for (const e of data.vulnerabilities) counts[e.vendorProject] = (counts[e.vendorProject] ?? 0) + 1;
      const list = Object.entries(counts).map(([vendor, count]) => ({ vendor, count })).sort((a, b) => b.count - a.count);
      return { total_vendors: list.length, vendors: list };
    }
    case 'recent': {
      const days = Math.min(365, Math.max(1, (args.days as number) ?? 30));
      const cutoff = Date.now() - days * 86400_000;
      const filtered = data.vulnerabilities.filter((e) => Date.parse(e.dateAdded) >= cutoff);
      return { days, count: filtered.length, results: filtered };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function load() {
  const now = Date.now();
  if (CACHE && now - CACHE.at < TTL_MS) return CACHE.catalog;
  const res = await fetch(URL, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`CISA KEV: ${res.status}`);
  const catalog = (await res.json()) as { vulnerabilities: Entry[] };
  CACHE = { at: now, catalog };
  return catalog;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
