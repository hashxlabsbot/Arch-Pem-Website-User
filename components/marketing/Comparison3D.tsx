'use client'

import React, { useRef, useState } from 'react'
import {
  ClipboardIcon,
  PhoneIcon,
  FileIcon,
  FolderIcon,
  StoreIcon,
  HardHatIcon,
  WalletIcon,
  BoltIcon,
  ExportIcon
} from '@/components/icons'

export default function Comparison3D() {
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const [leftTilt, setLeftTilt] = useState({ x: 0, y: 0 })
  const [rightTilt, setRightTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>,
    setTilt: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  ) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    // Calculate coordinates relative to container center
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Map tilt angles (up to 12 degrees max for safety)
    const tiltX = -(y / (rect.height / 2)) * 12
    const tiltY = (x / (rect.width / 2)) * 12

    setTilt({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = (
    setTilt: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  ) => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div className="cmp-3d-container">
      {/* LEFT COLUMN: Spreadsheet Chaos */}
      <div className="cmp-col">
        <div
          ref={leftPanelRef}
          className="perspective-panel"
          onMouseMove={(e) => handleMouseMove(e, leftPanelRef, setLeftTilt)}
          onMouseLeave={() => handleMouseLeave(setLeftTilt)}
          style={{
            transform: 'translateZ(0)',
          }}
        >
          <div
            className="scene-3d"
            style={{
              transform: `rotateX(${leftTilt.x}deg) rotateY(${leftTilt.y}deg)`,
            }}
          >
            {/* Background laser grid */}
            <div className="chaos-grid-bg" />

            {/* Laser intersection lines */}
            <div className="chaos-laser-line l1" />
            <div className="chaos-laser-line l2" />
            <div className="chaos-laser-line l3" />

            {/* Excel Card */}
            <div className="chaos-card cc-excel">
              <div className="cc-header">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D6F42', display: 'inline-block' }} />
                Excel
              </div>
              <div className="cc-body">
                <div>BOQ_Rev_v12.xlsx</div>
                <div style={{ color: '#ef4444', marginTop: 2 }}>#VALUE! (Cell F42)</div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="chaos-card cc-whatsapp">
              <div className="cc-header">
                <PhoneIcon size={12} color="#25D366" />
                WhatsApp
              </div>
              <div className="cc-body-chat">
                <div className="chat-msg">Labor wages sent?</div>
                <div className="chat-msg self">Check bill pdf...</div>
              </div>
            </div>

            {/* Tally Card */}
            <div className="chaos-card cc-tally">
              <div className="cc-header">
                <ExportIcon size={12} color="#3b82f6" />
                Tally CSV
              </div>
              <div className="cc-body">
                <div>Shree Cement Ltd</div>
                <div style={{ color: '#fbbf24' }}>Pending CA handoff</div>
              </div>
            </div>

            {/* Paper Bills */}
            <div className="chaos-card cc-paper">
              <div className="cc-header">
                <FileIcon size={12} color="#f59e0b" />
                Paper Bills
              </div>
              <div className="cc-body">
                <div>Cash Bill #104</div>
                <div>₹82,400 (untracked)</div>
              </div>
            </div>

            {/* PDF Files */}
            <div className="chaos-card cc-pdf">
              <div className="cc-header">
                <FolderIcon size={12} color="#e24c4b" />
                PDF Invoice
              </div>
              <div className="cc-body">
                <div>Steel_Dec_Final.pdf</div>
                <div>Awaiting validation</div>
              </div>
            </div>

            {/* Registers */}
            <div className="chaos-card cc-register">
              <div className="cc-header">
                <ClipboardIcon size={12} color="#854d0e" />
                Registers
              </div>
              <div className="cc-body">
                <div>Labour attendance</div>
                <div>18 present · 3 overtime</div>
              </div>
            </div>
          </div>
        </div>
        <div className="cmp-label-block">
          <h3>Different Software for every use case</h3>
          <p>NEVER ENDING SPREADSHEET CHAOS</p>
        </div>
      </div>

      {/* MIDDLE: Transition Arrow */}
      <div className="cmp-arrow-3d">
        <svg viewBox="0 0 64 44" fill="none">
          <path d="M2 4 L22 22 L2 40" stroke="rgba(99,102,241,0.22)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 4 L40 22 L20 40" stroke="rgba(99,102,241,0.45)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M38 4 L58 22 L38 40" stroke="#818cf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* RIGHT COLUMN: Everything on ARC PEM */}
      <div className="cmp-col">
        <div
          ref={rightPanelRef}
          className="perspective-panel"
          onMouseMove={(e) => handleMouseMove(e, rightPanelRef, setRightTilt)}
          onMouseLeave={() => handleMouseLeave(setRightTilt)}
          style={{
            transform: 'translateZ(0)',
          }}
        >
          <div
            className="scene-3d"
            style={{
              transform: `rotateX(${rightTilt.x}deg) rotateY(${rightTilt.y}deg)`,
            }}
          >
            {/* Background unified grid */}
            <div className="gyro-grid-bg" />

            {/* Rotating rings */}
            <div className="gyro-orbit-ring r1" />
            <div className="gyro-orbit-ring r2" />
            <div className="gyro-orbit-ring r3" />

            {/* Curved text ring */}
            <div className="gyro-ring-text-container">
              <svg viewBox="0 0 360 360" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <path id="gyroRingPathText" d="M180,180 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0" />
                </defs>
                <text>
                  <textPath href="#gyroRingPathText" startOffset="0%" className="gyro-ring-text-path">
                    • SMART EXPENSE MANAGEMENT • AUTO TALLY EXPORT • OFFLINE FIRST SYNC
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Connecting laser beams */}
            <div className="gyro-beam b-top" />
            <div className="gyro-beam b-left" />
            <div className="gyro-beam b-right" />
            <div className="gyro-beam b-bottom" />

            {/* Central Core */}
            <div className="gyro-core-wrap" style={{ top: 'calc(50% - 60px)', left: 'calc(50% - 60px)' }}>
              <div className="gyro-core">
                <div className="gyro-core-icon">
                  <BoltIcon size={34} color="white" />
                </div>
                <div className="gyro-core-name">Arch PEM</div>
              </div>
            </div>

            {/* Modules orbiting */}
            <div className="gyro-card gc-top">
              <div className="gyro-card-icon">
                <ClipboardIcon size={20} color="white" />
              </div>
              <div className="gyro-card-label">BOQ &<br />Budget</div>
            </div>

            <div className="gyro-card gc-left">
              <div className="gyro-card-icon">
                <StoreIcon size={20} color="white" />
              </div>
              <div className="gyro-card-label">Vendor<br />Tracking</div>
            </div>

            <div className="gyro-card gc-right">
              <div className="gyro-card-icon">
                <HardHatIcon size={20} color="white" />
              </div>
              <div className="gyro-card-label">Labour<br />Tracking</div>
            </div>

            <div className="gyro-card gc-bottom">
              <div className="gyro-card-icon">
                <WalletIcon size={20} color="white" />
              </div>
              <div className="gyro-card-label">Finance<br />Control</div>
            </div>
          </div>
        </div>
        <div className="cmp-label-block">
          <h3>Everything on ARC PEM</h3>
          <p>ALL SET IN UNDER 15 MINUTES</p>
        </div>
      </div>
    </div>
  )
}
