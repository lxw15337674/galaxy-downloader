import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outputDir = path.join('public', 'og');
const width = 1200;
const height = 630;

const cards = [
    {
        name: 'home',
        backgroundStart: '#0F172A',
        backgroundEnd: '#1E293B',
        panelFill: '#111827',
        panelStroke: '#334155',
        lines: [
            { text: 'Universal Media Downloader', x: 120, y: 230, size: 64, weight: 700, color: '#F8FAFC' },
            { text: 'Bilibili, Douyin, Xiaohongshu, TikTok', x: 120, y: 300, size: 34, weight: 400, color: '#CBD5E1' },
            { text: 'Parse links, download videos, extract MP3 audio', x: 120, y: 370, size: 28, weight: 400, color: '#94A3B8' },
        ],
    },
    {
        name: 'contact',
        backgroundStart: '#1E3A8A',
        backgroundEnd: '#172554',
        panelFill: '#172A5C',
        panelStroke: '#3B82F6',
        lines: [
            { text: 'Contact', x: 120, y: 240, size: 72, weight: 700, color: '#EFF6FF' },
            { text: 'Universal Media Downloader', x: 120, y: 320, size: 34, weight: 400, color: '#BFDBFE' },
            { text: 'Report issues, request features, and get support', x: 120, y: 390, size: 28, weight: 400, color: '#93C5FD' },
        ],
    },
    {
        name: 'privacy',
        backgroundStart: '#14532D',
        backgroundEnd: '#052E16',
        panelFill: '#064E3B',
        panelStroke: '#22C55E',
        lines: [
            { text: 'Privacy Policy', x: 120, y: 240, size: 72, weight: 700, color: '#ECFDF5' },
            { text: 'Universal Media Downloader', x: 120, y: 320, size: 34, weight: 400, color: '#BBF7D0' },
            { text: 'Data handling and user privacy commitments', x: 120, y: 390, size: 28, weight: 400, color: '#86EFAC' },
        ],
    },
    {
        name: 'terms',
        backgroundStart: '#7C2D12',
        backgroundEnd: '#431407',
        panelFill: '#7C2D12',
        panelStroke: '#FB923C',
        lines: [
            { text: 'Terms of Use', x: 120, y: 240, size: 72, weight: 700, color: '#FFF7ED' },
            { text: 'Universal Media Downloader', x: 120, y: 320, size: 34, weight: 400, color: '#FED7AA' },
            { text: 'Usage rules, limits, and legal responsibilities', x: 120, y: 390, size: 28, weight: 400, color: '#FDBA74' },
        ],
    },
];

function escapeXml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function buildCardSvg(card) {
    const linesMarkup = card.lines
        .map(
            (line) => `
  <text
    x="${line.x}"
    y="${line.y}"
    fill="${line.color}"
    font-family="Arial, sans-serif"
    font-size="${line.size}"
    font-weight="${line.weight}"
  >${escapeXml(line.text)}</text>`
        )
        .join('');

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop stop-color="${card.backgroundStart}"/>
      <stop offset="1" stop-color="${card.backgroundEnd}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="72" y="72" width="1056" height="486" rx="24" fill="${card.panelFill}" stroke="${card.panelStroke}" stroke-width="2"/>
${linesMarkup}
</svg>`;
}

async function generateOgImages() {
    fs.mkdirSync(outputDir, { recursive: true });

    for (const card of cards) {
        const outputPath = path.join(outputDir, `${card.name}.png`);
        const svg = buildCardSvg(card);

        await sharp(Buffer.from(svg))
            .png()
            .toFile(outputPath);

        console.log(`Generated ${outputPath}`);
    }
}

generateOgImages().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
