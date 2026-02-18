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
                    background: 'linear-gradient(135deg, #14532D 0%, #052E16 100%)',
                    color: '#ECFDF5',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
                    Privacy Policy
                </div>
                <div style={{ marginTop: 22, fontSize: 34, color: '#BBF7D0' }}>
                    Universal Media Downloader
                </div>
                <div style={{ marginTop: 18, fontSize: 28, color: '#86EFAC' }}>
                    Data handling and user privacy commitments
                </div>
            </div>
        ),
        size
    )
}
