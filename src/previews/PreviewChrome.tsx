interface PreviewChromeProps {
  index: string;
  name: string;
}

/** 1080p 画布角落信息：取景框感，弱透明，不抢主体 */
export function PreviewChrome({ index, name }: PreviewChromeProps) {
  return (
    <div className="pf-chrome" aria-hidden>
      <span className="tl">
        MP·{index} — {name}
      </span>
      <span className="tr">1920×1080</span>
      <span className="bl">24 FPS · PROFILE: NEUTRAL</span>
      <span className="br">
        <span className="dot" style={{ display: "inline-block", marginRight: 10 }} />
        PLAYGROUND {index}
      </span>
    </div>
  );
}
