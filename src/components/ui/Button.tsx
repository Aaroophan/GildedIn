"use client"

import { Glow, GlowCapture } from "@codaworks/react-glow"
import Tilt from "react-parallax-tilt"

export const Button = ({
    children,
    type,
    classname,
    disabled,
    onclick,
    rounded,
    flex,
    tooltip
}: any) => {
    return (
        <GlowCapture>
            <Tilt
                tiltMaxAngleX={20}
                tiltMaxAngleY={20}
                glareEnable={false}
                perspective={1000}
                transitionSpeed={300}
                scale={1.05}
                className="inline-block p-2"
            >
                <button
                    type={type}
                    onClick={onclick}
                    disabled={disabled}
                    className={`
                        group relative ${rounded}
                        ${classname}
                        hover:shadow-sm transition-all duration-300 ease-in-out disabled:opacity-50 
                        bg-gradient-to-br from-[var(--mono-0)] via-[var(--mono-4)] to-[var(--mono-8)]
                        focus:outline-none focus:ring-1 focus:ring-[var(--mono-4)] focus:ring-offset-1 cursor-pointer
                        hover:scale-101
                    `}
                    title={tooltip ? tooltip : undefined}
                >
                    <Glow color='purple'>
                        <span className={`relative z-1 ${flex}`}>
                            {children}
                        </span>
                    </Glow>
                    <span
                        className={`
                            absolute inset-0 ${rounded}
                            bg-gradient-to-br from-[var(--mono-8)] via-[var(--mono-4)] to-[var(--mono-0)]
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300
                            pointer-events-none
                            z-0
                        `}
                    />
                </button>
            </Tilt>
        </GlowCapture>
    )
}