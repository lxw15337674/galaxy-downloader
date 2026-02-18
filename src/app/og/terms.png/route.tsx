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
                    background: 'linear-gradient(135deg, #7C2D12 0%, #431407 100%)',
                    color: '#FFF7ED',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
                    Terms of Use
                </div>
                <div style={{ marginTop: 22, fontSize: 34, color: '#FED7AA' }}>
                    Universal Media Downloader
                </div>
                <div style={{ marginTop: 18, fontSize: 28, color: '#FDBA74' }}>
                    Usage rules, limits, and legal responsibilities
                </div>
            </div>
        ),
        size
    )
}
