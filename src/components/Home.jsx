import FollowEyeOnPNG from "./FollowEyeOnPNG";

export default function Home() {
  return (
    <section className="panel panel-bevel homeOnly" style={{ padding: 22 }}>
      <div className="nameRow">
        <div className="nameLine">
          <span className="retro-title bigName">Sam</span>
          <span className="retro-title bigName">Cruz</span>
        </div>

        <span className="retro-title bigName nameLeft">Sam</span>

        <div className="faceSlot">
          <FollowEyeOnPNG />
        </div>

        <span className="retro-title bigName nameRight">Cruz</span>
      </div>

      <div className="homeSub">
        CS @ Cornell • creative software + game dev at my core
      </div>
    </section>
  );
}