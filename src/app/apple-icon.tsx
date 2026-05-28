import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 35,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Bulb dome */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: '#FFFFFF',
            }}
          />
          {/* Bulb body */}
          <div
            style={{
              width: 48,
              height: 18,
              backgroundColor: '#FFFFFF',
              marginTop: -4,
            }}
          />
          {/* Socket lines */}
          <div style={{ width: 60, height: 5, backgroundColor: '#FFFFFF', borderRadius: 2, marginTop: 5 }} />
          <div style={{ width: 46, height: 5, backgroundColor: '#FFFFFF', borderRadius: 2, marginTop: 4 }} />
          <div style={{ width: 32, height: 5, backgroundColor: '#FFFFFF', borderRadius: 2, marginTop: 4 }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
