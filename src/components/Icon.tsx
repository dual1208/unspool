export function Icon({ name, size = 16 }: { name: 'arrow' | 'reset' | 'plus' | 'file' | 'terminal' | 'close' | 'check' | 'up' | 'down'; size?: number }) {
  const paths = {
    arrow: <><path d="M5 11h10M11 7l4 4-4 4" /></>,
    reset: <><path d="M17 8a7 7 0 1 0 1 6M17 3v5h-5" /></>,
    plus: <path d="M10 4v12M4 10h12" />,
    file: <><path d="M5 2h7l4 4v12H5zM12 2v5h4" /></>,
    terminal: <><path d="m3 5 5 5-5 5M11 16h6" /></>,
    close: <path d="m5 5 10 10M15 5 5 15" />,
    check: <path d="m4 10 4 4 8-8" />,
    up: <path d="m5 12 5-5 5 5" />,
    down: <path d="m5 8 5 5 5-5" />,
  }
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
