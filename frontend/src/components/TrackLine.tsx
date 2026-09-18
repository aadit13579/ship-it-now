// @ts-ignore
import { MAIN_STAGES, mainIndex, isException, nextStatus } from "../stages";

const STEP = 138;
const START_X = 22;
const Y = 40;
const RADIUS = 7;
const VIEW_H = 92;
// +30 right padding so the "Cancelled" label (rightmost station, ~27px half-width) doesn't clip
const RIGHT_PAD = 30;

function reachedColor(status: string, exception: boolean) {
  if (exception) return "var(--exception)";
  if (status === "Delivered") return "var(--delivered)";
  return "var(--line)";
}

export default function TrackLine({ status, onAdvance, interactive = false }: { status: string, onAdvance: (stage: string) => void, interactive?: boolean }) {
  const currentIdx = mainIndex(status);
  const exception = isException(status);
  const upcoming = interactive ? nextStatus(status) : null;
  const width = START_X * 2 + STEP * (MAIN_STAGES.length - 1) + RIGHT_PAD;

  const color = reachedColor(status, exception);

  const stationX = (i: number) => START_X + i * STEP;

  return (
    <svg
      viewBox={`0 0 ${width} ${VIEW_H}`}
      className="w-full"
      style={{ maxWidth: width }}
      role="img"
      aria-label={`Status: ${status}`}
    >
      {/* base track */}
      <line
        x1={stationX(0)}
        y1={Y}
        x2={stationX(MAIN_STAGES.length - 1)}
        y2={Y}
        stroke="var(--track)"
        strokeWidth="2.5"
      />
      {/* traveled portion */}
      {currentIdx > 0 && (
        <line
          x1={stationX(0)}
          y1={Y}
          x2={stationX(currentIdx)}
          y2={Y}
          stroke={color}
          strokeWidth="2.5"
        />
      )}

      {/* exception spur */}
      {exception && (
        <>
          <line
            x1={stationX(currentIdx)}
            y1={Y}
            x2={stationX(currentIdx) + 40}
            y2={Y + 30}
            stroke="var(--exception)"
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />
          <circle
            cx={stationX(currentIdx) + 40}
            cy={Y + 30}
            r={RADIUS}
            fill="var(--exception)"
          />
          <text
            x={stationX(currentIdx) + 40}
            y={Y + 30 + 20}
            textAnchor="middle"
            style={{ font: "600 11px 'IBM Plex Mono', monospace", fill: "var(--exception)" }}
          >
            {status}
          </text>
        </>
      )}

      {/* stations */}
      {MAIN_STAGES.map((stage: string, i: number) => {
        const reached = i <= currentIdx && !(exception && i === currentIdx);
        const isNext = interactive && stage === upcoming && !exception;
        return (
          <g key={stage}>
            <circle
              cx={stationX(i)}
              cy={Y}
              r={isNext ? RADIUS + 2 : RADIUS}
              fill={reached ? (exception && i === currentIdx ? "var(--exception)" : color) : "var(--panel)"}
              stroke={reached ? "none" : "var(--track)"}
              strokeWidth="2.5"
              className={isNext ? "cursor-pointer track-dot-next" : ""}
              onClick={isNext ? () => onAdvance(stage) : undefined}
            />
            {isNext && (
              <circle
                cx={stationX(i)}
                cy={Y}
                r={RADIUS + 6}
                fill="none"
                stroke="var(--line)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                className="cursor-pointer"
                onClick={() => onAdvance(stage)}
              />
            )}
            <text
              x={stationX(i)}
              y={Y - 20}
              textAnchor="middle"
              style={{
                font: "500 11px 'IBM Plex Sans', sans-serif",
                fill: reached ? "var(--ink)" : "var(--ink-soft)",
              }}
            >
              {stage}
            </text>
          </g>
        );
      })}

      {/* exception resume target */}
      {exception && interactive && nextStatus(status) && (
        <circle
          cx={stationX(mainIndex(nextStatus(status)))}
          cy={Y}
          r={RADIUS + 5}
          fill="none"
          stroke="var(--exception)"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          className="cursor-pointer"
          onClick={() => onAdvance(nextStatus(status))}
        />
      )}
    </svg>
  );
}