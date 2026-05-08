const fs = require("fs");
const path = require("path");

// Read current file, find the board section start/end and replace it entirely
const filePath = path.join(__dirname, "../src/app/page.tsx");
const current = fs.readFileSync(filePath, "utf8");

const boardStart = `        {/* BOARD: 1/4 left (Analyse) + 3/4 right (2x2 grid) */}`;
const boardEnd = `          </div>
        </div>
      </motion.div>`;

const startIdx = current.indexOf(boardStart);
const endIdx = current.indexOf(boardEnd, startIdx) + boardEnd.length;

if (startIdx === -1) { console.error("Board start not found"); process.exit(1); }

const newBoard = `        {/* BOARD: How it Works (left) | Analyse (center) | 3 cards (right) */}
        <div
          className="dossier-board"
          style={{
            position: "absolute",
            top: 52,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "28px 20px 18px",
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr 1fr",
            gap: 14,
          }}
        >
          {/* \u2500\u2500 COL 1: How it Works (left) \u2500\u2500 */}
          <motion.div
            onHoverStart={() => setHovered("how")}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -2 }}
            style={{
              ...cardBase,
              border: cardBorder("how"),
              padding: "22px 22px",
              cursor: "pointer",
              transition: "border-color 0.3s",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={() => router.push("/docs")}
          >
            <ScanLine active={hovered === "how"} />
            <Corners />
            <Pin />
            <p
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: ACCENT,
                textTransform: "uppercase",
                marginBottom: 12,
                opacity: 0.7,
              }}
            >
              \u2014 {t("home.procedureLabel")} \u2014 {t("nav.howItWorks")}
            </p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.25,
                marginBottom: 16,
                letterSpacing: "-0.5px",
              }}
            >
              {t("howItWorks.title")}
              <br />
              <span style={{ color: ACCENT }}>{t("howItWorks.highlight")}.</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {[
                { n: "01", title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
                { n: "02", title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
                { n: "03", title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ display: "flex", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: ACCENT,
                      letterSpacing: 2,
                      flexShrink: 0,
                      marginTop: 1,
                      fontWeight: 700,
                    }}
                  >
                    {n}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, marginBottom: 2 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 10, color: "#3a3a3a", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 10,
                letterSpacing: 2,
                color: ACCENT,
                textTransform: "uppercase",
              }}
            >
              {t("home.viewProcedure")} \u2192
            </div>
          </motion.div>

          {/* \u2500\u2500 COL 2: Analyse (center, full height) \u2500\u2500 */}
          <motion.div
            onHoverStart={() => setHovered("analyse")}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -2 }}
            style={{
              ...cardBase,
              border: cardBorder("analyse"),
              padding: "26px 22px",
              transition: "border-color 0.3s",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ScanLine active={hovered === "analyse"} />
            <Corners />
            <Pin />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg,rgba(232,160,32,0) 0%,rgba(232,160,32,0.035) 100%)",
                opacity: hovered === "analyse" ? 1 : 0,
                transition: "opacity 0.3s",
                pointerEvents: "none",
              }}
            />

            <p
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: ACCENT,
                textTransform: "uppercase",
                marginBottom: 16,
                opacity: 0.7,
              }}
            >
              \u2014 {t("home.caseFile")} {caseNumber} \u2014 Analyse
            </p>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 8,
                letterSpacing: "-0.5px",
              }}
            >
              {t("home.analyseHeading")}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#454545",
                lineHeight: 1.65,
                marginBottom: 22,
              }}
            >
              {t("home.analyseSubtitle")}
            </p>

            <form
              onSubmit={handleAnalyse}
              style={{ display: "flex", gap: 8, marginBottom: 8 }}
            >
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("videoInput.placeholder")}
                style={{
                  flex: 1,
                  background: "#080808",
                  border: "1px solid #222",
                  color: "#888",
                  fontFamily: "inherit",
                  fontSize: 12,
                  padding: "9px 12px",
                  outline: "none",
                  minWidth: 0,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = ACCENT;
                  e.target.style.color = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#222";
                  e.target.style.color = "#888";
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: ACCENT,
                  border: "none",
                  color: "#000",
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  padding: "9px 16px",
                  cursor: loading ? "wait" : "pointer",
                  textTransform: "uppercase",
                  flexShrink: 0,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "..." : t("videoInput.analyse")}
              </button>
            </form>

            <p
              style={{
                fontSize: 10,
                color: "#2e2e2e",
                letterSpacing: 1,
                marginBottom: 22,
              }}
            >
              {t("hero.trusted").toUpperCase()}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {[
                { n: "01", label: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
                { n: "02", label: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
                { n: "03", label: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
              ].map(({ n, label, desc }) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    borderLeft:
                      "2px solid " + (hovered === "analyse" ? ACCENT + "30" : "#1a1a1a"),
                    paddingLeft: 10,
                    transition: "border-color 0.3s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: ACCENT,
                      letterSpacing: 2,
                      flexShrink: 0,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    {n}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 10, color: "#333", marginTop: 2, lineHeight: 1.45 }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 18,
                right: 18,
                border: "2px solid rgba(232,160,32,0.2)",
                color: "rgba(232,160,32,0.18)",
                fontSize: 10,
                letterSpacing: 3,
                padding: "4px 10px",
                textTransform: "uppercase",
                transform: "rotate(-8deg)",
                fontWeight: 700,
                userSelect: "none",
              }}
            >
              {t("home.classified")}
            </div>
          </motion.div>

          {/* \u2500\u2500 COL 3: Clearance + Donate + Archive (right, stacked) \u2500\u2500 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Clearance Levels */}
            <motion.div
              onHoverStart={() => setHovered("pricing")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{
                ...cardBase,
                border: cardBorder("pricing"),
                padding: "22px 22px",
                cursor: "pointer",
                transition: "border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              onClick={() => router.push("/pricing")}
            >
              <ScanLine active={hovered === "pricing"} />
              <Corners />
              <Pin />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: ACCENT,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.7,
                }}
              >
                \u2014 {t("home.clearanceLabel")}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("home.clearanceTitle")}
              </h3>
              <p
                style={{
                  fontSize: 11,
                  color: "#3a3a3a",
                  marginBottom: 16,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {t("home.clearanceSubtitle")}
              </p>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[
                  { nameKey: "pricing.observer", priceKey: "pricing.observerPrice", tierKey: "free", descKey: "home.observerAnalyses" },
                  { nameKey: "pricing.analyst", priceKey: "pricing.analystPrice", tierKey: "analyst", descKey: "home.analystAnalyses" },
                  { nameKey: "pricing.veractor", priceKey: "pricing.veractorPrice", tierKey: "veractor", descKey: "home.veractorAnalyses" },
                ].map(({ nameKey, priceKey, tierKey, descKey }) => {
                  const isActive = tier === tierKey;
                  return (
                    <div
                      key={tierKey}
                      style={{
                        flex: 1,
                        border: "1px solid " + (isActive ? ACCENT : "#1e1e1e"),
                        background: isActive ? "#0d0800" : "transparent",
                        padding: "10px 8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          color: isActive ? ACCENT : "#444",
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {t(nameKey)}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: isActive ? ACCENT : "#888",
                          marginBottom: 3,
                        }}
                      >
                        {t(priceKey)}
                      </div>
                      <div style={{ fontSize: 9, color: isActive ? ACCENT + "aa" : "#2a2a2a" }}>
                        {t(descKey)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}
              >
                {t("home.viewAllPlans")} \u2192
              </div>
            </motion.div>

            {/* Donate */}
            <motion.div
              onHoverStart={() => setHovered("donate")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{
                ...cardBase,
                border: cardBorder("donate"),
                padding: "22px 22px",
                cursor: "pointer",
                transition: "border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              onClick={() => router.push("/donate")}
            >
              <ScanLine active={hovered === "donate"} />
              <Corners />
              <Pin />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: ACCENT,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.7,
                }}
              >
                \u2014 {t("home.supportLabel")}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("home.supportTitle")}
              </h3>
              <p style={{ fontSize: 11, color: "#3a3a3a", lineHeight: 1.6, flex: 1 }}>
                {t("home.supportSubtitle")}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                  margin: "14px 0",
                }}
              >
                {["\u20ac3", "\u20ac10", "\u20ac25"].map((amt) => (
                  <div
                    key={amt}
                    style={{
                      border: "1px solid #1e1e1e",
                      padding: "7px 4px",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#555",
                    }}
                  >
                    {amt}
                  </div>
                ))}
              </div>
              <div
                style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}
              >
                {t("home.donateNow")} \u2192
              </div>
            </motion.div>

            {/* Archive */}
            <motion.div
              onHoverStart={() => setHovered("history")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{
                ...cardBase,
                border: cardBorder("history"),
                padding: "22px 22px",
                cursor: "pointer",
                transition: "border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              onClick={() => router.push("/history")}
            >
              <ScanLine active={hovered === "history"} />
              <Corners />
              <Pin />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: ACCENT,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.7,
                }}
              >
                \u2014 {t("home.archiveLabel")}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("home.archiveTitle")}
              </h3>
              <p style={{ fontSize: 11, color: "#3a3a3a", marginBottom: 14, lineHeight: 1.5 }}>
                {analyses.length > 0
                  ? t("home.investigationsRecord", { count: analyses.length })
                  : t("home.archiveSubtitle")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {archiveRows.map(({ label, time }, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: i < archiveRows.length - 1 ? "1px solid #111" : "none",
                      gap: 8,
                    }}
                  >
                    {label ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#444",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </span>
                    ) : (
                      <Redacted width={100 + (i * 15) % 50} />
                    )}
                    <span style={{ fontSize: 9, color: "#2e2e2e", letterSpacing: 1, flexShrink: 0 }}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{ marginTop: 12, fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}
              >
                {t("home.openArchive")} \u2192
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>`;

const newContent = current.slice(0, startIdx) + newBoard + current.slice(endIdx);
fs.writeFileSync(filePath, newContent, "utf8");
console.log("page.tsx board section replaced successfully");
