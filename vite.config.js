import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dns from 'node:dns'

// --- Bypass DNS Poisoning (Trust Positif / Indonesia ISP block) ---
let apiIps = ['45.129.229.1', '45.129.229.2'];
let uploadsIps = ['45.129.229.1', '45.129.229.2'];

// Dynamic lookup via Cloudflare DNS-over-HTTPS at startup
fetch('https://cloudflare-dns.com/dns-query?name=api.mangadex.org&type=A', {
  headers: { 'accept': 'application/dns-json' }
})
  .then(res => res.json())
  .then(json => {
    if (json.Answer) {
      const resolved = json.Answer.filter(r => r.type === 1).map(r => r.data);
      if (resolved.length > 0) apiIps = resolved;
    }
  })
  .catch(() => {});

fetch('https://cloudflare-dns.com/dns-query?name=uploads.mangadex.org&type=A', {
  headers: { 'accept': 'application/dns-json' }
})
  .then(res => res.json())
  .then(json => {
    if (json.Answer) {
      const resolved = json.Answer.filter(r => r.type === 1).map(r => r.data);
      if (resolved.length > 0) uploadsIps = resolved;
    }
  })
  .catch(() => {});

const originalLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // Intercept all mangadex domains to bypass DNS poisoning
  if (hostname === 'api.mangadex.org') {
    if (options && options.all) {
      return callback(null, apiIps.map(ip => ({ address: ip, family: 4 })));
    }
    return callback(null, apiIps[0], 4);
  }

  if (hostname === 'uploads.mangadex.org' || hostname.endsWith('.mangadex.org')) {
    if (options && options.all) {
      return callback(null, uploadsIps.map(ip => ({ address: ip, family: 4 })));
    }
    return callback(null, uploadsIps[0], 4);
  }

  return originalLookup(hostname, options, callback);
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        secure: false,
      },
      '/uploads-proxy': {
        target: 'https://uploads.mangadex.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads-proxy/, ''),
        secure: false,
      },
      '/anime-proxy': {
        target: 'https://api.jikan.moe/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/anime-proxy/, ''),
        secure: false,
      },
    },
  },
})