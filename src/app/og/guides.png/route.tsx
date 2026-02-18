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
                    background: 'linear-gradient(135deg, #0C4A6E 0%, #082F49 100%)',
                    color: '#ECFEFF',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
                    Download Guides
                </div>
                <div style={{ marginTop: 22, fontSize: 34, color: '#CFFAFE' }}>
                    Step by step media download tutorials
                </div>
                <div style={{ marginTop: 18, fontSize: 28, color: '#A5F3FC' }}>
                    Bilibili audio, Douyin no-watermark, Xiaohongshu notes
                </div>
            </div>
        ),
        size
    )
}
