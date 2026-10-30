import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999
    }}>
      <div style={{ width: '200px', height: '200px' }}>
        <DotLottieReact
          src="https://lottie.host/9db7454d-b1f7-4dfa-817c-78ec8ad1f2a7/R0IMmeB9kz.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
