import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const FILE_PATHS: Record<string, string | undefined> = {
  win: process.env.DOWNLOAD_PATH_WIN,
  mac: process.env.DOWNLOAD_PATH_MAC,
}

const REMOTE_URLS: Record<string, string | undefined> = {
  win: process.env.DOWNLOAD_URL_WIN,
  mac: process.env.DOWNLOAD_URL_MAC,
}

const FILE_NAMES: Record<string, string> = {
  win: 'ArcPEM-Setup.exe',
  mac: 'ArcPEM-Setup.dmg',
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/dashboard/downloads', req.url))
  }

  const platform = req.nextUrl.searchParams.get('platform') ?? 'win'
  const localPath = FILE_PATHS[platform]
  const remoteUrl = REMOTE_URLS[platform]

  // Serve from local file path if configured
  if (localPath) {
    const resolved = path.resolve(localPath)

    if (!fs.existsSync(resolved)) {
      return NextResponse.json(
        { error: `File not found at configured path. Contact support.` },
        { status: 503 }
      )
    }

    const stat = fs.statSync(resolved)
    const fileBuffer = fs.readFileSync(resolved)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${FILE_NAMES[platform] ?? path.basename(resolved)}"`,
        'Content-Length': String(stat.size),
        'Cache-Control': 'no-store',
      },
    })
  }

  // Fall back to remote URL redirect
  if (remoteUrl && !remoteUrl.includes('example.com')) {
    return NextResponse.redirect(remoteUrl)
  }

  return NextResponse.json(
    { error: 'Download not available yet. Contact support.' },
    { status: 503 }
  )
}
