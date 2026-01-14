import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement> & { fit?: React.CSSProperties['objectFit'] }
) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, fit, ...rest } = props

  // приоритет выбора objectFit:
  // 1) если задан через style Ч используем его
  // 2) иначе Ч через проп fit
  // 3) иначе Ч дефолт (cover) Ч чтобы не сломать текущие места использовани€
  const styleObj = (style as React.CSSProperties) ?? {}
  const objectFitValue: React.CSSProperties['objectFit'] =
    styleObj.objectFit ?? fit ?? 'cover'

  const mergedStyle: React.CSSProperties = {
    ...styleObj,
    width: '100%',
    height: '100%',
    objectFit: objectFitValue,
    objectPosition: styleObj.objectPosition ?? 'center'
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle w-full h-full ${className ?? ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      <div className="flex items-center justify-center w-full h-full overflow-hidden">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          style={mergedStyle}
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <div
      className={`inline-block w-full h-full overflow-hidden ${className ?? ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      <img
        src={src}
        alt={alt}
        style={mergedStyle}
        {...rest}
        onError={handleError}
      />
    </div>
  )
}
