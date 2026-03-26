'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklySchedule } from '@/lib/schedule/types'

interface Props {
  onParsed: (schedule: WeeklySchedule, imageUrl: string) => void
  onError: (message: string) => void
  loading: boolean
  setLoading: (v: boolean) => void
}

export function ScheduleUploader({ onParsed, onError, loading, setLoading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        onError('Please upload an image file (JPEG, PNG, or WebP).')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        onError('Image is too large. Max 10 MB.')
        return
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('image', file)

        const res = await fetch('/api/parse-schedule', {
          method: 'POST',
          body: formData,
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          onError(json.error ?? 'Failed to parse schedule. Try a clearer screenshot.')
          return
        }

        onParsed(json.schedule as WeeklySchedule, objectUrl)
      } catch {
        onError('Network error while parsing schedule. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [onParsed, onError, setLoading],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const clearPreview = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-[#CC0033]/70 bg-[#CC0033]/8'
            : 'border-white/15 hover:border-white/30 bg-white/3 hover:bg-white/5',
          loading && 'pointer-events-none opacity-70',
        )}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-full bg-[#CC0033]/15 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#CC0033] animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-medium">Parsing your schedule…</p>
              <p className="text-white/40 text-xs mt-0.5">Claude is reading the class blocks</p>
            </div>
          </div>
        ) : preview ? (
          <div className="relative p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Schedule preview"
              className="w-full max-h-64 object-contain rounded-xl"
            />
            <button
              onClick={(e) => { e.stopPropagation(); clearPreview() }}
              className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/60 text-white/80 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              isDragging ? 'bg-[#CC0033]/20' : 'bg-white/8',
            )}>
              {isDragging
                ? <ImageIcon className="w-7 h-7 text-[#CC0033]" />
                : <Upload className="w-7 h-7 text-white/40" />
              }
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-medium">
                {isDragging ? 'Drop to upload' : 'Drop your schedule here'}
              </p>
              <p className="text-white/35 text-xs mt-0.5">or click to browse</p>
            </div>
            <div className="flex items-center gap-1.5 text-white/20 text-xs">
              <span>JPEG · PNG · WebP</span>
              <span>·</span>
              <span>Max 10 MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Helper tip */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/4 border border-white/8">
        <div className="w-5 h-5 mt-0.5 rounded-full bg-[#CC0033]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[#CC0033] text-[10px] font-bold">R</span>
        </div>
        <div>
          <p className="text-white/60 text-xs leading-relaxed">
            Take a screenshot of your{' '}
            <span className="text-white/80">Rutgers Schedule Planner</span> or{' '}
            <span className="text-white/80">Student Schedule view</span> — the weekly grid
            layout works best. The AI will read your class times automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
