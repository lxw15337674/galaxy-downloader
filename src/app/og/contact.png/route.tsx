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
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
                    color: '#EFF6FF',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
                    Contact
                </div>
                <div style={{ marginTop: 22, fontSize: 34, color: '#BFDBFE' }}>
                    Universal Media Downloader
                </div>
                <div style={{ marginTop: 18, fontSize: 28, color: '#93C5FD' }}>
                    Report issues, request features, and get support
                </div>
            </div>
        ),
        size
    )
}
