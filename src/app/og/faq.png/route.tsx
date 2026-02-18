import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = {
    width: 1200,
    height: 630,
}

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '72px',
                    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                    color: '#F8FAFC',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
                    Video Download FAQ
                </div>
                <div style={{ marginTop: 22, fontSize: 34, color: '#CBD5E1' }}>
                    Bilibili, Douyin, Xiaohongshu
                </div>
                <div style={{ marginTop: 18, fontSize: 28, color: '#94A3B8' }}>
                    Troubleshooting and usage answers
                </div>
            </div>
        ),
        size
    )
}
