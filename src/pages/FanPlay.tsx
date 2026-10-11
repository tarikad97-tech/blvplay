import { getChallenge } from "../data/challenges";
import { Navigate, useNavigate } from "../lib/router";
import { useMeta } from "../lib/useMeta";
import { FanBattle } from "./fan/FanBattle";
import { FanBestXI } from "./fan/FanBestXI";
import { FanRank5 } from "./fan/FanRank5";
import { LegendFrame } from "./LegendFrame";

/** Fan Mode: plays a challenge with no camera and no microphone. */
export function FanPlay({ id }: { id: string }) {
  const challenge = getChallenge(id);
  const navigate = useNavigate();
  useMeta(challenge ? `العب: ${challenge.title}` : "تحدٍّ غير موجود", "العب تحدي كرة قدم دون كاميرا.");
  if (!challenge || !challenge.modes.includes("fan")) return <Navigate to="/play" />;
  const exit = () => navigate("/play");
  switch (challenge.id) {
    case "career-legend": return <LegendFrame mode="fan" onExit={exit} />;
    case "rank-5": return <FanRank5 onExit={exit} />;
    case "team-battle": return <FanBattle onExit={exit} />;
    case "best-xi": return <FanBestXI onExit={exit} />;
  }
}
