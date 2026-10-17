
import { modeLabel, type Challenge } from "../data/challenges";
import { Link } from "../lib/router";
import { CardsArt, LadderArt, PhoneArt, PitchArt } from "./Art";

// اختيار الرسم المناسب حسب نوع التحدي.
function Thumb({ id }: { id: Challenge["id"] }) {
  if (id === "career-legend") {
    return <LadderArt className="card__art" />;
  }

  if (id === "best-xi") {
    return <PitchArt className="card__art card__art--pitch" />;
  }

  if (id === "team-battle") {
    return <PhoneArt className="card__art card__art--phone" />;
  }

  return <CardsArt className="card__art" />;
}

// عرض بطاقة التحدي وأزرار اللعب المتاحة.
export function ChallengeCard({
  challenge,
  featured,
}: {
  challenge: Challenge;
  featured?: boolean;
}) {
  const hasFan = challenge.modes.includes("fan");
  const hasCreator = challenge.modes.includes("creator");

  return (
    <article
      className={
        featured
          ? "card challenge-card is-featured"
          : "card challenge-card"
      }
    >
      <div className="card__media">
        <Thumb id={challenge.id} />
      </div>

      <div className="card__body">
        <div className="chips">
          <span className="chip">{challenge.type}</span>
          <span className="chip chip--muted">
            {modeLabel(challenge.modes)}
          </span>
        </div>

        <h3 className="card__title">{challenge.title}</h3>

        <p className="card__text">{challenge.description}</p>

        <div className="card__actions">
          {hasFan && (
            <Link
              to={`/play/${challenge.id}`}
              className="btn btn--primary"
              aria-label={`العب تحدي ${challenge.title} بدون كاميرا`}
            >
              العب التحدي
            </Link>
          )}

          {hasCreator && (
            <Link
              to={`/create/${challenge.id}`}
              className="btn btn--ghost"
              aria-label={`صوّر تحدي ${challenge.title}`}
            >
              صوّر التحدي
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
