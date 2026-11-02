export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

export function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path fill="currentColor" d="M0 2.2 6.5 1.3v6.2H0zM7.3 1.2 16 0v7.5H7.3zM0 8.3h6.5v6.3L0 13.8zM7.3 8.3H16V16l-8.7-1.2z" />
    </svg>
  );
}

export function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-2.2 0-3.5 1.9-3.5 4.4 0 1.6.4 2.6-.6 4.1C6.6 12.4 5 14.6 5 17c0 .9.2 1.6.5 2.2" />
      <path d="M12 2c2.2 0 3.5 1.9 3.5 4.4 0 1.6-.4 2.6.6 4.1 1.3 1.9 2.9 4.1 2.9 6.5 0 .9-.2 1.6-.5 2.2" />
      <path d="M8.5 20.5c1 .9 2.2 1.3 3.5 1.3s2.5-.4 3.5-1.3" />
      <circle cx="10.3" cy="6.5" r=".6" fill="currentColor" />
      <circle cx="13.7" cy="6.5" r=".6" fill="currentColor" />
      <path d="M10.6 9.2c.4.4.9.6 1.4.6s1-.2 1.4-.6" />
    </svg>
  );
}
