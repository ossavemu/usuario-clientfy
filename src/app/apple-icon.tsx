import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 30,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FF00FF',
          fontWeight: 900,
          fontFamily: 'Arial Black',
          textShadow: '0 0 1px #FF00FF',
        }}
      >
        C
      </div>
    ),
    size,
  );
}
