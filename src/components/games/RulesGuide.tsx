"use client";

interface Props {
  onClose: () => void;
}

const RULES = [
  {
    icon: "⚽",
    name: "Avspark",
    desc: "Brukes for å starte kampen og etter hvert mål. Laget som ikke scoret sparker fra midten.",
  },
  {
    icon: "🚩",
    name: "Offside",
    desc: "Du er offside hvis du er nærmere motstanderens mål enn ballen og nest siste forsvarer når ballen spilles til deg. Du kan ikke score fra offside.",
  },
  {
    icon: "🥅",
    name: "Straffespark",
    desc: "Begås det en forseelse inne i eget straffefelt, får motstanderlaget sparke rett mot keeper fra straffemerket.",
  },
  {
    icon: "🌀",
    name: "Hjørnespark",
    desc: "Når forsvarslaget sparker ballen over sin egen mållinje uten at det blir mål, får angrepslaget sparke fra hjørnet.",
  },
  {
    icon: "🤾",
    name: "Innkast",
    desc: "Når ballen går utenfor sidelinjene, kaster motstanderlaget den inn med begge hender over hodet — begge føtter i bakken.",
  },
  {
    icon: "👟",
    name: "Frispark",
    desc: "Etter en forseelse får laget som ble foulet et fritt spark. Direkte frispark kan gå rett i mål; indirekte må innom en annen spiller først.",
  },
  {
    icon: "🅿️",
    name: "Målspark",
    desc: "Når angrepslaget sparker ballen over mållinja uten at det blir mål, får keeperen sparke ut fra målfeltet.",
  },
  {
    icon: "🟨",
    name: "Gult kort",
    desc: "En advarsel. To gule kort i samme kamp = rødt.",
  },
  {
    icon: "🟥",
    name: "Rødt kort",
    desc: "Spilleren forlater banen — laget spiller videre med én mann mindre. Gis også direkte for grove forseelser.",
  },
];

export default function RulesGuide({ onClose }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg-deep)",
        display: "flex",
        flexDirection: "column",
        zIndex: 200,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 12px",
          paddingTop: "max(16px, env(safe-area-inset-top))",
          borderBottom: "1.5px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "4px 8px",
            lineHeight: 1,
          }}
          aria-label="Lukk"
        >
          ✕
        </button>
        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Fotballreglene</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Scrollable rule cards */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {RULES.map((rule) => (
          <div
            key={rule.name}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              background: "var(--color-surface)",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--card-radius)",
              padding: "14px 16px",
            }}
          >
            <span style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
              {rule.icon}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 4 }}>{rule.name}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", lineHeight: 1.45 }}>
                {rule.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
