import Icon from "../Icon";

// On-screen driving buttons for touch screens (hidden by CSS when there's a mouse). Hold a
// button to steer / go. These are only for fingers: keyboard visitors drive with WASD or the
// arrow keys, and screen reader users can skip around with the checkpoint buttons, so the pad
// is hidden from assistive tech and out of the tab order.
function HoldButton({ name, label, onHold, className, children }) {
  const release = () => onHold(name, false);
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      className={`driveBtn ${className}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onHold(name, true);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onPointerLeave={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

export default function DriveTouchPad({ onHold }) {
  return (
    <div className="driveTouch" aria-hidden="true">
      <div className="driveTouchGroup">
        <HoldButton name="left" label="Steer left" onHold={onHold} className="driveBtn--left">
          <Icon name="chevronLeft" />
        </HoldButton>
        <HoldButton name="right" label="Steer right" onHold={onHold} className="driveBtn--right">
          <Icon name="chevronRight" />
        </HoldButton>
      </div>
      <div className="driveTouchGroup">
        <HoldButton name="down" label="Reverse" onHold={onHold} className="driveBtn--down">
          <Icon name="chevronRight" />
        </HoldButton>
        <HoldButton name="up" label="Go forward" onHold={onHold} className="driveBtn--up">
          <Icon name="chevronRight" />
        </HoldButton>
      </div>
    </div>
  );
}
