"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  className?: string
}

export function ProductImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes,
  priority,
  className,
}: ProductImageProps) {
  const source = src || PLACEHOLDER_IMAGE
  const [imgSrc, setImgSrc] = useState(source)

  useEffect(() => setImgSrc(source), [source])

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      // Public Blob images should load directly from their origin instead of
      // relying on Next's image optimizer to fetch them server-side.
      unoptimized={imgSrc.startsWith("https://")}
      className={cn("object-cover", className)}
      onError={() => {
        if (imgSrc !== PLACEHOLDER_IMAGE) setImgSrc(PLACEHOLDER_IMAGE)
      }}
    />
  )
}
