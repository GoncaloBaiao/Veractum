const fs = require("fs");
const path = require("path");

// ── 1. ADD HOME TRANSLATIONS TO ALL MESSAGE FILES ───────────────────────────

const homeTranslations = {
  en: {
    caseFile: "Case File",
    analyseHeading: "Analyse any YouTube video.",
    analyseSubtitle: "Paste a link. Our AI extracts the transcript, identifies every claim, and cross-checks with real sources.",
    classified: "Classified",
    procedureLabel: "Procedure",
    viewProcedure: "View procedure",
    clearanceLabel: "Clearance Levels",
    clearanceTitle: "Choose your clearance.",
    clearanceSubtitle: "Start free. Upgrade for more analyses, longer videos, and priority processing.",
    observerAnalyses: "1 / mo",
    analystAnalyses: "20 / mo",
    veractorAnalyses: "60 / mo",
    viewAllPlans: "View all plans",
    supportLabel: "Support",
    supportTitle: "Support the mission.",
    supportSubtitle: "Veractum fights misinformation. Independent donors keep the project alive and truth accessible to everyone.",
    donateNow: "Donate now",
    archiveLabel: "Archive",
    archiveTitle: "Your case files.",
    archiveSubtitle: "Review past investigations and track your research over time.",
    investigationsRecord: "{count} investigations on record.",
    openArchive: "Open archive",
  },
  pt: {
    caseFile: "Ficheiro",
    analyseHeading: "Analisa qualquer vídeo do YouTube.",
    analyseSubtitle: "Cola um link. A nossa IA extrai a transcrição, identifica cada afirmação e verifica com fontes reais.",
    classified: "Classificado",
    procedureLabel: "Procedimento",
    viewProcedure: "Ver procedimento",
    clearanceLabel: "Níveis de Acesso",
    clearanceTitle: "Escolhe o teu nível.",
    clearanceSubtitle: "Começa grátis. Atualiza para mais análises, vídeos mais longos e processamento prioritário.",
    observerAnalyses: "1 / mês",
    analystAnalyses: "20 / mês",
    veractorAnalyses: "60 / mês",
    viewAllPlans: "Ver todos os planos",
    supportLabel: "Apoio",
    supportTitle: "Apoia a missão.",
    supportSubtitle: "O Veractum combate a desinformação. Doadores independentes mantêm o projeto vivo e a verdade acessível a todos.",
    donateNow: "Doar agora",
    archiveLabel: "Arquivo",
    archiveTitle: "Os teus casos.",
    archiveSubtitle: "Revê investigações passadas e acompanha a tua pesquisa ao longo do tempo.",
    investigationsRecord: "{count} investigação(ões) em registo.",
    openArchive: "Abrir arquivo",
  },
  es: {
    caseFile: "Caso",
    analyseHeading: "Analiza cualquier vídeo de YouTube.",
    analyseSubtitle: "Pega un enlace. Nuestra IA extrae la transcripción, identifica cada afirmación y la verifica con fuentes reales.",
    classified: "Clasificado",
    procedureLabel: "Procedimiento",
    viewProcedure: "Ver procedimiento",
    clearanceLabel: "Niveles de Acceso",
    clearanceTitle: "Elige tu nivel.",
    clearanceSubtitle: "Empieza gratis. Actualiza para más análisis, vídeos más largos y procesamiento prioritario.",
    observerAnalyses: "1 / mes",
    analystAnalyses: "20 / mes",
    veractorAnalyses: "60 / mes",
    viewAllPlans: "Ver todos los planes",
    supportLabel: "Apoyo",
    supportTitle: "Apoya la misión.",
    supportSubtitle: "Veractum lucha contra la desinformación. Los donantes independientes mantienen el proyecto vivo y la verdad accesible para todos.",
    donateNow: "Donar ahora",
    archiveLabel: "Archivo",
    archiveTitle: "Tus casos.",
    archiveSubtitle: "Revisa investigaciones pasadas y sigue tu investigación en el tiempo.",
    investigationsRecord: "{count} investigación(es) registrada(s).",
    openArchive: "Abrir archivo",
  },
  fr: {
    caseFile: "Dossier",
    analyseHeading: "Analysez n'importe quelle vidéo YouTube.",
    analyseSubtitle: "Collez un lien. Notre IA extrait la transcription, identifie chaque affirmation et vérifie avec de vraies sources.",
    classified: "Classifié",
    procedureLabel: "Procédure",
    viewProcedure: "Voir la procédure",
    clearanceLabel: "Niveaux d'Habilitation",
    clearanceTitle: "Choisissez votre niveau.",
    clearanceSubtitle: "Commencez gratuitement. Passez à un niveau supérieur pour plus d'analyses, des vidéos plus longues et un traitement prioritaire.",
    observerAnalyses: "1 / mois",
    analystAnalyses: "20 / mois",
    veractorAnalyses: "60 / mois",
    viewAllPlans: "Voir tous les plans",
    supportLabel: "Soutien",
    supportTitle: "Soutenez la mission.",
    supportSubtitle: "Veractum combat la désinformation. Les donateurs indépendants maintiennent le projet en vie et la vérité accessible à tous.",
    donateNow: "Faire un don",
    archiveLabel: "Archive",
    archiveTitle: "Vos dossiers.",
    archiveSubtitle: "Consultez vos enquêtes passées et suivez vos recherches dans le temps.",
    investigationsRecord: "{count} enquête(s) enregistrée(s).",
    openArchive: "Ouvrir l'archive",
  },
  de: {
    caseFile: "Fall",
    analyseHeading: "Analysiere jedes YouTube-Video.",
    analyseSubtitle: "Füge einen Link ein. Unsere KI extrahiert das Transkript, identifiziert jede Aussage und überprüft sie mit echten Quellen.",
    classified: "Geheim",
    procedureLabel: "Verfahren",
    viewProcedure: "Verfahren ansehen",
    clearanceLabel: "Zugangsstufen",
    clearanceTitle: "Wähle deine Stufe.",
    clearanceSubtitle: "Starte kostenlos. Upgrade für mehr Analysen, längere Videos und Prioritätsverarbeitung.",
    observerAnalyses: "1 / Mo.",
    analystAnalyses: "20 / Mo.",
    veractorAnalyses: "60 / Mo.",
    viewAllPlans: "Alle Pläne ansehen",
    supportLabel: "Unterstützung",
    supportTitle: "Unterstütze die Mission.",
    supportSubtitle: "Veractum bekämpft Desinformation. Unabhängige Spender halten das Projekt am Leben und die Wahrheit für alle zugänglich.",
    donateNow: "Jetzt spenden",
    archiveLabel: "Archiv",
    archiveTitle: "Deine Fälle.",
    archiveSubtitle: "Überprüfe vergangene Untersuchungen und verfolge deine Forschung.",
    investigationsRecord: "{count} Untersuchung(en) im Archiv.",
    openArchive: "Archiv öffnen",
  },
  it: {
    caseFile: "Caso",
    analyseHeading: "Analizza qualsiasi video YouTube.",
    analyseSubtitle: "Incolla un link. La nostra IA estrae la trascrizione, identifica ogni affermazione e verifica con fonti reali.",
    classified: "Classificato",
    procedureLabel: "Procedura",
    viewProcedure: "Visualizza procedura",
    clearanceLabel: "Livelli di Accesso",
    clearanceTitle: "Scegli il tuo livello.",
    clearanceSubtitle: "Inizia gratis. Passa a un piano superiore per più analisi, video più lunghi ed elaborazione prioritaria.",
    observerAnalyses: "1 / mese",
    analystAnalyses: "20 / mese",
    veractorAnalyses: "60 / mese",
    viewAllPlans: "Vedi tutti i piani",
    supportLabel: "Supporto",
    supportTitle: "Sostieni la missione.",
    supportSubtitle: "Veractum combatte la disinformazione. I donatori indipendenti mantengono il progetto vivo e la verità accessibile a tutti.",
    donateNow: "Dona ora",
    archiveLabel: "Archivio",
    archiveTitle: "I tuoi casi.",
    archiveSubtitle: "Rivedi le indagini passate e monitora la tua ricerca nel tempo.",
    investigationsRecord: "{count} indagine/i registrate.",
    openArchive: "Apri archivio",
  },
  zh: {
    caseFile: "\u6848\u4ef6",
    analyseHeading: "\u5206\u6790\u4efb\u610f YouTube \u89c6\u9891\u3002",
    analyseSubtitle: "\u7c98\u8d34\u94fe\u63a5\u3002\u6211\u4eec\u7684 AI \u63d0\u53d6\u6587\u5b57\u8bb0\u5f55\uff0c\u8bc6\u522b\u6bcf\u4e2a\u58f0\u660e\uff0c\u5e76\u4e0e\u771f\u5b9e\u6765\u6e90\u8fdb\u884c\u6838\u5b9e\u3002",
    classified: "\u673a\u5bc6",
    procedureLabel: "\u7a0b\u5e8f",
    viewProcedure: "\u67e5\u770b\u7a0b\u5e8f",
    clearanceLabel: "\u6743\u9650\u7ea7\u522b",
    clearanceTitle: "\u9009\u62e9\u60a8\u7684\u6743\u9650\u3002",
    clearanceSubtitle: "\u514d\u8d39\u5f00\u59cb\u3002\u5347\u7ea7\u4ee5\u83b7\u5f97\u66f4\u591a\u5206\u6790\u3001\u66f4\u957f\u7684\u89c6\u9891\u548c\u4f18\u5148\u5904\u7406\u3002",
    observerAnalyses: "1 \u6b21 / \u6708",
    analystAnalyses: "20 \u6b21 / \u6708",
    veractorAnalyses: "60 \u6b21 / \u6708",
    viewAllPlans: "\u67e5\u770b\u6240\u6709\u8ba1\u5212",
    supportLabel: "\u652f\u6301",
    supportTitle: "\u652f\u6301\u6211\u4eec\u7684\u4f7f\u547d\u3002",
    supportSubtitle: "Veractum \u6253\u51fb\u865a\u5047\u4fe1\u606f\u3002\u72ec\u7acb\u6350\u52a9\u8005\u8ba9\u9879\u76ee\u4fdd\u6301\u6d3b\u529b\uff0c\u8ba9\u771f\u76f8\u5bf9\u6bcf\u4e2a\u4eba\u90fd\u53ef\u8bbf\u95ee\u3002",
    donateNow: "\u7acb\u5373\u6350\u6b3e",
    archiveLabel: "\u6863\u6848",
    archiveTitle: "\u60a8\u7684\u6848\u4ef6\u6587\u4ef6\u3002",
    archiveSubtitle: "\u56de\u987e\u8fc7\u53bb\u7684\u8c03\u67e5\uff0c\u968f\u65f6\u95f4\u8ffd\u8e2a\u60a8\u7684\u7814\u7a76\u3002",
    investigationsRecord: "\u5171 {count} \u9879\u8c03\u67e5\u8bb0\u5f55\u3002",
    openArchive: "\u6253\u5f00\u6863\u6848",
  },
  ja: {
    caseFile: "\u4e8b\u4ef6",
    analyseHeading: "\u3042\u3089\u3086\u308b YouTube \u52d5\u753b\u3092\u5206\u6790\u3002",
    analyseSubtitle: "\u30ea\u30f3\u30af\u3092\u8cbc\u308a\u4ed8\u3051\u3066\u304f\u3060\u3055\u3044\u3002AI \u304c\u30c8\u30e9\u30f3\u30b9\u30af\u30ea\u30d7\u30c8\u3092\u62bd\u51fa\u3057\u3001\u3059\u3079\u3066\u306e\u4e3b\u5f35\u3092\u7279\u5b9a\u3057\u3001\u5b9f\u969b\u306e\u30bd\u30fc\u30b9\u3067\u78ba\u8a8d\u3057\u307e\u3059\u3002",
    classified: "\u6a5f\u5bc6",
    procedureLabel: "\u624b\u9806",
    viewProcedure: "\u624b\u9806\u3092\u898b\u308b",
    clearanceLabel: "\u30af\u30ea\u30a2\u30e9\u30f3\u30b9\u30ec\u30d9\u30eb",
    clearanceTitle: "\u30ec\u30d9\u30eb\u3092\u9078\u629e\u3002",
    clearanceSubtitle: "\u7121\u6599\u3067\u59cb\u3081\u308b\u3002\u5206\u6790\u6570\u306e\u5897\u52a0\u3001\u3088\u308a\u9577\u3044\u52d5\u753b\u3001\u512a\u5148\u51e6\u7406\u306e\u305f\u3081\u306b\u30a2\u30c3\u30d7\u30b0\u30ec\u30fc\u30c9\u3002",
    observerAnalyses: "1 \u56de / \u6708",
    analystAnalyses: "20 \u56de / \u6708",
    veractorAnalyses: "60 \u56de / \u6708",
    viewAllPlans: "\u3059\u3079\u3066\u306e\u30d7\u30e9\u30f3\u3092\u898b\u308b",
    supportLabel: "\u30b5\u30dd\u30fc\u30c8",
    supportTitle: "\u30df\u30c3\u30b7\u30e7\u30f3\u3092\u652f\u63f4\u3002",
    supportSubtitle: "Veractum \u306f\u507d\u60c5\u5831\u3068\u6226\u3044\u307e\u3059\u3002\u72ec\u7acb\u3057\u305f\u5bc4\u4ed8\u8005\u304c\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u3092\u7dad\u6301\u3057\u3001\u771f\u5b9f\u3092\u8ab0\u3082\u304c\u30a2\u30af\u30bb\u30b9\u3067\u304d\u308b\u3088\u3046\u306b\u3057\u307e\u3059\u3002",
    donateNow: "\u4eca\u3059\u3050\u5bc4\u4ed8",
    archiveLabel: "\u30a2\u30fc\u30ab\u30a4\u30d6",
    archiveTitle: "\u3042\u306a\u305f\u306e\u4e8b\u4ef6\u30d5\u30a1\u30a4\u30eb\u3002",
    archiveSubtitle: "\u904e\u53bb\u306e\u8abf\u67fb\u3092\u78ba\u8a8d\u3057\u3001\u6642\u9593\u3092\u304b\u3051\u3066\u30ea\u30b5\u30fc\u30c1\u3092\u8ffd\u8de1\u3002",
    investigationsRecord: "{count} \u4ef6\u306e\u8abf\u67fb\u304c\u8a18\u9332\u3055\u308c\u3066\u3044\u307e\u3059\u3002",
    openArchive: "\u30a2\u30fc\u30ab\u30a4\u30d6\u3092\u958b\u304f",
  },
  ru: {
    caseFile: "\u0414\u0435\u043b\u043e",
    analyseHeading: "\u0410\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0443\u0439 \u043b\u044e\u0431\u043e\u0435 \u0432\u0438\u0434\u0435\u043e YouTube.",
    analyseSubtitle: "\u0412\u0441\u0442\u0430\u0432\u044c \u0441\u0441\u044b\u043b\u043a\u0443. \u041d\u0430\u0448 \u0418\u0418 \u0438\u0437\u0432\u043b\u0435\u043a\u0430\u0435\u0442 \u0442\u0440\u0430\u043d\u0441\u043a\u0440\u0438\u043f\u0442, \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442 \u043a\u0430\u0436\u0434\u043e\u0435 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0435\u0442 \u043f\u043e \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u043c \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0430\u043c.",
    classified: "\u0421\u0435\u043a\u0440\u0435\u0442\u043d\u043e",
    procedureLabel: "\u041f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u0430",
    viewProcedure: "\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u0443",
    clearanceLabel: "\u0423\u0440\u043e\u0432\u043d\u0438 \u0434\u043e\u043f\u0443\u0441\u043a\u0430",
    clearanceTitle: "\u0412\u044b\u0431\u0435\u0440\u0438 \u0441\u0432\u043e\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c.",
    clearanceSubtitle: "\u041d\u0430\u0447\u043d\u0438 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e. \u041e\u0431\u043d\u043e\u0432\u0438\u0441\u044c \u0434\u043b\u044f \u0431\u043e\u043b\u044c\u0448\u0435\u0433\u043e \u0447\u0438\u0441\u043b\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u043e\u0432, \u0434\u043b\u0438\u043d\u043d\u044b\u0445 \u0432\u0438\u0434\u0435\u043e \u0438 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043d\u043e\u0439 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0438.",
    observerAnalyses: "1 / \u043c\u0435\u0441",
    analystAnalyses: "20 / \u043c\u0435\u0441",
    veractorAnalyses: "60 / \u043c\u0435\u0441",
    viewAllPlans: "\u0412\u0441\u0435 \u0442\u0430\u0440\u0438\u0444\u044b",
    supportLabel: "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430",
    supportTitle: "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u0438 \u043c\u0438\u0441\u0441\u0438\u044e.",
    supportSubtitle: "Veractum \u0431\u043e\u0440\u0435\u0442\u0441\u044f \u0441 \u0434\u0435\u0437\u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u0435\u0439. \u041d\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043c\u044b\u0435 \u0436\u0435\u0440\u0442\u0432\u043e\u0432\u0430\u0442\u0435\u043b\u0438 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044e\u0442 \u043f\u0440\u043e\u0435\u043a\u0442 \u0438 \u0434\u0435\u043b\u0430\u044e\u0442 \u043f\u0440\u0430\u0432\u0434\u0443 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0439 \u0434\u043b\u044f \u0432\u0441\u0435\u0445.",
    donateNow: "\u041f\u043e\u0436\u0435\u0440\u0442\u0432\u043e\u0432\u0430\u0442\u044c",
    archiveLabel: "\u0410\u0440\u0445\u0438\u0432",
    archiveTitle: "\u0422\u0432\u043e\u0438 \u0434\u0435\u043b\u0430.",
    archiveSubtitle: "\u041f\u0440\u043e\u0441\u043c\u0430\u0442\u0440\u0438\u0432\u0430\u0439 \u043f\u0440\u043e\u0448\u043b\u044b\u0435 \u0440\u0430\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u0438 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f.",
    investigationsRecord: "{count} \u0440\u0430\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435(\u0439) \u0432 \u0437\u0430\u043f\u0438\u0441\u044f\u0445.",
    openArchive: "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0430\u0440\u0445\u0438\u0432",
  },
};

const locales = ["en", "pt", "es", "fr", "de", "it", "zh", "ja", "ru"];
for (const locale of locales) {
  const filePath = path.join(__dirname, `../messages/${locale}.json`);
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const data = JSON.parse(raw);
  data.home = homeTranslations[locale];
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Updated messages/${locale}.json`);
}

// ── 2. REWRITE PAGE.TSX WITH ALL STRINGS TRANSLATED ─────────────────────────

const page = `"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SplashScreen } from "@/components/SplashScreen";
import { LoginModal } from "@/components/LoginModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import type { AnalysisListItem } from "@/types";

const FONT: React.CSSProperties = { fontFamily: "Satoshi, system-ui, sans-serif" };
const ACCENT = "#E8A020";

function Corners() {
  const s: React.CSSProperties = {
    position: "absolute",
    width: 12,
    height: 12,
    borderColor: ACCENT,
    borderStyle: "solid",
    opacity: 0.4,
  };
  return (
    <>
      <span style={{ ...s, top: 8, left: 8, borderWidth: "1px 0 0 1px" }} />
      <span style={{ ...s, top: 8, right: 8, borderWidth: "1px 1px 0 0" }} />
      <span style={{ ...s, bottom: 8, left: 8, borderWidth: "0 0 1px 1px" }} />
      <span style={{ ...s, bottom: 8, right: 8, borderWidth: "0 1px 1px 0" }} />
    </>
  );
}

function Pin() {
  return (
    <span
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: ACCENT,
        top: -5,
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: "0 0 8px rgba(232,160,32,0.5)",
        zIndex: 2,
      }}
    />
  );
}

function ScanLine({ active }: { active: boolean }) {
  return (
    <motion.div
      initial={{ top: 0, opacity: 0 }}
      animate={active ? { top: "100%", opacity: [1, 1, 0] } : { top: 0, opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeIn" }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        background: "linear-gradient(90deg,transparent,rgba(232,160,32,0.6),transparent)",
        pointerEvents: "none",
        zIndex: 3,
      }}
    />
  );
}

function Redacted({ width }: { width: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#1e1e1e",
        borderRadius: 2,
        height: 10,
        width,
      }}
    />
  );
}

const cardBase: React.CSSProperties = {
  position: "relative",
  background: "#0f0f0f",
  border: "1px solid #1e1e1e",
  overflow: "hidden",
  ...FONT,
};

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations();

  const [mainVisible, setMainVisible] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => setMainVisible(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/analyze?history=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setAnalyses(data.data as AnalysisListItem[]);
        }
      })
      .catch(() => {});
  }, [!!session?.user]);

  const handleAnalyse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    router.push("/analysis/new?url=" + encodeURIComponent(url.trim()));
  };

  const tier = (session?.user as { tier?: string } | undefined)?.tier ?? "free";
  const tierLabel =
    tier === "veractor" ? "Veractor" : tier === "analyst" ? "Analyst" : "Observer";
  const caseNumber = String(analyses.length + 1).padStart(3, "0");
  const cardBorder = (key: string) =>
    hovered === key ? "1px solid " + ACCENT : "1px solid #1e1e1e";

  const navLinks = [
    { label: t("nav.howItWorks"), href: "/docs" },
    { label: t("nav.pricing"), href: "/pricing" },
    { label: t("nav.history"), href: "/history" },
  ];

  const archiveRows: { label: string; time: string }[] =
    analyses.length > 0
      ? analyses.slice(0, 4).map((a) => ({
          label: a.videoTitle,
          time: (() => {
            const diff = Date.now() - new Date(a.createdAt).getTime();
            const h = Math.floor(diff / 3600000);
            const d = Math.floor(diff / 86400000);
            if (h < 1) return "just now";
            if (h < 24) return h + "h ago";
            return d + "d ago";
          })(),
        }))
      : [
          { label: "", time: "2h ago" },
          { label: "", time: "1d ago" },
          { label: "", time: "3d ago" },
          { label: "", time: "5d ago" },
        ];

  return (
    <>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <SplashScreen onEnter={handleEnter} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mainVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "#0a0a0a",
          pointerEvents: mainVisible ? "all" : "none",
          ...FONT,
        }}
      >
        {/* Scanline overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />

        {/* DOSSIER NAVBAR */}
        <nav
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 52,
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 24,
            zIndex: 10,
            background: "#0a0a0a",
            ...FONT,
          }}
        >
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <Image
              src="/WizeApple.png"
              alt="Veractum logo"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
            <span
              style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}
            >
              VERACTUM
            </span>
          </Link>

          <div style={{ display: "flex", gap: 22, marginLeft: "auto" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 11,
                  color: "#555",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = ACCENT)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#555")
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <LanguageSelector />
          </div>

          {session?.user ? (
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                  fontFamily: "inherit",
                }}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={28}
                    height={28}
                    style={{ borderRadius: "50%", border: "1px solid #333" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#1a0e00",
                      border: "1px solid #3a2800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: ACCENT,
                    }}
                  >
                    {(session.user.name ?? "?")[0].toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    color: ACCENT,
                    border: "1px solid #3a2800",
                    background: "#1a0e00",
                    padding: "3px 10px",
                    textTransform: "uppercase",
                  }}
                >
                  {tierLabel}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: 220,
                      background: "#111",
                      border: "1px solid #222",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{ padding: "12px 16px", borderBottom: "1px solid #1e1e1e" }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#ddd",
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.user.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#444",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.user.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        void signOut({ callbackUrl: "/" });
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        color: "#555",
                        fontSize: 12,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#555")
                      }
                    >
                      {t("nav.signOut")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              style={{
                fontSize: 11,
                letterSpacing: 2,
                color: ACCENT,
                border: "1px solid #3a2800",
                background: "#1a0e00",
                padding: "4px 14px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t("nav.signIn")}
            </button>
          )}
        </nav>

        {/* BOARD: 1/4 left (Analyse) + 3/4 right (2x2 grid) */}
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
            gridTemplateColumns: "1fr 3fr",
            gap: 14,
          }}
        >
          {/* ── CARD 1: Analyse (left, full height) ── */}
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

          {/* ── RIGHT SECTION: 2x2 grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 14,
            }}
          >
            {/* CARD 2: How it Works \u2192 /docs */}
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

            {/* CARD 3: Clearance Levels \u2192 /pricing */}
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

            {/* CARD 4: Donate */}
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

            {/* CARD 5: History / Archive */}
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
      </motion.div>
    </>
  );
}
`;

fs.writeFileSync(path.join(__dirname, "../src/app/page.tsx"), page, "utf8");
console.log("page.tsx written OK, lines:", page.split("\n").length);
