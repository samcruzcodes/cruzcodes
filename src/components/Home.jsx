import FollowEyeOnPNG from "./FollowEyeOnPNG";

export default function Home() {
  return (
    <section className="page panel panel-bevel homeOnly" aria-labelledby="home-title">
      {/* Just one h1! Flex order puts my face between the names on wide screens
          and under them on mid-size ones. */}
      <h1 id="home-title" className="nameRow retro-title" tabIndex={-1}>
        <span className="bigName nameFirst">Sam</span>{" "}
        <span className="bigName nameLast">Cruz</span>
        <span className="faceSlot">
          <FollowEyeOnPNG />
        </span>
      </h1>

      <p className="homeSub">
        Info + Cog Sci @ Cornell • creative software + game dev at my core
      </p>
    </section>
  );
}
