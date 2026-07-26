type StatusTimelineStep = {
  status: string
  label: string
  completeWhen?: string[]
}

type StatusTimelineProps = {
  steps: StatusTimelineStep[]
  currentStatus: string
  ariaLabel: string
}

export function StatusTimeline({ steps, currentStatus, ariaLabel }: StatusTimelineProps) {
  const normalizedStatus = currentStatus.toUpperCase()
  const currentIndex = steps.findIndex((step) => step.status === normalizedStatus)

  return (
    <ol className="status-timeline" aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const isCurrent = step.status === normalizedStatus
        const isComplete =
          currentIndex >= 0
            ? index <= currentIndex
            : step.completeWhen?.includes(normalizedStatus) ?? false

        return (
          <li
            className={[
              'status-timeline-step',
              isComplete ? 'is-complete' : '',
              isCurrent ? 'is-current' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={step.status}
          >
            <span className="status-timeline-dot" aria-hidden="true" />
            <span>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
