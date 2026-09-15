import { useState } from 'react'
import {
  competitionBadgeUrl,
  competitionFallbackLabel,
} from '../lib/competitionBadges'

export function CompetitionBadge({
  id,
  name,
  size = 'md',
  title,
}: {
  id: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  title?: string
}) {
  const [failed, setFailed] = useState(false)
  const src = competitionBadgeUrl(id, name)
  const dim = size === 'sm' ? 18 : size === 'lg' ? 28 : 22
  const label = title ?? name

  if (!src || failed) {
    return (
      <span
        className={`competition-badge competition-badge-fallback competition-badge-${size}`}
        title={label}
        aria-label={label}
        style={{ width: dim, height: dim, fontSize: size === 'sm' ? 7 : 8 }}
      >
        {competitionFallbackLabel(name)}
      </span>
    )
  }

  return (
    <img
      className={`competition-badge competition-badge-${size}`}
      src={src}
      alt=""
      title={label}
      aria-label={label}
      width={dim}
      height={dim}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
