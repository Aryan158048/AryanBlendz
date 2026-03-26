// ─────────────────────────────────────────────────────────────────────────────
// POST /api/parse-schedule
//
// Accepts a multipart/form-data image upload and uses Claude's vision API
// to extract class blocks from a Rutgers-format weekly schedule screenshot.
//
// Returns:
//   { schedule: WeeklySchedule, success: true }
//   { error: string, schedule: null }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// The prompt is carefully crafted for Rutgers schedule screenshots:
//   - weekly grid, Mon–Fri columns, hourly time labels on the left
//   - colored blocks containing a time range + course title
const PARSE_PROMPT = `You are parsing a Rutgers University weekly course schedule screenshot.

Extract EVERY class block visible in this image and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

The image is a weekly calendar grid with:
- Columns for each day (Monday through Friday, sometimes Saturday/Sunday)
- Time labels on the left side in hourly increments
- Colored rectangular blocks for each class containing:
  * A time range such as "10:20 AM - 11:40 AM" or "12:10 PM - 1:30 PM"
  * A course title in uppercase (e.g. "ECONOMETRICS", "DATA CURATION & MGMT")

Common Rutgers time slots (use these as reference for grid position):
  8:30 AM – 9:50 AM   →  "08:30" / "09:50"
  10:20 AM – 11:40 AM →  "10:20" / "11:40"
  12:10 PM – 1:30 PM  →  "12:10" / "13:30"
  2:00 PM – 3:20 PM   →  "14:00" / "15:20"
  3:50 PM – 5:10 PM   →  "15:50" / "17:10"
  5:40 PM – 7:00 PM   →  "17:40" / "19:00"
  7:30 PM – 8:50 PM   →  "19:30" / "20:50"

Rules:
- Convert all times to 24-hour "HH:MM" format (e.g. 1:30 PM → "13:30")
- Include ALL 7 days in the response; use an empty array [] for days with no classes
- If you cannot read an exact time, estimate based on the block's position in the grid
- Course title should be the text inside the block; use empty string "" if unreadable

Required output format (return ONLY this JSON, nothing else):
{
  "monday":    [{"start": "10:20", "end": "11:40", "title": "COURSE NAME"}],
  "tuesday":   [],
  "wednesday": [],
  "thursday":  [],
  "friday":    [],
  "saturday":  [],
  "sunday":    []
}`

type AnthropicMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

const ALLOWED_TYPES: AnthropicMediaType[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Schedule parsing is not configured. Add ANTHROPIC_API_KEY to .env.local.' },
      { status: 503 },
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // 10 MB limit — Rutgers schedule screenshots are typically < 2 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 10 MB)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type as AnthropicMediaType)) {
      return NextResponse.json(
        { error: 'Unsupported image type. Please use JPEG, PNG, or WebP.' },
        { status: 400 },
      )
    }

    // Convert file to base64 for the Anthropic API
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = file.type as AnthropicMediaType

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: PARSE_PROMPT },
          ],
        },
      ],
    })

    const rawText = (response.content[0] as { type: 'text'; text: string }).text.trim()

    // Extract the JSON object — handles cases where model adds extra text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Model returned no parseable JSON')
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    // Normalize: ensure all 7 days present, each block has id/start/end/title
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const schedule: Record<string, Array<{ id: string; start: string; end: string; title: string }>> = {}

    for (const day of days) {
      const raw = Array.isArray(parsed[day]) ? (parsed[day] as Record<string, unknown>[]) : []
      schedule[day] = raw
        .filter(b => typeof b.start === 'string' && typeof b.end === 'string')
        .map((b, i) => ({
          id: `${day}-${i}-${Date.now()}`,
          start: String(b.start).trim(),
          end: String(b.end).trim(),
          title: String(b.title ?? '').trim(),
        }))
    }

    return NextResponse.json({ schedule, success: true })
  } catch (err) {
    console.error('[parse-schedule]', err)
    return NextResponse.json(
      {
        error: 'Failed to parse the schedule image. Please try a clearer screenshot.',
        schedule: null,
      },
      { status: 500 },
    )
  }
}
