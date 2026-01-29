import { useEffect, useRef } from 'react'

/**
 * 二维码生成 - 使用可靠的API，无需外部CDN
 */
export default function QrCode({ value }) {
  const imgRef = useRef(null)

  useEffect(() => {
    if (!value || !imgRef.current) return
    const encoded = encodeURIComponent(value)
    imgRef.current.src = 'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=' + encoded
  }, [value])

  return (
    <img
      ref={imgRef}
      alt="QR Code"
      className='w-full h-full'
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
