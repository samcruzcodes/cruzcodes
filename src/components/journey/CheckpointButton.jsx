// One checkpoint on the road: a real button (number + optional label).
//   state "current"  -> the selected stop   (aria-current="step")
//   state "reached"  -> an earlier stop     (shows a check mark, not just a color)
//   state "upcoming" -> a stop still ahead
// The accessible name is "Checkpoint 2: Learning Through Games"; the number and title are
// what you see.
export default function CheckpointButton({ item, index, state, onSelect, labelVisible = true }) {
  return (
    <button
      type="button"
      className={`checkpoint checkpoint--${state}`}
      aria-current={state === "current" ? "step" : undefined}
      onClick={() => onSelect(index)}
    >
      <span className="checkpointNum" aria-hidden="true">
        {index + 1}
      </span>
      <span className={labelVisible ? "checkpointLabel" : "visuallyHidden"}>
        <span className="visuallyHidden">Checkpoint {index + 1}: </span>
        {item.title}
        {state === "reached" && <span className="visuallyHidden"> (already visited)</span>}
      </span>
    </button>
  );
}
