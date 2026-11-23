// Gera, a partir de vendedores.json:
//   <codigo>/index.html   página que carimba a leitura e manda para o WhatsApp do vendedor
//   qr/<codigo>-<nome>.svg e .png   o QR code para a arte do banner (SVG vetor e PNG 2048 px)
//   qr/links.csv          nome, telefone, link do QR e link do painel, para mandar junto
//
//   node tools/gerar.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import qrcode from 'qrcode-generator';
import { pagina } from './pagina.mjs';
import sharp from 'sharp';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://projetos.75lab.com.br/bv-pesados';
const D = JSON.parse(readFileSync(path.join(raiz, 'vendedores.json'), 'utf8'));

const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = (s) => semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const primeiro = (nome) => nome.trim().split(/\s+/)[0];
const fone = (f) => `(${f.slice(0, 2)}) ${f.slice(2, 7)}-${f.slice(7)}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------------------------------------------------------------- QR code
function svgDoQr(url) {
  const qr = qrcode(0, 'M');           // versão automática, correção média
  qr.addData(url);
  qr.make();
  const n = qr.getModuleCount();
  const q = 2;                          // margem em módulos (quiet zone mínima é 4; 2 + borda da arte)
  const lado = n + q * 2;
  let p = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) p += `M${c + q} ${r + q}h1v1h-1z`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" width="${lado * 20}" height="${lado * 20}" shape-rendering="crispEdges">
<rect width="${lado}" height="${lado}" fill="#fff"/>
<path d="${p}" fill="#0E1110"/>
</svg>
`;
}

// ---------------------------------------------------------------- roda
const qrDir = path.join(raiz, 'qr');
if (existsSync(qrDir)) rmSync(qrDir, { recursive: true });
mkdirSync(qrDir, { recursive: true });
const linhas = [['codigo', 'nome', 'telefone', 'link do QR code', 'painel do vendedor']];

for (const v of D.vendedores) {
  const dir = path.join(raiz, v.codigo);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), pagina(v, D));

  const url = `${base}/${v.codigo}/`;
  const nome = `${v.codigo}-${slug(v.nome)}`;
  const svg = svgDoQr(url);
  writeFileSync(path.join(qrDir, `${nome}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 300 }).resize(2048, 2048, { kernel: 'nearest' }).png().toFile(path.join(qrDir, `${nome}.png`));

  linhas.push([v.codigo, v.nome, fone(v.fone), url, `${base}/painel/?v=${v.codigo}`]);
  console.log(`${v.codigo}  ${v.nome.padEnd(34)} ${fone(v.fone)}  ${url}`);
}

writeFileSync(path.join(qrDir, 'links.csv'), linhas.map((l) => l.map((c) => `"${c}"`).join(';')).join('\r\n') + '\r\n');
console.log(`\n${D.vendedores.length} vendedores · páginas, SVG, PNG 2048 px e links.csv em qr/`);
