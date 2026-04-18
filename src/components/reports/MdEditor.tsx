'use client'

import dynamic from 'next/dynamic'

// @uiw/react-md-editor 不支援 SSR，需 dynamic import
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface Props {
  value: string
  onChange: (v: string) => void
}

export function MdEditor({ value, onChange }: Props) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        height={300}
        preview="edit"
      />
    </div>
  )
}
