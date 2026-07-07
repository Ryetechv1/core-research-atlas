"use strict";

const STORAGE_KEY = "core-shapeshifting-research-atlas";
const SESSION_KEY = "core-shapeshifting-active-user";
const GOOGLE_SEARCH_BASE_URL = "https://www.google.com/search?q=";
const GOOGLE_CSE_ID = "56f7592d1993141c3";
const GOOGLE_CSE_SCRIPT_URL = `https://cse.google.com/cse.js?cx=${GOOGLE_CSE_ID}`;
const GOOGLE_CSE_PUBLIC_URL = `https://cse.google.com/cse?cx=${GOOGLE_CSE_ID}#gsc.tab=0`;
const BROWSER_DEFAULT_URL = GOOGLE_CSE_PUBLIC_URL;
const AUTO_BOT_INTERVAL_MS = 60_000;
const TEAM_CHAT_POLL_MS = 5_000;

const AUTH_USERS = [
  { username: "UserSeth", password: "User1password", role: "ADMIN" },
  { username: "UserSemaj", password: "User2password", role: "Member" },
  { username: "UserKhiimori", password: "User3password", role: "Member" },
];

const SOURCE_TYPES = [
  "Documentation",
  "PDF",
  "WebP / Image",
  "URL",
  "Archive",
  "Book / Manuscript",
  "Forum / Community",
  "Dataset",
  "Video / Transcript",
];

const PROFILE_SECTIONS = [
  "Origin and path",
  "Animal instincts and senses",
  "Spiritual practices",
  "Research responsibilities",
  "Boundaries and integration notes",
];

const INTERNAL_MODEL_GATEWAY = {
  openapi: "3.0.0",
  info: {
    title: "Internal Core System Gateway",
    version: "1.0.0",
    description:
      "Enables ChatGPT 5.5 Pro to orchestrate data flows and execute specialized backend actions.",
  },
  servers: [
    {
      url: "https://static.app/chatgpt-hosting",
      description: "Secure Enterprise Private Environment",
    },
  ],
  paths: {
    "/resource/fetch": {
      get: {
        operationId: "fetchInternalData",
        summary: "Queries core backend properties based on specific parameters",
        parameters: [
          {
            name: "target_id",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "The unique reference string of the requested internal asset",
          },
        ],
        responses: {
          200: {
            description: "Successful operation execution",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    payload: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const REFERENCE_LIBRARY = [
  {
    id: "ref-upload-wolf-grimoire-summary",
    sourceId: "src-upload-wolf-grimoire-summary",
    title: "Wolf-Shapeshifting Grimoire: Summary of Sources and Concepts",
    fileName: "2-Wolf-Shapeshifting-Grimoire_-Summary-of-Sources-and-Concepts.pdf",
    sourceType: "PDF",
    pageCount: 16,
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    role: "Background source map and source-concept summary for wolf-focused shapeshifting research.",
    backendUse: "Seed source taxonomy, topic clustering, and initial source-discovery leads.",
    handling: "Reference metadata only; do not embed long copyrighted or unverified source text in the app.",
    detectedTerms: ["wolf", "energy", "ritual", "occult", "spiritual", "transformation"],
  },
  {
    id: "ref-upload-greene-magic-shapeshifting",
    sourceId: "src-upload-greene-magic-shapeshifting",
    title: "The Magic of Shapeshifting - Rosalyn Greene",
    fileName: "3-OceanofPDF.com_The_magic_of_shapeshifting_-_Rosalyn_Greene.pdf",
    sourceType: "PDF",
    pageCount: 261,
    evidenceTier: "Secondary scholarship",
    citationStatus: "Needs verification",
    role: "Occult and esoteric shapeshifting reference for background classification only.",
    backendUse: "Provide occult terminology leads and comparative concepts while avoiding long reproduced excerpts.",
    handling: "Reference metadata only; do not embed long copyrighted or unverified source text in the app.",
    detectedTerms: ["wolf", "physical shift", "energy", "shapeshifting", "mental shift", "astral"],
  },
  {
    id: "ref-upload-erydir-core",
    sourceId: "src-upload-erydir-core",
    title: "ErydirCeisiwr Internal Mechanics Core",
    fileName: "4-ErydirCeisiwr.pdf",
    sourceType: "PDF",
    pageCount: 47,
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    role: "Global internal backend mechanics core and operational structure reference.",
    backendUse: "Drive internal routing, layered synthesis, staged review, profile-aware context, and export structure.",
    handling: "Backend-structure reference only; not used for visual styling.",
    detectedTerms: ["energy"],
  },
  {
    id: "ref-upload-learning-to-shift",
    sourceId: "src-upload-learning-to-shift",
    title: "Learning to Shift",
    fileName: "5-Learning-to-shift..pdf",
    sourceType: "PDF",
    pageCount: 30,
    evidenceTier: "Experiential claim",
    citationStatus: "Needs verification",
    role: "Experiential/background reference for shifting vocabulary, practice claims, and research prompts.",
    backendUse: "Seed practice-related source leads and profile-aware prompt scaffolds with explicit uncertainty labels.",
    handling: "Reference metadata only; do not treat practice claims as verified biological mechanisms.",
    detectedTerms: ["wolf", "energy", "mental shift", "physical shift", "phantom shift", "fox"],
  },
];

const BACKEND_CORE = {
  id: "erydir-core-mechanics",
  title: "ErydirCeisiwr Backend Mechanics Core",
  sourceReferenceId: "ref-upload-erydir-core",
  summary:
    "Internal routing and synthesis scaffold derived from the ErydirCeisiwr attachment request. It controls how prompts, profiles, source records, extraction jobs, and exports are staged inside the static build.",
  operatingMode: "Local static archive with connector-ready OpenAI, team chat, and web-extraction hooks.",
  stages: [
    "Intent intake",
    "Profile context merge",
    "Reference lookup",
    "Evidence-tier separation",
    "Mechanics synthesis",
    "Extraction queue expansion",
    "Export and review logging",
  ],
  permissions: [
    "Read local archive state",
    "Read three project profiles",
    "Read uploaded reference metadata",
    "Create local extraction jobs",
    "Generate local synthesis output",
  ],
  hardLimits: [
    "No live global-web scraping in the static build",
    "No real OpenAI model execution without a backend and secure API key",
    "No long copyrighted PDF text embedded in exported app data",
    "No biomedical claim may be upgraded beyond its evidence tier without verification",
  ],
};

const DEFAULT_PROFILES = [
  {
    username: "UserSeth",
    displayName: "Seth",
    role: "ADMIN",
    animalForm: "Wolf / Dragon research lead",
    animalSpirits: "Unassigned",
    identityStatement: "Administrator profile for setting project direction, reviewing evidence, and coordinating CORE framework growth.",
    extended: [
      "Defines the atlas structure, research policy, and verification standards.",
      "Tracks wolf and dragon instinct models as research artifacts.",
      "Maintains occult and metaphysical terminology without removing evidence labels.",
      "Owns source discipline, export packs, and future backend integrations.",
      "Profile data may be used by the local agent to tune synthesis tone and research priorities.",
    ],
  },
  {
    username: "UserSemaj",
    displayName: "Semaj",
    role: "Member",
    animalForm: "Fox / Kitsune contributor",
    animalSpirits: "Unassigned",
    identityStatement: "Contributor profile for fox, kitsune, folklore, cultural data, and phantom-shift terminology.",
    extended: [
      "Expands cultural sources and comparative folklore records.",
      "Tracks fox instincts, aura, phantom limbs, and kitsune spirit vocabulary.",
      "Flags transliteration variants and cultural context for review.",
      "Supports archive cleanup and source comparison.",
      "Profile data may guide agent summaries toward fox and kitsune research needs.",
    ],
  },
  {
    username: "UserKhiimori",
    displayName: "Khiimori",
    role: "Member",
    animalForm: "Cross-form researcher",
    animalSpirits: "Unassigned",
    identityStatement: "Contributor profile for cross-form synthesis, occult mechanics, and source recommendation review.",
    extended: [
      "Maps shared terms across wolf, fox, kitsune, and dragon traditions.",
      "Reviews energy, phantom body, animal aura, and morphogenetic-field concepts.",
      "Connects metaphysical claims to source lineage and uncertainty notes.",
      "Supports source recommendation review and cross-form interpretation.",
      "Profile data may guide agent output toward cross-form integration.",
    ],
  },
];

const SEED_DATA = {
  project: {
    name: "CORE Shapeshifting Research Atlas",
    version: "0.5.0",
    epistemicPolicy:
      "Catalog supernatural, occult, metaphysical, cultural, and speculative biological claims with explicit evidence labels. Do not treat metaphysical claims as established biomedical fact.",
    corePrompt:
      "Shapeshifting is modeled here as an interdisciplinary research construct spanning molecular, chemical, biological, physiological, psychological, metaphysical, occult, esoteric, and spiritual mechanics. The atlas stores claims under a Core Manifestation Template / Holographic Blueprint vocabulary while preserving source context and certainty level.",
    aiConnectorNote:
      "The ChatGPT 5.5 Pro console uses the uploaded Internal Core System Gateway as a local model profile. In this build it performs local synthesis from archive, profile, uploaded reference metadata, in-app browser context, team recommendations, and extraction-job state; true OpenAI model execution requires a secure backend/API connector.",
  },
  internalModel: {
    displayName: "ChatGPT 5.5 Pro Internal Core",
    status: "Local internal model profile / connector-ready",
    gateway: INTERNAL_MODEL_GATEWAY,
    gatewayOperation: "fetchInternalData",
    targetParameter: "target_id",
    providerNote:
      "OpenAI Developers can be used later for secure API-key setup and backend integration. This static file does not create or host an actual OpenAI model.",
    synthesisScope: [
      "Archive sources",
      "Queued extraction jobs",
      "Uploaded PDF reference metadata",
      "Three-user profile context",
      "In-app browser state and captured browser leads",
      "Team chat and recommendation review state",
    ],
  },
  backendCore: BACKEND_CORE,
  referenceLibrary: REFERENCE_LIBRARY,
  externalApis: {
    parallelExtract: {
      provider: "Parallel",
      localEndpoint: "/api/extract",
      upstreamEndpoint: "https://api.parallel.ai/v1/extract",
      auth: "Server-side PARALLEL_API_KEY",
      defaultUrls: ["https://www.google.com"],
      advancedSettings: { full_content: false },
      clients: ["Python REST proxy", "Parallel Python SDK compatible", "curl REST", "parallel-web TypeScript compatible"],
    },
    localWebScraper: {
      provider: "CORE Python scraper",
      localEndpoint: "/api/scrape",
      auth: "No API key; public http/https targets only",
      defaultUrls: [GOOGLE_SEARCH_BASE_URL],
      keywordMode: true,
      searchBaseUrl: GOOGLE_SEARCH_BASE_URL,
      advancedSettings: { full_content: false, include_links: true },
      safeguards: ["Blocks localhost/private/reserved IPs by default", "2 MB fetch cap", "No JavaScript execution"],
    },
    googleProgrammableSearch: {
      provider: "Google Programmable Search Engine",
      searchEngineId: GOOGLE_CSE_ID,
      scriptUrl: GOOGLE_CSE_SCRIPT_URL,
      publicUrl: GOOGLE_CSE_PUBLIC_URL,
      elements: ["gcse-searchbox", "gcse-searchresults"],
      status: "Embedded in Browser panel with external public URL fallback.",
    },
    nvidiaAIQResearch: {
      provider: "NVIDIA AI-Q Research",
      backendUrl: "http://localhost:8000",
      auth: "Configured in the AI-Q backend, not in this static app",
      status: "Optional local/self-hosted research backend",
      capabilities: [
        "Intent-routed shallow research with source citation",
        "Async deep research jobs",
        "Source registry selection across web, papers, enterprise, and knowledge layers",
      ],
    },
  },
  categories: [
    "Documents",
    "Historical Data",
    "Cultural Data",
    "Occult Data",
    "Mechanics",
    "Theoretical Concepts",
  ],
  species: ["Wolf", "Fox", "Kitsune", "Dragon", "Cross-form"],
  domains: [
    "Folklore",
    "History",
    "Occult / Esoteric",
    "Metaphysics",
    "Theoretical Biology",
    "Physiology",
    "Psychology",
  ],
  sourceTypes: SOURCE_TYPES,
  evidenceTiers: [
    "Primary text",
    "Secondary scholarship",
    "Scientific analogy",
    "Experiential claim",
    "Speculative framework",
  ],
  citationStatuses: ["Verified", "Needs verification", "Citation missing", "Compare sources"],
  keyTerms: [
    "Shapeshifting",
    "Physical Shift",
    "Mental Shift",
    "Phantom Shift",
    "Animal Aura",
    "Phantom Body",
    "Animal Instincts",
    "Animal Spirit",
    "Phantom Limbs",
    "Shifting Energy",
    "Shifting Potential",
    "Therianthropy",
    "Lycanthropy",
    "Alopecanthropy",
    "Dracanthrope",
    "Kitsune-tsuki henka",
    "Kitsune henka-tsuki",
    "Core Manifestation Template",
    "Holographic Blueprint",
    "Morphogenetic Field",
    "Morphogenesis",
    "Keylontic Sciences",
  ],
  framework: [
    {
      name: "Core Manifestation Template",
      description:
        "Project vocabulary for the organizing blueprint behind identity, body schema, symbolic form, and proposed transformation mechanics.",
    },
    {
      name: "Morphogenetic Field",
      description:
        "Use as a metaphysical or theoretical mapping layer. Scientific analogies should be separated from esoteric claims.",
    },
    {
      name: "Physiological Hypothesis",
      description:
        "Tracks energy budget, tissue remodeling, neural integration, immune tolerance, and scaling constraints as speculative barriers.",
    },
    {
      name: "Phantom / Mental Shift",
      description:
        "Separates body-schema experiences, phantom limbs, instincts, and identity states from physical transformation claims.",
    },
    {
      name: "Safety and Epistemic Notes",
      description:
        "Flags unsupported claims, medical risk, source uncertainty, and areas requiring primary-source verification.",
    },
  ],
  profiles: DEFAULT_PROFILES,
  extractionJobs: [],
  extractionResults: [],
  autoBotFindings: [],
  importedFiles: [],
  browserHistory: [],
  parallelExtractRuns: [],
  webScrapeRuns: [],
  teamMessages: [],
  agentMessages: [
    {
      role: "assistant",
      owner: "system",
      createdAt: new Date("2026-07-04T00:00:00").toISOString(),
      content:
        "Agent console initialized. I can synthesize the local archive, active user profile, and queued extraction parameters. Live internet fetching requires a backend or connector.",
    },
  ],
  sources: [
    {
      id: "src-ovid-metamorphoses",
      title: "Ovid, Metamorphoses: classical transformation narratives",
      category: "Documents",
      species: "Cross-form",
      domain: "Folklore",
      sourceType: "Book / Manuscript",
      url: "",
      evidenceTier: "Primary text",
      citationStatus: "Needs verification",
      tradition: "Greco-Roman",
      terms: ["metamorphosis", "mythic transformation", "divine agency"],
      notes:
        "Use as a baseline for literary and mythological transformation motifs. Extract animal-change structure, agency, reversibility, and moral framing.",
      coreLinks: ["Core Manifestation Template", "Morphogenetic Field"],
    },
    {
      id: "src-clinical-lycanthropy",
      title: "Clinical lycanthropy and animal-identity delusion literature",
      category: "Theoretical Concepts",
      species: "Wolf",
      domain: "Psychology",
      sourceType: "PDF",
      url: "",
      evidenceTier: "Scientific analogy",
      citationStatus: "Needs verification",
      tradition: "Modern clinical literature",
      terms: ["lycanthropy", "mental shift", "body schema", "identity state"],
      notes:
        "Compare mental shifting claims with clinical descriptions without pathologizing spiritual identity by default.",
      coreLinks: ["Phantom / Mental Shift", "Safety and Epistemic Notes"],
    },
    {
      id: "src-phantom-limbs",
      title: "Phantom limb and body-schema research lead",
      category: "Mechanics",
      species: "Cross-form",
      domain: "Physiology",
      sourceType: "Documentation",
      url: "",
      evidenceTier: "Scientific analogy",
      citationStatus: "Needs verification",
      tradition: "Neuroscience",
      terms: ["phantom limbs", "phantom body", "somatosensory map"],
      notes:
        "Use as a grounded analogy for phantom tails, wings, ears, muzzle sensations, and non-ordinary body maps.",
      coreLinks: ["Phantom / Mental Shift", "Physiological Hypothesis"],
    },
    {
      id: "src-kitsune-tsuki",
      title: "Kitsune-tsuki and fox-possession narratives",
      category: "Cultural Data",
      species: "Kitsune",
      domain: "Folklore",
      sourceType: "Archive",
      url: "",
      evidenceTier: "Secondary scholarship",
      citationStatus: "Compare sources",
      tradition: "Japanese",
      terms: ["kitsune-tsuki", "kitsune henka", "possession", "fox spirit"],
      notes:
        "Track differences between possession, illusion, disguise, and physical transformation. Preserve transliteration variants.",
      coreLinks: ["Core Manifestation Template", "Phantom / Mental Shift"],
    },
    {
      id: "src-alopecanthropy",
      title: "Alopecanthropy term file: human-fox transformation",
      category: "Theoretical Concepts",
      species: "Fox",
      domain: "Metaphysics",
      sourceType: "Documentation",
      url: "",
      evidenceTier: "Speculative framework",
      citationStatus: "Citation missing",
      tradition: "Project vocabulary",
      terms: ["alopecanthropy", "physical shift", "animal aura", "fox instincts"],
      notes:
        "Define how the project will use this term. Distinguish invented taxonomy from historical terminology.",
      coreLinks: ["Core Manifestation Template", "Safety and Epistemic Notes"],
    },
    {
      id: "src-dragon-transformation",
      title: "Dragon transformation motif map",
      category: "Cultural Data",
      species: "Dragon",
      domain: "Folklore",
      sourceType: "URL",
      url: "",
      evidenceTier: "Secondary scholarship",
      citationStatus: "Needs verification",
      tradition: "Comparative mythology",
      terms: ["dracanthrope", "dragon spirit", "wings", "scales", "breath"],
      notes:
        "Separate dragon-as-serpent, dragon-as-deity, dragon-as-guardian, and human-dragon transformation cases by culture.",
      coreLinks: ["Morphogenetic Field", "Core Manifestation Template"],
    },
    {
      id: "src-werewolf-trials",
      title: "Werewolf trial and pamphlet corpus lead",
      category: "Historical Data",
      species: "Wolf",
      domain: "History",
      sourceType: "Archive",
      url: "",
      evidenceTier: "Primary text",
      citationStatus: "Needs verification",
      tradition: "Early modern Europe",
      terms: ["lycanthropy", "witchcraft", "trial records", "wolf form"],
      notes:
        "Log trial texts, pamphlets, confessions, and legal context separately. Flag coercion and demonological framing.",
      coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
    },
    {
      id: "src-occult-glamour",
      title: "Occult glamour, astral form, and animal aura practices",
      category: "Occult Data",
      species: "Cross-form",
      domain: "Occult / Esoteric",
      sourceType: "Book / Manuscript",
      url: "",
      evidenceTier: "Experiential claim",
      citationStatus: "Citation missing",
      tradition: "Western esotericism",
      terms: ["animal aura", "astral body", "phantom body", "glamour"],
      notes:
        "Catalog claims as practices or testimonies, not verified mechanisms. Track ritual context and source lineage.",
      coreLinks: ["Morphogenetic Field", "Phantom / Mental Shift"],
    },
    {
      id: "src-morphogenesis",
      title: "Morphogenesis and regenerative biology analogy file",
      category: "Mechanics",
      species: "Cross-form",
      domain: "Theoretical Biology",
      sourceType: "PDF",
      url: "",
      evidenceTier: "Scientific analogy",
      citationStatus: "Needs verification",
      tradition: "Developmental biology",
      terms: ["morphogenesis", "regeneration", "patterning", "plasticity"],
      notes:
        "Use only as analogy for form generation and tissue patterning. Do not imply macro-scale human-animal transformation is biologically demonstrated.",
      coreLinks: ["Physiological Hypothesis", "Morphogenetic Field"],
    },
    {
      id: "src-energy-budget",
      title: "Energy budget constraint note for physical shifting",
      category: "Theoretical Concepts",
      species: "Cross-form",
      domain: "Theoretical Biology",
      sourceType: "Documentation",
      url: "",
      evidenceTier: "Speculative framework",
      citationStatus: "Citation missing",
      tradition: "Project model",
      terms: ["energy budget", "mass conservation", "tissue remodeling", "shift potential"],
      notes:
        "Constraint note for reasoning about how extreme transformation claims would face energy, heat, mass, and tissue continuity barriers.",
      coreLinks: ["Physiological Hypothesis", "Safety and Epistemic Notes"],
    },
    {
      id: "src-therianthropy-community",
      title: "Therianthropy community terminology map",
      category: "Cultural Data",
      species: "Cross-form",
      domain: "Metaphysics",
      sourceType: "Forum / Community",
      url: "",
      evidenceTier: "Experiential claim",
      citationStatus: "Compare sources",
      tradition: "Modern identity communities",
      terms: ["therianthropy", "m-shift", "phantom shift", "animal instincts"],
      notes:
        "Capture vocabulary respectfully. Separate lived identity terms from historical lycanthropy and occult spellwork.",
      coreLinks: ["Phantom / Mental Shift", "Core Manifestation Template"],
    },
    {
      id: "src-keylontic",
      title: "Keylontic Sciences and holographic blueprint vocabulary",
      category: "Occult Data",
      species: "Cross-form",
      domain: "Metaphysics",
      sourceType: "URL",
      url: "",
      evidenceTier: "Speculative framework",
      citationStatus: "Citation missing",
      tradition: "Contemporary esoteric system",
      terms: ["Keylontic Sciences", "holographic blueprint", "manifestation template"],
      notes:
        "Store as a named metaphysical system. Require source lineage, author attribution, and terminology normalization.",
      coreLinks: ["Core Manifestation Template", "Morphogenetic Field"],
    },
    {
      id: "src-upload-wolf-grimoire-summary",
      title: "Uploaded PDF: Wolf-Shapeshifting Grimoire source summary",
      category: "Documents",
      species: "Wolf",
      domain: "Occult / Esoteric",
      sourceType: "PDF",
      url: "data/reference_ingest.json#ref-upload-wolf-grimoire-summary",
      evidenceTier: "Speculative framework",
      citationStatus: "Needs verification",
      tradition: "Project-uploaded summary",
      terms: ["wolf", "energy", "ritual", "occult", "spiritual", "phantom shift"],
      notes:
        "Uploaded 16-page source summary used as a background map for wolf-focused shapeshifting concepts and source discovery. Treat as a guide requiring primary-source follow-up.",
      coreLinks: ["Core Manifestation Template", "Phantom / Mental Shift", "Safety and Epistemic Notes"],
      referenceId: "ref-upload-wolf-grimoire-summary",
    },
    {
      id: "src-upload-greene-magic-shapeshifting",
      title: "Uploaded PDF: The Magic of Shapeshifting - Rosalyn Greene",
      category: "Occult Data",
      species: "Cross-form",
      domain: "Occult / Esoteric",
      sourceType: "PDF",
      url: "data/reference_ingest.json#ref-upload-greene-magic-shapeshifting",
      evidenceTier: "Secondary scholarship",
      citationStatus: "Needs verification",
      tradition: "Modern occult shapeshifting literature",
      terms: ["shapeshifting", "physical shift", "mental shift", "astral", "animal spirit", "wolf"],
      notes:
        "Uploaded occult reference retained as metadata and high-level source lead only. Avoid embedding long excerpts; verify bibliographic provenance before quoting or redistributing.",
      coreLinks: ["Morphogenetic Field", "Phantom / Mental Shift", "Safety and Epistemic Notes"],
      referenceId: "ref-upload-greene-magic-shapeshifting",
    },
    {
      id: "src-upload-erydir-core",
      title: "Uploaded PDF: ErydirCeisiwr backend mechanics core",
      category: "Mechanics",
      species: "Cross-form",
      domain: "Metaphysics",
      sourceType: "PDF",
      url: "data/reference_ingest.json#ref-upload-erydir-core",
      evidenceTier: "Speculative framework",
      citationStatus: "Needs verification",
      tradition: "Project internal mechanics",
      terms: ["energy", "backend core", "routing", "synthesis", "mechanics"],
      notes:
        "Used as an internal operational scaffold for prompt intake, profile merging, reference lookup, evidence separation, synthesis, extraction queueing, and export logging. It is not used as visual design.",
      coreLinks: ["Core Manifestation Template", "Morphogenetic Field", "Physiological Hypothesis"],
      referenceId: "ref-upload-erydir-core",
    },
    {
      id: "src-upload-learning-to-shift",
      title: "Uploaded PDF: Learning to Shift",
      category: "Documents",
      species: "Wolf",
      domain: "Metaphysics",
      sourceType: "PDF",
      url: "data/reference_ingest.json#ref-upload-learning-to-shift",
      evidenceTier: "Experiential claim",
      citationStatus: "Needs verification",
      tradition: "Project-uploaded shifting guide",
      terms: ["wolf", "energy", "mental shift", "physical shift", "phantom shift", "fox"],
      notes:
        "Background reference for practice vocabulary and experiential claims. Keep outputs profile-aware but preserve uncertainty labels for all transformation mechanics.",
      coreLinks: ["Phantom / Mental Shift", "Core Manifestation Template", "Safety and Epistemic Notes"],
      referenceId: "ref-upload-learning-to-shift",
    },
  ],
};

const state = {
  archive: loadArchive(),
  activeCategory: "All",
  activeSpecies: "All",
  activeSourceType: "All",
  activeProfileUsername: window.localStorage.getItem(SESSION_KEY) || "UserSeth",
  currentUser: null,
  search: "",
  selectedId: null,
  currentBrowserUrl: BROWSER_DEFAULT_URL,
  importBusy: false,
  teamChatPollTimer: null,
  pendingSearchChoice: null,
  autoBot: {
    active: false,
    timer: null,
    sectionIndex: 0,
    attempts: 0,
    pausedForReview: false,
    feedback: "",
    lastRunAt: "",
    currentFinding: null,
  },
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  wireEvents();
  populateFormOptions();
  renderSourceTypeCheckboxes(els.extractionSourceTypes, "extract", ["Documentation", "PDF", "URL", "Archive"]);
  renderSourceTypeCheckboxes(els.agentSourceTypes, "agent", ["Documentation", "PDF", "URL", "Archive", "Forum / Community"]);
  initAuth();
  render();
  startTeamChatPolling();
});

function cacheElements() {
  els.authOverlay = document.getElementById("authOverlay");
  els.authForm = document.getElementById("authForm");
  els.authError = document.getElementById("authError");
  els.currentUserBadge = document.getElementById("currentUserBadge");
  els.signOutButton = document.getElementById("signOutButton");
  els.categoryNav = document.getElementById("categoryNav");
  els.speciesFilters = document.getElementById("speciesFilters");
  els.sourceTypeFilter = document.getElementById("sourceTypeFilter");
  els.sourceList = document.getElementById("sourceList");
  els.sourceCount = document.getElementById("sourceCount");
  els.verifiedCount = document.getElementById("verifiedCount");
  els.theoryCount = document.getElementById("theoryCount");
  els.searchInput = document.getElementById("searchInput");
  els.selectedMeta = document.getElementById("selectedMeta");
  els.selectedRecord = document.getElementById("selectedRecord");
  els.frameworkList = document.getElementById("frameworkList");
  els.sourceRowTemplate = document.getElementById("sourceRowTemplate");
  els.addSourceForm = document.getElementById("addSourceForm");
  els.toggleAddFormButton = document.getElementById("toggleAddFormButton");
  els.cancelAddButton = document.getElementById("cancelAddButton");
  els.fileImportForm = document.getElementById("fileImportForm");
  els.fileImportInput = document.getElementById("fileImportInput");
  els.importResults = document.getElementById("importResults");
  els.importedFileList = document.getElementById("importedFileList");
  els.chatGptFileBridgeStatus = document.getElementById("chatGptFileBridgeStatus");
  els.selectChatGptFilesButton = document.getElementById("selectChatGptFilesButton");
  els.saveFilesToChatGptButton = document.getElementById("saveFilesToChatGptButton");
  els.clearImportedFilesButton = document.getElementById("clearImportedFilesButton");
  els.inAppBrowserForm = document.getElementById("inAppBrowserForm");
  els.inAppBrowserFrame = document.getElementById("inAppBrowserFrame");
  els.inAppBrowserStatus = document.getElementById("inAppBrowserStatus");
  els.browserExternalButton = document.getElementById("browserExternalButton");
  els.browserAddSourceButton = document.getElementById("browserAddSourceButton");
  els.googleCsePublicLink = document.getElementById("googleCsePublicLink");
  els.browserHistory = document.getElementById("browserHistory");
  els.extractionForm = document.getElementById("extractionForm");
  els.extractionSourceTypes = document.getElementById("extractionSourceTypes");
  els.extractionResults = document.getElementById("extractionResults");
  els.extractionJobs = document.getElementById("extractionJobs");
  els.copyExtractionQueueButton = document.getElementById("copyExtractionQueueButton");
  els.clearExtractionQueueButton = document.getElementById("clearExtractionQueueButton");
  els.extractKeywordSearchForm = document.getElementById("extractKeywordSearchForm");
  els.extractSearchWindow = document.getElementById("extractSearchWindow");
  els.autoBotSection = document.getElementById("autoBotSection");
  els.autoBotFocus = document.getElementById("autoBotFocus");
  els.startAutoBotButton = document.getElementById("startAutoBotButton");
  els.stopAutoBotButton = document.getElementById("stopAutoBotButton");
  els.runAutoBotNowButton = document.getElementById("runAutoBotNowButton");
  els.autoBotStatus = document.getElementById("autoBotStatus");
  els.parallelExtractForm = document.getElementById("parallelExtractForm");
  els.parallelExtractOutput = document.getElementById("parallelExtractOutput");
  els.webScrapeForm = document.getElementById("webScrapeForm");
  els.webScrapeOutput = document.getElementById("webScrapeOutput");
  els.agentForm = document.getElementById("agentForm");
  els.agentScrapeForm = document.getElementById("agentScrapeForm");
  els.agentSearchWindow = document.getElementById("agentSearchWindow");
  els.agentSourceTypes = document.getElementById("agentSourceTypes");
  els.agentTranscript = document.getElementById("agentTranscript");
  els.agentContextSummary = document.getElementById("agentContextSummary");
  els.clearAgentButton = document.getElementById("clearAgentButton");
  els.teamChatForm = document.getElementById("teamChatForm");
  els.teamChatFeed = document.getElementById("teamChatFeed");
  els.teamChatStatus = document.getElementById("teamChatStatus");
  els.refreshTeamChatButton = document.getElementById("refreshTeamChatButton");
  els.useBrowserForTeamPostButton = document.getElementById("useBrowserForTeamPostButton");
  els.profileTabs = document.getElementById("profileTabs");
  els.profileForm = document.getElementById("profileForm");
  els.profileExtendedSections = document.getElementById("profileExtendedSections");
  els.profileIntegrationSummary = document.getElementById("profileIntegrationSummary");
  els.exportProfilesButton = document.getElementById("exportProfilesButton");
  els.modelCoreSummary = document.getElementById("modelCoreSummary");
  els.referenceLibrary = document.getElementById("referenceLibrary");
  els.searchChoiceOverlay = document.getElementById("searchChoiceOverlay");
  els.searchChoiceSummary = document.getElementById("searchChoiceSummary");
  els.searchChoiceInternalButton = document.getElementById("searchChoiceInternalButton");
  els.searchChoiceExternalButton = document.getElementById("searchChoiceExternalButton");
  els.searchChoiceCancelButton = document.getElementById("searchChoiceCancelButton");
  els.botAlertOverlay = document.getElementById("botAlertOverlay");
  els.botAlertContent = document.getElementById("botAlertContent");
  els.botDecisionActions = document.getElementById("botDecisionActions");
  els.botAcceptButton = document.getElementById("botAcceptButton");
  els.botRejectButton = document.getElementById("botRejectButton");
  els.botFeedbackForm = document.getElementById("botFeedbackForm");
  els.botDismissButton = document.getElementById("botDismissButton");
}

function wireEvents() {
  els.authForm.addEventListener("submit", handleSignIn);
  els.signOutButton.addEventListener("click", signOut);

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderSources();
  });

  els.sourceTypeFilter.addEventListener("change", (event) => {
    state.activeSourceType = event.target.value;
    renderSources();
  });

  els.toggleAddFormButton.addEventListener("click", () => {
    els.addSourceForm.hidden = !els.addSourceForm.hidden;
    if (!els.addSourceForm.hidden) {
      els.addSourceForm.elements.title.focus();
    }
  });

  els.cancelAddButton.addEventListener("click", () => {
    els.addSourceForm.reset();
    els.addSourceForm.hidden = true;
  });

  els.addSourceForm.addEventListener("submit", handleAddSource);
  els.fileImportForm.addEventListener("submit", handleFileImport);
  els.clearImportedFilesButton.addEventListener("click", clearImportedFiles);
  els.selectChatGptFilesButton.addEventListener("click", handleSelectChatGptFiles);
  els.saveFilesToChatGptButton.addEventListener("click", handleSaveFilesToChatGptLibrary);
  els.inAppBrowserForm.addEventListener("submit", handleBrowserNavigate);
  els.browserExternalButton.addEventListener("click", openCurrentBrowserTargetExternal);
  els.browserAddSourceButton.addEventListener("click", addCurrentBrowserPageToSources);
  els.extractionForm.addEventListener("submit", handleQueueExtraction);
  els.extractKeywordSearchForm.addEventListener("submit", (event) => handleKeywordSearch(event, "extract"));
  els.parallelExtractForm.addEventListener("submit", handleParallelExtract);
  els.webScrapeForm.addEventListener("submit", handleWebScrape);
  els.copyExtractionQueueButton.addEventListener("click", copyExtractionQueue);
  els.clearExtractionQueueButton.addEventListener("click", clearExtractionQueue);
  els.startAutoBotButton.addEventListener("click", startAutoBot);
  els.stopAutoBotButton.addEventListener("click", stopAutoBot);
  els.runAutoBotNowButton.addEventListener("click", () => runAutoBotAttempt({ manual: true }));
  els.agentForm.addEventListener("submit", handleAgentPrompt);
  els.agentScrapeForm.addEventListener("submit", (event) => handleKeywordSearch(event, "agent"));
  els.clearAgentButton.addEventListener("click", clearAgentChat);
  els.teamChatForm.addEventListener("submit", handleTeamChatSubmit);
  els.refreshTeamChatButton.addEventListener("click", () => syncTeamChat({ renderAfter: true }));
  els.useBrowserForTeamPostButton.addEventListener("click", useBrowserUrlForTeamPost);
  els.searchChoiceInternalButton.addEventListener("click", () => resolveSearchChoice("internal"));
  els.searchChoiceExternalButton.addEventListener("click", () => resolveSearchChoice("external"));
  els.searchChoiceCancelButton.addEventListener("click", () => resolveSearchChoice("cancel"));
  els.botAcceptButton.addEventListener("click", acceptAutoBotFinding);
  els.botRejectButton.addEventListener("click", showAutoBotFeedback);
  els.botDismissButton.addEventListener("click", dismissAutoBotFinding);
  els.botFeedbackForm.addEventListener("submit", handleAutoBotFeedback);
  els.profileForm.addEventListener("submit", handleSaveProfile);
  els.exportProfilesButton.addEventListener("click", () => {
    download("core-user-profiles.json", "application/json", JSON.stringify(state.archive.profiles, null, 2));
  });

  document.getElementById("exportJsonButton").addEventListener("click", () => {
    download("core-research-atlas.json", "application/json", JSON.stringify(state.archive, null, 2));
  });

  document.getElementById("exportTextButton").addEventListener("click", () => {
    download("core-research-atlas.txt", "text/plain", buildTextDigest(state.archive));
  });

  document.getElementById("exportHtmlButton").addEventListener("click", () => {
    download("core-research-atlas-digest.html", "text/html", buildHtmlDigest(state.archive));
  });

  document.getElementById("copyBriefButton").addEventListener("click", copyCodexBrief);

  document.getElementById("resetButton").addEventListener("click", () => {
    const confirmed = window.confirm("Reset local archive, profiles, extraction jobs, and chat to the starter state?");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    state.archive = clone(SEED_DATA);
    state.selectedId = null;
    state.activeProfileUsername = state.currentUser?.username || "UserSeth";
    render();
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("is-active"));
      document.querySelectorAll(".panel-view").forEach((panel) => panel.classList.remove("is-active"));
      button.classList.add("is-active");
      document.getElementById(button.dataset.panel).classList.add("is-active");
    });
  });
}

function initAuth() {
  const username = window.localStorage.getItem(SESSION_KEY);
  state.currentUser = AUTH_USERS.find((user) => user.username === username) || null;
  if (!state.currentUser) {
    showAuth(true);
    return;
  }
  state.activeProfileUsername = state.currentUser.username;
  showAuth(false);
  renderAuthState();
}

function handleSignIn(event) {
  event.preventDefault();
  const formData = new FormData(els.authForm);
  const username = String(formData.get("username")).trim();
  const password = String(formData.get("password"));
  const user = AUTH_USERS.find((candidate) => candidate.username === username && candidate.password === password);

  if (!user) {
    els.authError.textContent = "Invalid username or password.";
    return;
  }

  state.currentUser = user;
  state.activeProfileUsername = user.username;
  window.localStorage.setItem(SESSION_KEY, user.username);
  els.authForm.reset();
  els.authError.textContent = "";
  showAuth(false);
  render();
}

function signOut() {
  window.localStorage.removeItem(SESSION_KEY);
  state.currentUser = null;
  renderAuthState();
  showAuth(true);
}

function showAuth(show) {
  els.authOverlay.hidden = !show;
  document.body.classList.toggle("is-auth-locked", show);
  if (show) {
    window.setTimeout(() => els.authForm.elements.username.focus(), 0);
  }
  renderAuthState();
}

function renderAuthState() {
  const user = state.currentUser;
  els.currentUserBadge.hidden = !user;
  els.signOutButton.hidden = !user;
  if (user) {
    els.currentUserBadge.textContent = `${user.username} / ${user.role}`;
  }
}

function populateFormOptions() {
  setOptions(els.addSourceForm.elements.category, state.archive.categories);
  setOptions(els.addSourceForm.elements.species, state.archive.species);
  setOptions(els.addSourceForm.elements.domain, state.archive.domains);
  setOptions(els.addSourceForm.elements.evidenceTier, state.archive.evidenceTiers);
  setOptions(els.addSourceForm.elements.citationStatus, state.archive.citationStatuses);
  setOptions(els.addSourceForm.elements.sourceType, state.archive.sourceTypes);
  setOptions(els.fileImportForm.elements.category, state.archive.categories);
  setOptions(els.fileImportForm.elements.species, state.archive.species);
  setOptions(els.fileImportForm.elements.domain, state.archive.domains);
  setOptions(els.fileImportForm.elements.evidenceTier, state.archive.evidenceTiers);
  setOptions(els.fileImportForm.elements.citationStatus, state.archive.citationStatuses);
  setOptions(els.sourceTypeFilter, ["All", ...state.archive.sourceTypes]);
  setOptions(els.autoBotSection, state.archive.categories);
}

function setOptions(select, values) {
  select.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
}

function render() {
  renderAuthState();
  populateFormOptions();
  renderNavigation();
  renderSources();
  renderFramework();
  renderImportPanel();
  renderBrowserPanel();
  renderExtractionResults();
  renderExtractionJobs();
  renderAutoBotStatus();
  renderAgent();
  renderTeamChat();
  renderProfiles();
  renderModelCore();
  renderMetrics();
}

function renderNavigation() {
  const categories = ["All", ...state.archive.categories];
  if (!categories.includes(state.activeCategory)) state.activeCategory = "All";
  const counts = countBy(state.archive.sources, "category");
  els.categoryNav.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `nav-item${state.activeCategory === category ? " is-active" : ""}`;
    button.innerHTML = `
      <span>${escapeHtml(category)}</span>
      <span class="nav-count">${category === "All" ? state.archive.sources.length : counts[category] || 0}</span>
    `;
    button.addEventListener("click", () => {
      state.activeCategory = category;
      renderNavigation();
      renderSources();
    });
    els.categoryNav.append(button);
  });

  const species = ["All", ...state.archive.species];
  els.speciesFilters.innerHTML = "";
  species.forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `species-filter${state.activeSpecies === name ? " is-active" : ""}`;
    button.textContent = name;
    button.addEventListener("click", () => {
      state.activeSpecies = name;
      renderNavigation();
      renderSources();
    });
    els.speciesFilters.append(button);
  });

  els.sourceTypeFilter.value = state.activeSourceType;
}

function renderSources() {
  const sources = getFilteredSources();
  els.sourceList.innerHTML = "";

  if (!sources.length) {
    els.sourceList.innerHTML = '<div class="empty-state">No records match the current filters.</div>';
    renderSelected(null);
    return;
  }

  if (!state.selectedId || !sources.some((source) => source.id === state.selectedId)) {
    state.selectedId = sources[0].id;
  }

  sources.forEach((source) => {
    const row = els.sourceRowTemplate.content.firstElementChild.cloneNode(true);
    row.classList.toggle("is-selected", source.id === state.selectedId);
    row.querySelector(".species-token").textContent = speciesInitial(source.species);
    row.querySelector("strong").textContent = source.title;
    row.querySelector("small").textContent = `${source.category} / ${source.domain} / ${source.tradition}`;
    const tier = row.querySelector(".tier-chip");
    tier.textContent = source.evidenceTier;
    tier.classList.add(tierClass(source.evidenceTier));
    row.querySelector(".type-chip").textContent = source.sourceType || "URL";
    row.querySelector(".status-chip").textContent = source.citationStatus;
    row.addEventListener("click", () => {
      state.selectedId = source.id;
      renderSources();
    });
    els.sourceList.append(row);
  });

  renderSelected(state.archive.sources.find((source) => source.id === state.selectedId));
}

function renderSelected(source) {
  if (!source) {
    els.selectedMeta.textContent = "No source selected";
    els.selectedRecord.innerHTML = '<div class="empty-state">Select a source to inspect tags and CORE links.</div>';
    return;
  }

  els.selectedMeta.textContent = `${source.species} / ${source.domain}`;
  els.selectedRecord.innerHTML = `
    <h3>${escapeHtml(source.title)}</h3>
    <div class="chip-row">
      <span class="detail-chip ${tierClass(source.evidenceTier)}">${escapeHtml(source.evidenceTier)}</span>
      <span class="detail-chip">${escapeHtml(source.citationStatus)}</span>
      <span class="detail-chip">${escapeHtml(source.category)}</span>
      <span class="detail-chip">${escapeHtml(source.sourceType || "URL")}</span>
    </div>
    <p>${escapeHtml(source.notes)}</p>
    ${source.url ? `<p><strong>Locator:</strong> ${escapeHtml(source.url)}</p>` : ""}
    <div class="chip-row">
      ${source.terms.map((term) => `<span class="detail-chip">${escapeHtml(term)}</span>`).join("")}
    </div>
  `;
}

function handleAddSource(event) {
  event.preventDefault();
  const formData = new FormData(els.addSourceForm);
  const entry = {
    id: `src-${Date.now()}`,
    title: String(formData.get("title")).trim(),
    category: String(formData.get("category")),
    species: String(formData.get("species")),
    domain: String(formData.get("domain")),
    sourceType: String(formData.get("sourceType")),
    url: String(formData.get("url")).trim(),
    evidenceTier: String(formData.get("evidenceTier")),
    citationStatus: String(formData.get("citationStatus")),
    tradition: `Team entry / ${state.currentUser?.username || "local"}`,
    terms: [],
    notes: String(formData.get("notes")).trim() || "No notes yet.",
    coreLinks: ["Safety and Epistemic Notes"],
  };
  state.archive.sources.unshift(entry);
  state.selectedId = entry.id;
  persistArchive();
  els.addSourceForm.reset();
  els.addSourceForm.hidden = true;
  render();
}

async function handleFileImport(event) {
  event.preventDefault();
  if (state.importBusy) return;

  const files = [...(els.fileImportInput.files || [])];
  if (!files.length) {
    window.alert("Choose one or more files to import.");
    return;
  }

  const options = getImportOptions();
  state.importBusy = true;
  renderImportPanel(`Analyzing ${files.length} file${files.length === 1 ? "" : "s"}...`);

  const results = [];
  for (const file of files) {
    try {
      const analyzed = await analyzeUploadedFile(file);
      results.push(integrateImportedFile(analyzed, options));
    } catch (error) {
      results.push({
        fileName: file.name,
        ok: false,
        warning: error.message,
        recordsCreated: 0,
      });
    }
  }

  state.importBusy = false;
  els.fileImportInput.value = "";
  persistArchive();
  render();

  const created = results.reduce((sum, result) => sum + (result.recordsCreated || 0), 0);
  renderImportPanel(`Import complete: ${created} source record${created === 1 ? "" : "s"} created.`);
}

function getImportOptions() {
  const formData = new FormData(els.fileImportForm);
  return {
    category: String(formData.get("category") || "Documents"),
    species: String(formData.get("species") || "Cross-form"),
    domain: String(formData.get("domain") || "Metaphysics"),
    evidenceTier: String(formData.get("evidenceTier") || "Speculative framework"),
    citationStatus: String(formData.get("citationStatus") || "Needs verification"),
    strategy: String(formData.get("strategy") || "auto"),
    createSources: formData.get("createSources") === "on",
    createResults: formData.get("createResults") === "on",
    chatgptMode: formData.get("chatgptMode") === "on",
  };
}

async function analyzeUploadedFile(file) {
  const payload = new FormData();
  payload.append("file", file, file.name);

  try {
    const response = await fetch("/api/import-file", {
      method: "POST",
      body: payload,
    });
    const data = await response.json();
    if (response.ok && data.ok !== false && data.file) {
      return { ...data.file, source: "server" };
    }
    throw new Error(data.error || `Import endpoint returned HTTP ${response.status}.`);
  } catch (error) {
    const fallback = await analyzeFileInBrowser(file);
    fallback.warnings = [
      ...(fallback.warnings || []),
      `Server parser unavailable or rejected the file: ${error.message}`,
    ];
    return fallback;
  }
}

async function analyzeFileInBrowser(file) {
  const extension = extensionFromFileName(file.name);
  let text = "";
  const warnings = [];

  if ([".txt", ".json", ".py", ".md", ".markdown", ".html", ".htm", ".csv", ".xml", ".yaml", ".yml"].includes(extension)) {
    text = await file.text();
    if (extension === ".html" || extension === ".htm") text = stripHtml(text);
    if (extension === ".json") {
      try {
        text = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        warnings.push("JSON parse failed in browser; imported as raw text.");
      }
    }
  } else {
    const buffer = await file.arrayBuffer();
    text = printableBinaryText(new Uint8Array(buffer));
    warnings.push(`${extension || "This file"} used browser-side best-effort text recovery. Run the Python server for richer PDF/DOCX parsing.`);
  }

  const clean = clampText(text.replace(/\s+\n/g, "\n").trim(), 240000);
  return {
    fileName: file.name,
    extension,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    parser: "browser-fallback",
    source: "browser",
    text: clean,
    summary: summarizeImportText(clean),
    keywords: extractKeywords(clean),
    children: [],
    warnings,
  };
}

function integrateImportedFile(fileData, options) {
  const importId = `import-${Date.now()}-${Math.round(Math.random() * 999)}`;
  const createdAt = new Date().toISOString();
  const archiveSources = detectArchiveSources(fileData.text);
  let sourceItems = [];
  let mode = options.strategy;

  if ((mode === "archive" || mode === "auto") && archiveSources.length) {
    mode = "archive";
    sourceItems = archiveSources.map((source, index) => sourceToImportItem(source, fileData, index, options));
  } else {
    const conversationItems =
      options.chatgptMode || mode === "chatgpt" || mode === "auto" ? extractChatGptConversationItems(fileData.text, fileData) : [];
    if (conversationItems.length && mode !== "single") {
      mode = "chatgpt";
      sourceItems = conversationItems;
    } else {
      sourceItems = mode === "single" ? [singleFileImportItem(fileData, options)] : sectionImportItems(fileData, options);
    }
  }

  const createdSources = [];
  if (options.createSources) {
    sourceItems.forEach((item, index) => {
      const source = importItemToSource(item, fileData, importId, index, options);
      state.archive.sources.unshift(source);
      createdSources.push(source);
    });
  }

  if (options.createResults) {
    appendExtractionResult({
      id: `file-import-result-${Date.now()}-${Math.round(Math.random() * 999)}`,
      engine: "file-import",
      owner: state.currentUser?.username || "local",
      createdAt,
      status: 200,
      ok: true,
      sourcePrompt: `Imported file: ${fileData.fileName}`,
      request: {
        fileName: fileData.fileName,
        strategy: mode,
        parser: fileData.parser,
        createSources: options.createSources,
      },
      itemCount: sourceItems.length,
      items: sourceItems.slice(0, 20).map((item) => ({
        title: item.title,
        url: item.url || `import://${fileData.fileName}`,
        finalUrl: item.url || `import://${fileData.fileName}`,
        status: "imported",
        contentType: fileData.mimeType,
        publishDate: "",
        summary: clampText(item.notes || item.summary || fileData.summary, 700),
        links: normalizeLinks(item.links || []),
      })),
      response: {
        ok: true,
        file: {
          fileName: fileData.fileName,
          extension: fileData.extension,
          parser: fileData.parser,
          size: fileData.size,
          warnings: fileData.warnings || [],
        },
      },
    });
  }

  const importRecord = {
    id: importId,
    fileName: fileData.fileName,
    extension: fileData.extension,
    mimeType: fileData.mimeType,
    size: fileData.size,
    parser: fileData.parser,
    source: fileData.source || "server",
    strategy: mode,
    createdAt,
    owner: state.currentUser?.username || "local",
    keywords: fileData.keywords || extractKeywords(fileData.text),
    summary: fileData.summary || summarizeImportText(fileData.text),
    textLength: String(fileData.text || "").length,
    textExcerpt: clampText(fileData.text || "", 12000),
    childCount: fileData.children?.length || 0,
    recordsCreated: createdSources.length,
    warnings: fileData.warnings || [],
  };

  state.archive.importedFiles = state.archive.importedFiles || [];
  state.archive.importedFiles.unshift(importRecord);
  state.archive.importedFiles = state.archive.importedFiles.slice(0, 50);
  if (createdSources[0]) state.selectedId = createdSources[0].id;

  return {
    fileName: fileData.fileName,
    ok: true,
    recordsCreated: createdSources.length,
    importId,
  };
}

function detectArchiveSources(text) {
  const parsed = parseMaybeJson(text);
  if (!parsed) return [];
  if (Array.isArray(parsed.sources)) return parsed.sources;
  if (Array.isArray(parsed.archive?.sources)) return parsed.archive.sources;
  if (Array.isArray(parsed.data?.sources)) return parsed.data.sources;
  return [];
}

function sourceToImportItem(source, fileData, index, options) {
  return {
    title: source.title || `${fileData.fileName} source ${index + 1}`,
    category: validValue(source.category, state.archive.categories, options.category),
    species: validValue(source.species, state.archive.species, options.species),
    domain: validValue(source.domain, state.archive.domains, options.domain),
    sourceType: validValue(source.sourceType, state.archive.sourceTypes, sourceTypeForFile(fileData)),
    evidenceTier: validValue(source.evidenceTier, state.archive.evidenceTiers, options.evidenceTier),
    citationStatus: validValue(source.citationStatus, state.archive.citationStatuses, options.citationStatus),
    url: source.url || "",
    terms: Array.isArray(source.terms) ? source.terms : extractKeywords(`${source.title || ""} ${source.notes || ""}`),
    notes: source.notes || `Imported from archive file ${fileData.fileName}.`,
    coreLinks: Array.isArray(source.coreLinks) ? source.coreLinks : ["Safety and Epistemic Notes"],
    links: source.url ? [{ url: source.url, title: source.title || source.url }] : [],
  };
}

function extractChatGptConversationItems(text, fileData) {
  const parsed = parseMaybeJson(text);
  const conversations = [];
  if (Array.isArray(parsed)) {
    conversations.push(...parsed.filter((item) => item && typeof item === "object" && (item.mapping || item.messages)));
  } else if (parsed?.mapping || parsed?.messages) {
    conversations.push(parsed);
  } else if (Array.isArray(parsed?.conversations)) {
    conversations.push(...parsed.conversations);
  }

  return conversations.slice(0, 120).map((conversation, index) => {
    const messages = flattenChatGptMessages(conversation);
    const content = messages.map((message) => `${message.role}: ${message.text}`).join("\n\n");
    const title = conversation.title || conversation.name || `ChatGPT conversation ${index + 1}`;
    return {
      title: `ChatGPT: ${title}`,
      category: inferImportCategory(content, "Documents"),
      species: inferSpecies(content, "Cross-form"),
      domain: inferDomain(content, "Metaphysics"),
      sourceType: "Documentation",
      evidenceTier: "Experiential claim",
      citationStatus: "Needs verification",
      url: "",
      terms: extractKeywords(`${title} ${content}`),
      notes: [
        `Imported from ChatGPT export file ${fileData.fileName}.`,
        `Messages detected: ${messages.length}.`,
        summarizeImportText(content),
      ].join(" "),
      coreLinks: ["Core Manifestation Template", "Safety and Epistemic Notes"],
      links: [],
    };
  });
}

function flattenChatGptMessages(conversation) {
  if (Array.isArray(conversation.messages)) {
    return conversation.messages
      .map((message) => ({
        role: message.role || message.author?.role || "message",
        text: extractMessageText(message),
      }))
      .filter((message) => message.text);
  }

  const mapping = conversation.mapping || {};
  return Object.values(mapping)
    .map((node) => node?.message)
    .filter(Boolean)
    .map((message) => ({
      role: message.author?.role || "message",
      text: extractMessageText(message),
    }))
    .filter((message) => message.text);
}

function extractMessageText(message) {
  const content = message.content ?? message;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content?.parts)) {
    return content.parts
      .map((part) => (typeof part === "string" ? part : part?.text || JSON.stringify(part)))
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === "string" ? part : part?.text || "")).join("\n").trim();
  }
  if (content?.text) return String(content.text).trim();
  return "";
}

function singleFileImportItem(fileData, options) {
  const text = fileData.text || "";
  return {
    title: titleFromFile(fileData.fileName),
    category: inferImportCategory(text, options.category),
    species: inferSpecies(text, options.species),
    domain: inferDomain(text, options.domain),
    sourceType: sourceTypeForFile(fileData),
    evidenceTier: inferEvidenceTier(text, options.evidenceTier),
    citationStatus: options.citationStatus,
    url: `import://${fileData.fileName}`,
    terms: fileData.keywords || extractKeywords(text),
    notes: `${fileData.summary || summarizeImportText(text)} Imported parser: ${fileData.parser}.`,
    coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
    links: [],
  };
}

function sectionImportItems(fileData, options) {
  const sections = splitImportSections(fileData.text || "");
  if (!sections.length) return [singleFileImportItem(fileData, options)];
  return sections.slice(0, 40).map((section, index) => {
    const text = section.body || section.title;
    return {
      title: section.title || `${titleFromFile(fileData.fileName)} section ${index + 1}`,
      category: inferImportCategory(text, options.category),
      species: inferSpecies(text, options.species),
      domain: inferDomain(text, options.domain),
      sourceType: sourceTypeForFile(fileData),
      evidenceTier: inferEvidenceTier(text, options.evidenceTier),
      citationStatus: options.citationStatus,
      url: `import://${fileData.fileName}#section-${index + 1}`,
      terms: extractKeywords(text),
      notes: clampText(text, 1200),
      coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
      links: [],
    };
  });
}

function importItemToSource(item, fileData, importId, index, options) {
  return {
    id: `src-${importId}-${index}`,
    title: item.title,
    category: validValue(item.category, state.archive.categories, options.category),
    species: validValue(item.species, state.archive.species, options.species),
    domain: validValue(item.domain, state.archive.domains, options.domain),
    sourceType: validValue(item.sourceType, state.archive.sourceTypes, sourceTypeForFile(fileData)),
    url: item.url || `import://${fileData.fileName}`,
    evidenceTier: validValue(item.evidenceTier, state.archive.evidenceTiers, options.evidenceTier),
    citationStatus: validValue(item.citationStatus, state.archive.citationStatuses, options.citationStatus),
    tradition: `Imported file / ${state.currentUser?.username || "local"}`,
    terms: (item.terms || extractKeywords(item.notes || item.title)).slice(0, 10),
    notes: clampText(item.notes || item.summary || fileData.summary, 1400),
    coreLinks: item.coreLinks?.length ? item.coreLinks : ["Safety and Epistemic Notes"],
    importId,
  };
}

function splitImportSections(text) {
  const clean = String(text || "").trim();
  if (!clean) return [];
  const headingPattern = /^(#{1,4}\s+.+|[A-Z][A-Za-z0-9 /:()'".-]{4,90}:?)$/gm;
  const matches = [...clean.matchAll(headingPattern)].slice(0, 60);
  if (matches.length < 2) {
    const paragraphs = clean.split(/\n\s*\n/).filter((part) => part.trim().length > 180);
    if (paragraphs.length < 2) return [];
    return paragraphs.slice(0, 16).map((paragraph, index) => ({
      title: `${titleFromText(paragraph) || "Imported section"} ${index + 1}`,
      body: paragraph.trim(),
    }));
  }

  return matches.map((match, index) => {
    const start = match.index || 0;
    const end = matches[index + 1]?.index || clean.length;
    const block = clean.slice(start, end).trim();
    const [rawTitle, ...bodyLines] = block.split("\n");
    return {
      title: rawTitle.replace(/^#{1,4}\s+/, "").replace(/:$/, "").trim(),
      body: bodyLines.join("\n").trim() || block,
    };
  });
}

function renderImportPanel(message = "") {
  if (!els.importResults) return;
  const imports = state.archive.importedFiles || [];
  const bridge = window.openai || {};
  els.chatGptFileBridgeStatus.innerHTML = `
    <div class="status-row"><strong>selectFiles</strong><span>${bridge.selectFiles ? "Available in this host." : "Not available here; use the normal upload picker."}</span></div>
    <div class="status-row"><strong>uploadFile</strong><span>${bridge.uploadFile ? "Available for ChatGPT library uploads." : "Not available in this browser context."}</span></div>
    <div class="status-row"><strong>getFileDownloadUrl</strong><span>${bridge.getFileDownloadUrl ? "Available for authorized ChatGPT file downloads." : "Not available in this browser context."}</span></div>
  `;
  els.importResults.innerHTML = `
    <div class="result-summary-bar">
      <span>${imports.length} imported file logs</span>
      <span>${imports.reduce((sum, item) => sum + (item.recordsCreated || 0), 0)} source records created</span>
      <span>${state.importBusy ? "Import running" : "Ready"}</span>
    </div>
    ${message ? `<p class="import-message">${escapeHtml(message)}</p>` : ""}
  `;
  els.importedFileList.innerHTML = imports.length
    ? imports
        .slice(0, 12)
        .map(
          (item) => `
            <article class="import-card">
              <header>
                <strong>${escapeHtml(item.fileName)}</strong>
                <span class="detail-chip">${escapeHtml(item.parser)}</span>
              </header>
              <p>${escapeHtml(item.summary)}</p>
              <small>${escapeHtml(item.recordsCreated)} sources / ${escapeHtml(item.textLength)} chars / ${escapeHtml(item.owner)} / ${new Date(item.createdAt).toLocaleString()}</small>
              ${
                item.warnings?.length
                  ? `<ul>${item.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
                  : ""
              }
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No files imported yet.</div>';
}

async function handleSelectChatGptFiles() {
  if (!window.openai?.selectFiles) {
    window.alert("ChatGPT file picker is not available in this browser context. Use the local file picker above.");
    return;
  }
  if (!window.openai?.getFileDownloadUrl) {
    window.alert("This host can select files but cannot provide download URLs to the widget.");
    return;
  }

  const selected = await window.openai.selectFiles();
  if (!selected?.length) return;
  const options = getImportOptions();
  state.importBusy = true;
  renderImportPanel(`Importing ${selected.length} ChatGPT file${selected.length === 1 ? "" : "s"}...`);

  for (const fileRef of selected) {
    const { downloadUrl } = await window.openai.getFileDownloadUrl({ fileId: fileRef.fileId });
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const file = new File([blob], fileRef.fileName || fileRef.fileId, { type: fileRef.mimeType || blob.type });
    const analyzed = await analyzeUploadedFile(file);
    integrateImportedFile(analyzed, { ...options, chatgptMode: true });
  }

  state.importBusy = false;
  persistArchive();
  render();
}

async function handleSaveFilesToChatGptLibrary() {
  if (!window.openai?.uploadFile) {
    window.alert("ChatGPT library upload is not available in this browser context.");
    return;
  }
  const files = [...(els.fileImportInput.files || [])];
  if (!files.length) {
    window.alert("Choose files in the import picker before saving them to the ChatGPT file library.");
    return;
  }
  const uploaded = [];
  for (const file of files) {
    const result = await window.openai.uploadFile(file, { library: true });
    uploaded.push(`${file.name}: ${result.fileId}`);
  }
  window.alert(`Saved to ChatGPT file library:\n${uploaded.join("\n")}`);
  renderImportPanel("Files saved to ChatGPT file library.");
}

function clearImportedFiles() {
  const confirmed = window.confirm("Clear imported file log? Sources already created from imports will remain.");
  if (!confirmed) return;
  state.archive.importedFiles = [];
  persistArchive();
  renderImportPanel("Import log cleared.");
}

function handleBrowserNavigate(event) {
  event.preventDefault();
  const target = String(new FormData(els.inAppBrowserForm).get("target") || "").trim();
  if (!target) return;
  openInAppBrowser(normalizeBrowserTarget(target), target);
}

function openInAppBrowser(url, label = url) {
  state.currentBrowserUrl = url;
  els.inAppBrowserFrame.src = url;
  state.archive.browserHistory = state.archive.browserHistory || [];
  state.archive.browserHistory.unshift({
    id: `browser-${Date.now()}`,
    url,
    label,
    owner: state.currentUser?.username || "local",
    createdAt: new Date().toISOString(),
  });
  state.archive.browserHistory = dedupeBrowserHistory(state.archive.browserHistory).slice(0, 30);
  persistArchive();
  renderBrowserPanel();
}

function renderBrowserPanel() {
  if (!els.browserHistory) return;
  const current = state.currentBrowserUrl || state.archive.browserHistory?.[0]?.url || BROWSER_DEFAULT_URL;
  if (els.inAppBrowserFrame && els.inAppBrowserFrame.src !== current) {
    els.inAppBrowserFrame.src = current;
  }
  if (els.googleCsePublicLink) {
    els.googleCsePublicLink.href = GOOGLE_CSE_PUBLIC_URL;
  }
  els.inAppBrowserStatus.textContent = browserStatusMessage(current);
  const history = state.archive.browserHistory || [];
  els.browserHistory.innerHTML = history.length
    ? history
        .slice(0, 12)
        .map(
          (entry) => `
            <article class="browser-history-item">
              <div>
                <strong>${escapeHtml(entry.label || entry.url)}</strong>
                <small>${escapeHtml(entry.url)} / ${new Date(entry.createdAt).toLocaleString()}</small>
              </div>
              <div class="form-actions">
                <button class="ghost-button iconless" type="button" data-browser-open="${escapeHtml(entry.url)}">Open</button>
                <button class="ghost-button iconless" type="button" data-browser-source="${escapeHtml(entry.url)}">Add Source</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No in-app browser history yet.</div>';

  els.browserHistory.querySelectorAll("[data-browser-open]").forEach((button) => {
    button.addEventListener("click", () => openInAppBrowser(button.dataset.browserOpen, button.dataset.browserOpen));
  });
  els.browserHistory.querySelectorAll("[data-browser-source]").forEach((button) => {
    button.addEventListener("click", () => addBrowserUrlToSources(button.dataset.browserSource));
  });
}

function openCurrentBrowserTargetExternal() {
  const target = String(els.inAppBrowserForm.elements.target.value || "").trim();
  const url = state.currentBrowserUrl || (target ? normalizeBrowserTarget(target) : "");
  if (!url) {
    window.alert("Enter a URL or search query first.");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function addCurrentBrowserPageToSources() {
  const target = String(els.inAppBrowserForm.elements.target.value || "").trim();
  const url = state.currentBrowserUrl || (target ? normalizeBrowserTarget(target) : "");
  if (!url) {
    window.alert("Open a browser page first.");
    return;
  }
  addBrowserUrlToSources(url);
}

function addBrowserUrlToSources(url) {
  const source = {
    id: `src-browser-${Date.now()}`,
    title: `Browser lead: ${domainFromUrl(url) || url}`,
    category: "Documents",
    species: "Cross-form",
    domain: "Metaphysics",
    sourceType: "URL",
    url,
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    tradition: `In-app browser / ${state.currentUser?.username || "local"}`,
    terms: extractKeywords(url),
    notes: "Captured from the in-app research browser. Review page content and citation details before marking verified.",
    coreLinks: ["Safety and Epistemic Notes"],
  };
  state.archive.sources.unshift(source);
  state.selectedId = source.id;
  persistArchive();
  render();
}

function normalizeBrowserTarget(value) {
  const target = value.trim();
  if (/^https?:\/\//i.test(target)) return target;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(target)) return `https://${target}`;
  return buildCseSearchUrl(target);
}

function buildCseSearchUrl(query) {
  const text = String(query || "").trim();
  if (!text) return GOOGLE_CSE_PUBLIC_URL;
  return `${GOOGLE_CSE_PUBLIC_URL}&gsc.q=${encodeURIComponent(text)}`;
}

function browserStatusMessage(url) {
  if (!url) return "No page loaded yet.";
  if (isCseUrl(url)) {
    return `Loaded Google Programmable Search Engine ${GOOGLE_CSE_ID}. Use the embedded CSE search box above, or open the public CSE URL if the fallback frame is restricted.`;
  }
  if (isKnownFrameBlockedUrl(url)) {
    return `Loaded ${url}. Google commonly blocks cross-site iframe display with X-Frame-Options: SAMEORIGIN, so use Open External if the frame appears blank.`;
  }
  return `Loaded ${url}. If the frame is blank, that site likely blocks iframe embedding; use Open External.`;
}

function isCseUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "cse.google.com" && parsed.searchParams.get("cx") === GOOGLE_CSE_ID;
  } catch {
    return false;
  }
}

function isKnownFrameBlockedUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "google.com" || host.endsWith(".google.com");
  } catch {
    return false;
  }
}

function dedupeBrowserHistory(history) {
  const seen = new Set();
  return history.filter((entry) => {
    if (!entry?.url || seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

function getBrowserContext() {
  const history = state.archive.browserHistory || [];
  const currentUrl = state.currentBrowserUrl || history[0]?.url || BROWSER_DEFAULT_URL;
  const browserSources = (state.archive.sources || [])
    .filter((source) => source.id?.startsWith("src-browser-") || String(source.tradition || "").includes("In-app browser"))
    .slice(0, 5);
  const teamBrowserLeads = (state.archive.teamMessages || [])
    .filter((item) => ["recommendation", "link"].includes(item.type) && item.url && item.status !== "rejected")
    .slice(0, 5);
  return {
    currentUrl,
    currentDomain: domainFromUrl(currentUrl) || "cse.google.com",
    csePublicUrl: GOOGLE_CSE_PUBLIC_URL,
    history: history.slice(0, 6),
    browserSources,
    teamBrowserLeads,
    searchText: [
      currentUrl,
      ...history.slice(0, 6).flatMap((entry) => [entry.label, entry.url]),
      ...browserSources.flatMap((source) => [source.title, source.url, source.notes, ...(source.terms || [])]),
      ...teamBrowserLeads.flatMap((item) => [item.title, item.url, item.text]),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function browserContextSummary(context = getBrowserContext()) {
  const historyLines = context.history.map((entry) => `- ${entry.label || entry.url}: ${entry.url}`).join("\n");
  const sourceLines = context.browserSources.map((source) => `- ${source.title}: ${source.url || "no URL"}`).join("\n");
  const teamLines = context.teamBrowserLeads.map((item) => `- ${item.title || item.type}: ${item.url}`).join("\n");
  return [
    `Current browser URL: ${context.currentUrl}`,
    `Current browser domain: ${context.currentDomain}`,
    `Google CSE URL: ${context.csePublicUrl}`,
    context.history.length ? `Recent browser history:\n${historyLines}` : "Recent browser history: none yet",
    context.browserSources.length ? `Browser source leads:\n${sourceLines}` : "Browser source leads: none promoted yet",
    context.teamBrowserLeads.length ? `Team browser leads:\n${teamLines}` : "Team browser leads: none yet",
  ].join("\n");
}

function withBrowserContext(prompt, heading = "In-app browser context") {
  const text = String(prompt || "").trim();
  if (text.includes("In-app browser context:")) return text;
  return `${text || "Browser-informed research run"}\n\n${heading}:\n${browserContextSummary()}`;
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function stripHtml(text) {
  return String(text)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>|<\/p>|<\/h[1-6]>|<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function printableBinaryText(bytes) {
  let output = "";
  for (const byte of bytes) {
    output += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : "\n";
  }
  return output
    .split(/\n+/)
    .filter((line) => line.trim().length > 3)
    .join("\n");
}

function extensionFromFileName(name) {
  const match = String(name || "").toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
}

function sourceTypeForFile(fileData) {
  const extension = fileData.extension || extensionFromFileName(fileData.fileName);
  if (extension === ".pdf") return "PDF";
  if ([".html", ".htm"].includes(extension)) return "Documentation";
  if ([".zip", ".json"].includes(extension)) return "Archive";
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension)) return "WebP / Image";
  if ([".doc", ".docx", ".md", ".txt"].includes(extension)) return "Documentation";
  return "Documentation";
}

function titleFromFile(fileName) {
  return String(fileName || "Imported file")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromText(text) {
  return clampText(String(text || "").split(/[.\n]/)[0] || "", 58);
}

function summarizeImportText(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clampText(clean, 900) || "No summary text extracted.";
}

function inferImportCategory(text, fallback) {
  const lower = String(text || "").toLowerCase();
  if (/(sandbox|model|parameter|constraint)/.test(lower)) return "Theoretical Concepts";
  if (/(physiology|molecular|tissue|neural|body schema|morphogenesis|mechanism|energy budget)/.test(lower)) return "Mechanics";
  if (/(theory|hypothesis|concept|framework|template|blueprint)/.test(lower)) return "Theoretical Concepts";
  if (/(occult|magick|ritual|esoteric|alchemy|spiritual|aura)/.test(lower)) return "Occult Data";
  if (/(culture|cultural|japanese|kitsune|folklore|tradition|myth)/.test(lower)) return "Cultural Data";
  if (/(historical|ancient|medieval|classical|chronicle|ovid)/.test(lower)) return "Historical Data";
  return fallback || "Documents";
}

function inferSpecies(text, fallback) {
  const lower = String(text || "").toLowerCase();
  if (lower.includes("kitsune")) return "Kitsune";
  if (lower.includes("dragon") || lower.includes("drac")) return "Dragon";
  if (lower.includes("fox") || lower.includes("alopec")) return "Fox";
  if (lower.includes("wolf") || lower.includes("lycan")) return "Wolf";
  return fallback || "Cross-form";
}

function inferDomain(text, fallback) {
  const lower = String(text || "").toLowerCase();
  if (/(physiology|molecular|neural|tissue|phantom limb)/.test(lower)) return "Physiology";
  if (/(psychology|identity|mental|body schema|clinical)/.test(lower)) return "Psychology";
  if (/(biology|morphogenesis|genetic|cellular)/.test(lower)) return "Theoretical Biology";
  if (/(occult|ritual|magick|esoteric|alchemy)/.test(lower)) return "Occult / Esoteric";
  if (/(metaphys|aura|spirit|energy|blueprint)/.test(lower)) return "Metaphysics";
  if (/(history|ancient|medieval|classical)/.test(lower)) return "History";
  if (/(folklore|myth|legend|kitsune|therian)/.test(lower)) return "Folklore";
  return fallback || "Metaphysics";
}

function inferEvidenceTier(text, fallback) {
  const lower = String(text || "").toLowerCase();
  if (/(journal|study|clinical|neuroscience|biology|physiology|doi)/.test(lower)) return "Scientific analogy";
  if (/(ovid|saga|manuscript|primary text|original)/.test(lower)) return "Primary text";
  if (/(book|scholar|article|secondary)/.test(lower)) return "Secondary scholarship";
  if (/(my experience|i shifted|personal|conversation|chatgpt)/.test(lower)) return "Experiential claim";
  return fallback || "Speculative framework";
}

function validValue(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function renderFramework() {
  els.frameworkList.innerHTML = state.archive.framework
    .map(
      (item) => `
        <article class="framework-item">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.description)}</span>
        </article>
      `
    )
    .join("");
}

function renderMetrics() {
  els.sourceCount.textContent = state.archive.sources.length;
  els.verifiedCount.textContent = state.archive.sources.filter((source) => source.citationStatus === "Verified").length;
  els.theoryCount.textContent = state.archive.sources.reduce((sum, source) => sum + source.coreLinks.length, 0);
}

function renderSourceTypeCheckboxes(container, prefix, selectedTypes) {
  container.innerHTML = state.archive.sourceTypes
    .map((type, index) => {
      const id = `${prefix}-${index}`;
      const checked = selectedTypes.includes(type) ? "checked" : "";
      return `
        <label class="check-tile" for="${id}">
          <input id="${id}" type="checkbox" value="${escapeHtml(type)}" ${checked}>
          <span>${escapeHtml(type)}</span>
        </label>
      `;
    })
    .join("");
}

function handleQueueExtraction(event) {
  event.preventDefault();
  const formData = new FormData(els.extractionForm);
  const prompt = withBrowserContext(String(formData.get("prompt")).trim(), "In-app browser context");
  const job = createExtractionJob({
    prompt,
    mode: String(formData.get("mode")),
    depth: String(formData.get("depth")),
    maxLeads: Number(formData.get("maxLeads")) || 50,
    sourceTypes: getCheckedSourceTypes(els.extractionSourceTypes),
    owner: state.currentUser?.username || "local",
  });
  state.archive.extractionJobs.unshift(job);
  persistArchive();
  els.extractionForm.reset();
  renderSourceTypeCheckboxes(els.extractionSourceTypes, "extract", job.sourceTypes);
  renderExtractionJobs();
  renderAgent();
}

async function handleKeywordSearch(event, context) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const query = String(formData.get("query") || "").trim();
  const fullContent = String(formData.get("fullContent")) === "true";
  const includeLinks = String(formData.get("includeLinks")) !== "false";
  if (!query) return;

  const searchUrl = buildSearchUrl(query);
  const choice = await askSearchDisplayChoice({ query, searchUrl, context });
  if (choice === "cancel") return;
  if (choice === "external") {
    window.open(searchUrl, "_blank", "noopener,noreferrer");
    renderEmbeddedSearchWindow(context, {
      query,
      searchUrl,
      mode: "external",
      message: "Opened external Google search link.",
    });
    return;
  }

  await runKeywordScrape({ query, fullContent, includeLinks, context, sourcePrompt: getContextPrompt(context, query) });
}

function askSearchDisplayChoice({ query, searchUrl, context }) {
  return new Promise((resolve) => {
    state.pendingSearchChoice = { resolve, query, searchUrl, context };
    els.searchChoiceSummary.innerHTML = `
      <strong>${escapeHtml(context === "agent" ? "ChatGPT 5.5 Agent" : "Global Extract Console")}</strong>
      <span>${escapeHtml(query)}</span>
    `;
    els.searchChoiceOverlay.hidden = false;
  });
}

function resolveSearchChoice(choice) {
  const pending = state.pendingSearchChoice;
  state.pendingSearchChoice = null;
  els.searchChoiceOverlay.hidden = true;
  if (pending) pending.resolve(choice);
}

function buildSearchUrl(query) {
  return `${GOOGLE_SEARCH_BASE_URL}${encodeURIComponent(query.trim())}`;
}

function getContextPrompt(context, query) {
  if (context === "agent") {
    const agentPrompt = els.agentForm?.elements?.prompt?.value?.trim();
    if (agentPrompt) return withBrowserContext(agentPrompt, "In-app browser context");
    const latestUserMessage = [...(state.archive.agentMessages || [])].reverse().find((message) => message.role === "user");
    if (latestUserMessage?.content) return withBrowserContext(latestUserMessage.content, "In-app browser context");
  }
  return getActiveExtractionPrompt(`Keyword search: ${query}`);
}

async function runKeywordScrape({ query, fullContent = false, includeLinks = true, context = "extract", sourcePrompt, categoryTarget = "" }) {
  const searchUrl = buildSearchUrl(query);
  const objective = withBrowserContext(sourcePrompt || `Keyword search: ${query}`, "In-app browser context");
  const payload = {
    urls: [searchUrl],
    objective,
    browser_context: getBrowserContext(),
    search_query: query,
    search_base_url: GOOGLE_SEARCH_BASE_URL,
    advanced_settings: {
      full_content: fullContent,
      include_links: includeLinks,
    },
  };
  renderEmbeddedSearchWindow(context, {
    query,
    searchUrl,
    mode: "internal",
    message: "Searching through /api/scrape...",
  });

  try {
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    const run = {
      id: `keyword-scrape-${Date.now()}`,
      owner: state.currentUser?.username || "local",
      createdAt: new Date().toISOString(),
      request: payload,
      ok: response.ok && data.ok !== false,
      status: response.status,
      response: data,
      context,
      categoryTarget,
    };
    state.archive.webScrapeRuns.unshift(run);
    state.archive.webScrapeRuns = state.archive.webScrapeRuns.slice(0, 30);
    const record = createExtractionResultRecord({
      engine: context === "agent" ? "agent-scrape" : "keyword-scrape",
      request: payload,
      response: data,
      status: response.status,
      ok: run.ok,
      sourcePrompt: payload.objective,
    });
    record.context = context;
    record.query = query;
    record.searchUrl = searchUrl;
    record.categoryTarget = categoryTarget;
    appendExtractionResult(record);
    persistArchive();
    renderEmbeddedSearchWindow(context, { query, searchUrl, mode: "internal", record });
    renderExtractionResults();
    renderAgent();
    renderModelCore();
    return record;
  } catch (error) {
    const data = {
      ok: false,
      error: "Could not reach /api/scrape. Start the Python server and try again.",
      detail: error.message,
    };
    const record = createExtractionResultRecord({
      engine: context === "agent" ? "agent-scrape" : "keyword-scrape",
      request: payload,
      response: data,
      status: 0,
      ok: false,
      sourcePrompt: payload.objective,
    });
    record.context = context;
    record.query = query;
    record.searchUrl = searchUrl;
    record.categoryTarget = categoryTarget;
    appendExtractionResult(record);
    persistArchive();
    renderEmbeddedSearchWindow(context, { query, searchUrl, mode: "internal", record });
    renderExtractionResults();
    renderAgent();
    return record;
  }
}

function renderEmbeddedSearchWindow(context, payload) {
  const target = context === "agent" ? els.agentSearchWindow : els.extractSearchWindow;
  if (!target) return;
  target.hidden = false;
  const record = payload.record;
  if (!record) {
    target.innerHTML = `
      <div class="embedded-search-header">
        <strong>${escapeHtml(payload.mode === "external" ? "External Search" : "Internal Search")}</strong>
        <a href="${escapeHtml(payload.searchUrl)}" target="_blank" rel="noreferrer">Open search</a>
      </div>
      <p>${escapeHtml(payload.message || "Ready.")}</p>
      <small>${escapeHtml(payload.query || "")}</small>
    `;
    return;
  }
  target.innerHTML = `
    <div class="embedded-search-header">
      <strong>${escapeHtml(engineLabel(record.engine))}</strong>
      <a href="${escapeHtml(record.searchUrl || payload.searchUrl)}" target="_blank" rel="noreferrer">Open search</a>
    </div>
    <p>${escapeHtml(record.sourcePrompt || payload.query)}</p>
    <div class="embedded-result-list">
      ${(record.items || []).map((item, index) => renderCompactSearchItem(record.id, item, index)).join("")}
    </div>
  `;
  target.querySelectorAll("[data-promote-result]").forEach((button) => {
    button.addEventListener("click", () => promoteExtractionItem(button.dataset.promoteResult, Number(button.dataset.itemIndex || 0)));
  });
}

function renderCompactSearchItem(resultId, item, index) {
  const url = item.url || item.finalUrl || "";
  const links = (item.links || [])
    .slice(0, 4)
    .map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.title || domainFromUrl(link.url) || link.url)}</a>`)
    .join("");
  return `
    <article class="embedded-result-item">
      <div>
        <h3>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>` : escapeHtml(item.title)}</h3>
        ${url ? `<small>${escapeHtml(url)}</small>` : ""}
      </div>
      ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
      ${links ? `<div class="result-links">${links}</div>` : ""}
      <button class="ghost-button iconless" type="button" data-promote-result="${escapeHtml(resultId)}" data-item-index="${index}">Promote</button>
    </article>
  `;
}

async function handleParallelExtract(event) {
  event.preventDefault();
  const formData = new FormData(els.parallelExtractForm);
  const urls = parseUrlList(String(formData.get("urls")));
  const fullContent = String(formData.get("fullContent")) === "true";
  const sourcePrompt = getActiveExtractionPrompt();
  if (!urls.length) {
    els.parallelExtractOutput.textContent = "Add at least one URL.";
    return;
  }

  const payload = {
    urls,
    objective: sourcePrompt,
    browser_context: getBrowserContext(),
    advanced_settings: {
      full_content: fullContent,
    },
  };
  els.parallelExtractOutput.textContent = "Running Parallel Extract request through /api/extract...";

  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    const run = {
      id: `parallel-${Date.now()}`,
      owner: state.currentUser?.username || "local",
      createdAt: new Date().toISOString(),
      request: payload,
      ok: response.ok && data.ok !== false,
      status: response.status,
      response: data,
    };
    state.archive.parallelExtractRuns.unshift(run);
    state.archive.parallelExtractRuns = state.archive.parallelExtractRuns.slice(0, 20);
    appendExtractionResult(
      createExtractionResultRecord({
        engine: "parallel",
        request: payload,
        response: data,
        status: response.status,
        ok: run.ok,
        sourcePrompt,
      })
    );
    persistArchive();
    els.parallelExtractOutput.textContent = JSON.stringify(data, null, 2);
    renderExtractionResults();
    renderAgent();
    renderModelCore();
  } catch (error) {
    const errorData = {
      ok: false,
      error:
        "Could not reach /api/extract. Start the Python server with `python server.py` and configure PARALLEL_API_KEY server-side.",
      detail: error.message,
    };
    appendExtractionResult(
      createExtractionResultRecord({
        engine: "parallel",
        request: payload,
        response: errorData,
        status: 0,
        ok: false,
        sourcePrompt,
      })
    );
    persistArchive();
    els.parallelExtractOutput.textContent = JSON.stringify(errorData, null, 2);
    renderExtractionResults();
    renderAgent();
  }
}

async function handleWebScrape(event) {
  event.preventDefault();
  const formData = new FormData(els.webScrapeForm);
  const query = String(formData.get("query") || "").trim();
  const urls = query ? [buildSearchUrl(query)] : parseUrlList(String(formData.get("urls") || ""));
  const fullContent = String(formData.get("fullContent")) === "true";
  const includeLinks = String(formData.get("includeLinks")) === "true";
  const sourcePrompt = query ? getActiveExtractionPrompt(`Keyword search: ${query}`) : getActiveExtractionPrompt();
  if (!urls.length) {
    els.webScrapeOutput.textContent = "Add search keywords.";
    return;
  }

  const payload = {
    urls,
    search_query: query,
    search_base_url: query ? GOOGLE_SEARCH_BASE_URL : "",
    objective: sourcePrompt,
    browser_context: getBrowserContext(),
    advanced_settings: {
      full_content: fullContent,
      include_links: includeLinks,
    },
  };
  els.webScrapeOutput.textContent = query
    ? "Running local keyword search through /api/scrape..."
    : "Running local web scrape through /api/scrape...";

  try {
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    const run = {
      id: `scrape-${Date.now()}`,
      owner: state.currentUser?.username || "local",
      createdAt: new Date().toISOString(),
      request: payload,
      ok: response.ok && data.ok !== false,
      status: response.status,
      response: data,
    };
    state.archive.webScrapeRuns.unshift(run);
    state.archive.webScrapeRuns = state.archive.webScrapeRuns.slice(0, 20);
    appendExtractionResult(
      createExtractionResultRecord({
        engine: "scrape",
        request: payload,
        response: data,
        status: response.status,
        ok: run.ok,
        sourcePrompt,
      })
    );
    persistArchive();
    els.webScrapeOutput.textContent = JSON.stringify(data, null, 2);
    renderExtractionResults();
    renderAgent();
    renderModelCore();
  } catch (error) {
    const errorData = {
      ok: false,
      error: "Could not reach /api/scrape. Start the Python server with `python server.py`.",
      detail: error.message,
    };
    appendExtractionResult(
      createExtractionResultRecord({
        engine: "scrape",
        request: payload,
        response: errorData,
        status: 0,
        ok: false,
        sourcePrompt,
      })
    );
    persistArchive();
    els.webScrapeOutput.textContent = JSON.stringify(errorData, null, 2);
    renderExtractionResults();
    renderAgent();
  }
}

function getActiveExtractionPrompt(fallback = "Direct URL extraction run") {
  const prompt = els.extractionForm?.elements?.prompt?.value?.trim();
  if (prompt) return withBrowserContext(prompt, "In-app browser context");
  const queued = state.archive.extractionJobs?.[0]?.prompt;
  if (queued) return withBrowserContext(queued, "In-app browser context");
  const latestUserMessage = [...(state.archive.agentMessages || [])].reverse().find((message) => message.role === "user");
  return withBrowserContext(latestUserMessage?.content || fallback, "In-app browser context");
}

function appendExtractionResult(record) {
  state.archive.extractionResults = state.archive.extractionResults || [];
  state.archive.extractionResults.unshift(record);
  state.archive.extractionResults = state.archive.extractionResults.slice(0, 30);
}

function createExtractionResultRecord({ engine, request, response, status, ok, sourcePrompt }) {
  const createdAt = new Date().toISOString();
  const id = `${engine}-result-${Date.now()}-${Math.round(Math.random() * 999)}`;
  const items = normalizeExtractionItems(engine, response, request);
  return {
    id,
    engine,
    owner: state.currentUser?.username || "local",
    createdAt,
    status,
    ok,
    sourcePrompt,
    request,
    itemCount: items.length,
    items,
    response,
  };
}

function normalizeExtractionItems(engine, data, request = {}) {
  const root = data?.response ?? data ?? {};
  const candidates = collectResultCandidates(root).slice(0, 12);
  const errors = normalizeErrorItems(root);
  const fallbackUrls = Array.isArray(request.urls) ? request.urls : [];
  const sourceItems = candidates.length
    ? candidates
    : fallbackUrls.map((url) => ({ url, title: url, summary: root.error || root.detail || "No structured result item returned." }));
  const normalized = sourceItems.map((item, index) => normalizeExtractionItem(item, index, fallbackUrls[index], engine));
  return [...normalized, ...errors].slice(0, 16);
}

function collectResultCandidates(value, depth = 0) {
  if (!value || depth > 4) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object" && !Array.isArray(item));
  }
  if (typeof value !== "object") return [];

  const preferredKeys = ["results", "documents", "pages", "items", "extracts", "records", "data"];
  for (const key of preferredKeys) {
    if (Array.isArray(value[key])) {
      const rows = value[key].filter((item) => item && typeof item === "object" && !Array.isArray(item));
      if (rows.some((item) => item.url || item.finalUrl || item.title || item.excerpts || item.markdown || item.summary)) {
        return rows;
      }
    }
  }

  return Object.values(value).flatMap((child) => collectResultCandidates(child, depth + 1));
}

function normalizeExtractionItem(item, index, fallbackUrl, engine) {
  const url =
    pickString(item, ["url", "finalUrl", "final_url", "source_url", "sourceUrl", "href", "link", "canonical_url"]) ||
    fallbackUrl ||
    "";
  const excerpts = Array.isArray(item.excerpts) ? item.excerpts.filter(Boolean).join("\n") : "";
  const summary =
    excerpts ||
    pickString(item, ["summary", "description", "snippet", "excerpt", "text", "markdown", "content", "full_content", "error"]) ||
    "";
  const title =
    pickString(item, ["title", "name", "headline", "page_title"]) ||
    (url ? domainFromUrl(url) : `${engineLabel(engine)} item ${index + 1}`);
  const links = [
    ...normalizeLinks(item.links),
    ...normalizeLinks(item.citations),
    ...normalizeLinks(item.sources),
    ...collectCitationLinks(item),
  ];
  return {
    title,
    url,
    finalUrl: pickString(item, ["finalUrl", "final_url"]) || url,
    status: pickString(item, ["status", "http_status_code", "error_type"]) || "",
    contentType: pickString(item, ["contentType", "content_type", "mime_type"]) || "",
    publishDate: pickString(item, ["publish_date", "publishedAt", "date"]) || "",
    summary: clampText(summary, 700),
    links: dedupeLinks(links).slice(0, 8),
  };
}

function normalizeErrorItems(root) {
  const errors = Array.isArray(root?.errors) ? root.errors : [];
  return errors
    .filter((error) => error && typeof error === "object")
    .map((error, index) => ({
      title: `Failed extraction ${index + 1}`,
      url: pickString(error, ["url", "source_url"]) || "",
      finalUrl: "",
      status: pickString(error, ["error_type", "status", "http_status_code"]) || "error",
      contentType: "",
      publishDate: "",
      summary: clampText(pickString(error, ["message", "error", "detail"]) || "The provider returned an extraction error.", 700),
      links: [],
    }));
}

function normalizeLinks(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((link) => {
      if (typeof link === "string") return { url: link, title: domainFromUrl(link) || link };
      if (!link || typeof link !== "object") return null;
      const url = pickString(link, ["url", "href", "link", "source_url"]);
      if (!url) return null;
      return { url, title: pickString(link, ["title", "text", "label", "name"]) || domainFromUrl(url) || url };
    })
    .filter(Boolean);
}

function collectCitationLinks(value, depth = 0) {
  if (!value || depth > 4) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectCitationLinks(item, depth + 1));
  if (typeof value !== "object") return [];

  const citation = value.url_citation || (value.type === "url_citation" ? value : null);
  if (citation?.url) {
    return [{ url: citation.url, title: citation.title || domainFromUrl(citation.url) || citation.url }];
  }
  if (value.type === "source-url" && value.url) {
    return [{ url: value.url, title: value.title || domainFromUrl(value.url) || value.url }];
  }
  return Object.values(value).flatMap((child) => collectCitationLinks(child, depth + 1));
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    if (!link?.url || seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

function pickString(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function clampText(value, length) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 1)}...` : text;
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function engineLabel(engine) {
  const labels = {
    parallel: "Parallel Extract",
    scrape: "Local Scraper",
    "keyword-scrape": "Keyword Search",
    "agent-scrape": "Agent Keyword Search",
    "auto-bot": "Auto Research Bot",
    "file-import": "File Import",
    aiq: "NVIDIA AIQ",
    openai: "OpenAI Web Search",
  };
  return labels[engine] || engine;
}

function parseUrlList(value) {
  return value
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function createExtractionJob({ prompt, mode, depth, maxLeads, sourceTypes, owner }) {
  const keywords = extractKeywords(prompt);
  const queryBase = keywords.length ? keywords.join(" ") : prompt.slice(0, 90);
  const browserContext = getBrowserContext();
  const browserQueryTerms = extractKeywords(browserContext.searchText).join(" ");
  return {
    id: `job-${Date.now()}-${Math.round(Math.random() * 999)}`,
    owner,
    status: "Queued",
    prompt,
    browserContext,
    mode,
    depth,
    maxLeads,
    sourceTypes,
    createdAt: new Date().toISOString(),
    generatedQueries: [
      `${queryBase} shapeshifting folklore primary sources`,
      `${queryBase} lycanthropy therianthropy phantom shift documentation`,
      `${queryBase} morphogenesis physiology body schema PDF archive`,
      `${queryBase} occult metaphysical transformation grimoire source`,
      `${queryBase} ${browserQueryTerms} current browser lead`,
    ],
    extractionTargets: sourceTypes.map((type) => ({
      type,
      action: type.includes("PDF") ? "download metadata and extract citations" : "discover, quote, summarize, and cite",
    })),
    integrationNotes:
      "Backend connector should fetch results, preserve URLs/archive IDs, extract short quotes, assign evidence tiers, include current in-app browser context, and avoid treating speculative claims as proven biology.",
  };
}

function renderExtractionResults() {
  if (!els.extractionResults) return;
  const results = state.archive.extractionResults || [];
  if (!results.length) {
    els.extractionResults.innerHTML =
      '<div class="empty-state">No extraction results yet. Run Parallel Extract or Local Web Scraper to create source cards.</div>';
    return;
  }

  const totalItems = results.reduce((sum, result) => sum + (result.items?.length || 0), 0);
  els.extractionResults.innerHTML = `
    <div class="result-summary-bar">
      <span>${results.length} saved result records</span>
      <span>${totalItems} normalized source cards</span>
      <span>${escapeHtml(engineLabel(results[0].engine))} latest</span>
    </div>
    ${results
      .map(
        (result) => `
          <article class="result-card ${result.ok ? "" : "is-error"}">
            <header>
              <div>
                <h3>${escapeHtml(engineLabel(result.engine))}</h3>
                <p>${escapeHtml(result.sourcePrompt || "Direct URL extraction run")}</p>
              </div>
              <div class="result-meta">
                <span class="detail-chip">${escapeHtml(result.ok ? "OK" : "Needs attention")}</span>
                <span class="detail-chip">${escapeHtml(String(result.status || "local"))}</span>
                <span class="detail-chip">${escapeHtml(result.owner || "local")}</span>
              </div>
            </header>
            <div class="result-items">
              ${(result.items || [])
                .map((item, index) => renderExtractionItem(result.id, item, index))
                .join("")}
            </div>
            <div class="form-actions">
              <button class="ghost-button" type="button" data-copy-result="${escapeHtml(result.id)}">Copy Result JSON</button>
            </div>
            <small>${new Date(result.createdAt).toLocaleString()}</small>
          </article>
        `
      )
      .join("")}
  `;

  els.extractionResults.querySelectorAll("[data-copy-result]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = results.find((item) => item.id === button.dataset.copyResult);
      copyOrDownload("extraction-result.json", JSON.stringify(result, null, 2));
    });
  });

  els.extractionResults.querySelectorAll("[data-promote-result]").forEach((button) => {
    button.addEventListener("click", () => {
      promoteExtractionItem(button.dataset.promoteResult, Number(button.dataset.itemIndex || 0));
    });
  });
}

function renderExtractionItem(resultId, item, index) {
  const primaryUrl = item.url || item.finalUrl || "";
  const linkList = (item.links || [])
    .map(
      (link) =>
        `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.title || domainFromUrl(link.url) || link.url)}</a>`
    )
    .join("");
  return `
    <section class="result-item">
      <div class="result-title-row">
        <div>
          <h4>${
            primaryUrl
              ? `<a href="${escapeHtml(primaryUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>`
              : escapeHtml(item.title)
          }</h4>
          ${primaryUrl ? `<p class="result-url">${escapeHtml(primaryUrl)}</p>` : ""}
        </div>
        <button class="ghost-button iconless" type="button" data-promote-result="${escapeHtml(resultId)}" data-item-index="${index}">
          Promote
        </button>
      </div>
      <div class="chip-row">
        ${item.status ? `<span class="detail-chip">${escapeHtml(item.status)}</span>` : ""}
        ${item.contentType ? `<span class="detail-chip">${escapeHtml(item.contentType)}</span>` : ""}
        ${item.publishDate ? `<span class="detail-chip">${escapeHtml(item.publishDate)}</span>` : ""}
      </div>
      ${item.summary ? `<p class="result-summary">${escapeHtml(item.summary)}</p>` : ""}
      ${linkList ? `<div class="result-links"><strong>Links and citations</strong>${linkList}</div>` : ""}
    </section>
  `;
}

function promoteExtractionItem(resultId, itemIndex) {
  const result = (state.archive.extractionResults || []).find((record) => record.id === resultId);
  const item = result?.items?.[itemIndex];
  if (!result || !item) return;
  const url = item.url || item.finalUrl || "";
  const source = {
    id: `src-extract-${Date.now()}-${itemIndex}`,
    title: item.title || `Extracted source ${itemIndex + 1}`,
    category: "Documents",
    species: "Cross-form",
    domain: "Metaphysics",
    sourceType: inferSourceType(url),
    url,
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    tradition: `${engineLabel(result.engine)} / ${result.owner || "local"}`,
    terms: extractKeywords(`${result.sourcePrompt} ${item.title} ${item.summary}`).slice(0, 8),
    notes: `Promoted from ${engineLabel(result.engine)} result ${result.id}. Prompt: ${result.sourcePrompt}. Extracted summary: ${item.summary || "No summary returned."}`,
    coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
  };
  state.archive.sources.unshift(source);
  state.selectedId = source.id;
  persistArchive();
  render();
}

function inferSourceType(url) {
  const lower = String(url || "").toLowerCase();
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".webp") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "WebP / Image";
  }
  if (lower.includes("archive.org") || lower.endsWith(".zip")) return "Archive";
  return "URL";
}

function renderAutoBotStatus() {
  if (!els.autoBotStatus) return;
  const bot = state.autoBot;
  const nextSection = state.archive.categories[bot.sectionIndex % state.archive.categories.length] || "Documents";
  els.autoBotStatus.innerHTML = `
    <div class="status-row">
      <strong>${bot.active ? "Active" : "Stopped"}</strong>
      <span>${bot.active ? "Checks one section every minute." : "Start when you want recursive web discovery."}</span>
    </div>
    <div class="status-row">
      <strong>Next section</strong>
      <span>${escapeHtml(nextSection)}</span>
    </div>
    <div class="status-row">
      <strong>Attempts</strong>
      <span>${bot.attempts} total${bot.lastRunAt ? `, last run ${new Date(bot.lastRunAt).toLocaleTimeString()}` : ""}</span>
    </div>
    <div class="status-row">
      <strong>Feedback memory</strong>
      <span>${escapeHtml(bot.feedback || "No improvement feedback yet.")}</span>
    </div>
  `;
}

function startAutoBot() {
  if (state.autoBot.active) return;
  const selectedIndex = Math.max(0, state.archive.categories.indexOf(els.autoBotSection.value));
  state.autoBot.active = true;
  state.autoBot.sectionIndex = selectedIndex;
  state.autoBot.pausedForReview = false;
  state.autoBot.timer = window.setInterval(() => runAutoBotAttempt({ manual: false }), AUTO_BOT_INTERVAL_MS);
  renderAutoBotStatus();
  runAutoBotAttempt({ manual: true });
}

function stopAutoBot() {
  if (state.autoBot.timer) {
    window.clearInterval(state.autoBot.timer);
  }
  state.autoBot.active = false;
  state.autoBot.timer = null;
  state.autoBot.pausedForReview = false;
  renderAutoBotStatus();
}

async function runAutoBotAttempt({ manual = false, feedback = "" } = {}) {
  if (!manual && (!state.autoBot.active || state.autoBot.pausedForReview)) return;
  const category = state.archive.categories[state.autoBot.sectionIndex % state.archive.categories.length] || "Documents";
  const query = buildAutoBotQuery(category, feedback || state.autoBot.feedback);
  state.autoBot.attempts += 1;
  state.autoBot.lastRunAt = new Date().toISOString();
  renderAutoBotStatus();

  const record = await runKeywordScrape({
    query,
    fullContent: false,
    includeLinks: true,
    context: "extract",
    sourcePrompt: `Auto bot ${category} search: ${query}`,
    categoryTarget: category,
  });
  record.engine = "auto-bot";
  record.categoryTarget = category;
  record.query = query;
  state.archive.autoBotFindings.unshift({
    id: record.id,
    category,
    query,
    createdAt: record.createdAt,
    accepted: false,
    itemCount: record.items?.length || 0,
  });
  state.archive.autoBotFindings = state.archive.autoBotFindings.slice(0, 50);
  persistArchive();
  state.autoBot.sectionIndex = (state.autoBot.sectionIndex + 1) % state.archive.categories.length;
  renderExtractionResults();
  renderAutoBotStatus();

  const item = selectValuableBotItem(record);
  if (item) {
    showAutoBotFinding(record, item, category);
  }
}

function buildAutoBotQuery(category, feedback = "") {
  const focus = els.autoBotFocus?.value?.trim() || "";
  const species = state.archive.species.filter((item) => item !== "Cross-form").join(" ");
  const terms = [
    category,
    "shapeshifting",
    species,
    "wolf fox kitsune dragon",
    "sources documentation PDF folklore occult metaphysics physiology",
    focus,
    feedback,
  ]
    .filter(Boolean)
    .join(" ");
  return terms.replace(/\s+/g, " ").trim();
}

function selectValuableBotItem(record) {
  const items = record.items || [];
  return items.find((item) => {
    const usefulText = `${item.title || ""} ${item.summary || ""}`.trim();
    return (item.url || item.links?.length) && usefulText.length > 40;
  }) || items.find((item) => item.url || item.links?.length) || items[0];
}

function showAutoBotFinding(record, item, category) {
  state.autoBot.pausedForReview = true;
  state.autoBot.currentFinding = { recordId: record.id, itemIndex: record.items.indexOf(item), category };
  els.botFeedbackForm.hidden = true;
  els.botDecisionActions.hidden = false;
  els.botAlertContent.innerHTML = `
    <article class="embedded-result-item">
      <strong>${escapeHtml(category)}</strong>
      <h3>${escapeHtml(item.title)}</h3>
      ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a>` : ""}
      ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
      <small>${escapeHtml(record.query || "")}</small>
    </article>
  `;
  els.botAlertOverlay.hidden = false;
  renderAutoBotStatus();
}

function acceptAutoBotFinding() {
  const finding = state.autoBot.currentFinding;
  const record = (state.archive.extractionResults || []).find((item) => item.id === finding?.recordId);
  const item = record?.items?.[finding?.itemIndex || 0];
  if (record && item) {
    addResultItemToSourceArchive(record, item, finding.category || record.categoryTarget || "Documents");
    const botLog = state.archive.autoBotFindings.find((entry) => entry.id === record.id);
    if (botLog) botLog.accepted = true;
  }
  closeAutoBotAlert();
  persistArchive();
  render();
}

function showAutoBotFeedback() {
  els.botDecisionActions.hidden = true;
  els.botFeedbackForm.hidden = false;
  els.botFeedbackForm.elements.feedback.focus();
}

function handleAutoBotFeedback(event) {
  event.preventDefault();
  const feedback = String(new FormData(els.botFeedbackForm).get("feedback") || "").trim();
  if (feedback) state.autoBot.feedback = feedback;
  closeAutoBotAlert();
  runAutoBotAttempt({ manual: true, feedback });
}

function dismissAutoBotFinding() {
  closeAutoBotAlert();
}

function closeAutoBotAlert() {
  els.botAlertOverlay.hidden = true;
  els.botFeedbackForm.reset();
  els.botFeedbackForm.hidden = true;
  els.botDecisionActions.hidden = false;
  state.autoBot.pausedForReview = false;
  state.autoBot.currentFinding = null;
  renderAutoBotStatus();
}

function addResultItemToSourceArchive(result, item, category) {
  const url = item.url || item.finalUrl || item.links?.[0]?.url || "";
  const source = {
    id: `src-bot-${Date.now()}`,
    title: item.title || `Auto bot source for ${category}`,
    category,
    species: "Cross-form",
    domain: inferDomainFromCategory(category),
    sourceType: inferSourceType(url),
    url,
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    tradition: `Auto research bot / ${result.owner || "local"}`,
    terms: extractKeywords(`${result.query} ${item.title} ${item.summary}`).slice(0, 8),
    notes: `Accepted from automated research bot result ${result.id}. Query: ${result.query}. Summary: ${item.summary || "No summary returned."}`,
    coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
  };
  state.archive.sources.unshift(source);
  state.selectedId = source.id;
}

function inferDomainFromCategory(category) {
  const map = {
    Documents: "Folklore",
    "Historical Data": "History",
    "Cultural Data": "Folklore",
    "Occult Data": "Occult / Esoteric",
    Mechanics: "Physiology",
    "Theoretical Concepts": "Theoretical Biology",
  };
  return map[category] || "Metaphysics";
}

function renderExtractionJobs() {
  if (!state.archive.extractionJobs.length) {
    els.extractionJobs.innerHTML = '<div class="empty-state">No extraction jobs queued yet.</div>';
    return;
  }

  els.extractionJobs.innerHTML = state.archive.extractionJobs
    .map(
      (job) => `
        <article class="job-card">
          <div>
            <h3>${escapeHtml(job.prompt)}</h3>
            <p>${escapeHtml(job.mode)} / ${escapeHtml(job.depth)} / ${job.maxLeads} leads / ${escapeHtml(job.owner)}</p>
          </div>
          <div class="chip-row">
            <span class="detail-chip">${escapeHtml(job.status)}</span>
            ${job.sourceTypes.map((type) => `<span class="detail-chip">${escapeHtml(type)}</span>`).join("")}
          </div>
          <ol>
            ${job.generatedQueries.map((query) => `<li>${escapeHtml(query)}</li>`).join("")}
          </ol>
          <div class="form-actions">
            <button class="ghost-button" type="button" data-promote-job="${escapeHtml(job.id)}">Promote to Source Lead</button>
            <button class="ghost-button" type="button" data-copy-job="${escapeHtml(job.id)}">Copy Job JSON</button>
          </div>
        </article>
      `
    )
    .join("");

  els.extractionJobs.querySelectorAll("[data-promote-job]").forEach((button) => {
    button.addEventListener("click", () => promoteJobToSource(button.dataset.promoteJob));
  });

  els.extractionJobs.querySelectorAll("[data-copy-job]").forEach((button) => {
    button.addEventListener("click", () => {
      const job = state.archive.extractionJobs.find((item) => item.id === button.dataset.copyJob);
      copyOrDownload("extraction-job.json", JSON.stringify(job, null, 2));
    });
  });
}

function promoteJobToSource(jobId) {
  const job = state.archive.extractionJobs.find((item) => item.id === jobId);
  if (!job) return;
  const source = {
    id: `src-${Date.now()}`,
    title: `Extraction lead: ${job.prompt.slice(0, 78)}`,
    category: "Documents",
    species: "Cross-form",
    domain: "Metaphysics",
    sourceType: job.sourceTypes[0] || "URL",
    url: job.generatedQueries[0],
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    tradition: `Extraction queue / ${job.owner}`,
    terms: extractKeywords(job.prompt).slice(0, 6),
    notes: `Created from extraction job ${job.id}. Query set requires live web/PDF/archive execution before citation approval.`,
    coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
  };
  state.archive.sources.unshift(source);
  state.selectedId = source.id;
  persistArchive();
  render();
}

function copyExtractionQueue() {
  copyOrDownload("core-extraction-queue.json", JSON.stringify(state.archive.extractionJobs, null, 2));
}

function clearExtractionQueue() {
  const confirmed = window.confirm("Clear queued extraction jobs?");
  if (!confirmed) return;
  state.archive.extractionJobs = [];
  persistArchive();
  renderExtractionJobs();
  renderAgent();
}

function handleAgentPrompt(event) {
  event.preventDefault();
  const formData = new FormData(els.agentForm);
  const prompt = String(formData.get("prompt")).trim();
  const sourceTypes = getCheckedSourceTypes(els.agentSourceTypes);
  const options = {
    mode: String(formData.get("mode")),
    depth: String(formData.get("depth")),
    queueExtraction: String(formData.get("queueExtraction")) === "yes",
    sourceTypes,
    browserContext: getBrowserContext(),
  };

  state.archive.agentMessages.push({
    role: "user",
    owner: state.currentUser?.username || "local",
    createdAt: new Date().toISOString(),
    content: prompt,
  });

  if (options.queueExtraction) {
    state.archive.extractionJobs.unshift(
      createExtractionJob({
        prompt: withBrowserContext(prompt, "In-app browser context"),
        mode: options.mode,
        depth: options.depth,
        maxLeads: options.depth === "Exhaustive" ? 150 : 60,
        sourceTypes,
        owner: state.currentUser?.username || "local",
      })
    );
  }

  state.archive.agentMessages.push({
    role: "assistant",
    owner: "ChatGPT 5.5 Pro connector-ready agent",
    createdAt: new Date().toISOString(),
    content: generateAgentResponse(prompt, options),
  });

  persistArchive();
  els.agentForm.reset();
  renderSourceTypeCheckboxes(els.agentSourceTypes, "agent", sourceTypes);
  renderAgent();
  renderExtractionJobs();
}

function getInternalModel() {
  return state.archive.internalModel || SEED_DATA.internalModel;
}

function getBackendCore() {
  return state.archive.backendCore || SEED_DATA.backendCore;
}

function getReferenceLibrary() {
  return state.archive.referenceLibrary?.length ? state.archive.referenceLibrary : SEED_DATA.referenceLibrary;
}

function getGatewayPath(model = getInternalModel()) {
  return Object.keys(model?.gateway?.paths || {})[0] || "/resource/fetch";
}

function getGatewayOperation(model = getInternalModel()) {
  const path = getGatewayPath(model);
  return model?.gateway?.paths?.[path]?.get?.operationId || model?.gatewayOperation || "fetchInternalData";
}

function rankReferences(prompt) {
  const keywords = extractKeywords(prompt);
  if (!keywords.length) return getReferenceLibrary();
  return getReferenceLibrary()
    .map((reference) => {
      const text = [
        reference.title,
        reference.role,
        reference.backendUse,
        reference.evidenceTier,
        ...(reference.detectedTerms || []),
      ]
        .join(" ")
        .toLowerCase();
      const score = keywords.reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0);
      return { reference, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.reference);
}

function generateAgentResponse(prompt, options) {
  const browserContext = options.browserContext || getBrowserContext();
  const teamMessages = state.archive.teamMessages || [];
  const matches = rankSources(`${prompt} ${browserContext.searchText}`).slice(0, 5);
  const references = rankReferences(prompt).slice(0, 3);
  const activeProfile = getProfile(state.currentUser?.username || state.activeProfileUsername);
  const model = getInternalModel();
  const core = getBackendCore();
  const parallelApi = state.archive.externalApis?.parallelExtract || SEED_DATA.externalApis.parallelExtract;
  const scraperApi = state.archive.externalApis?.localWebScraper || SEED_DATA.externalApis.localWebScraper;
  const cseApi = state.archive.externalApis?.googleProgrammableSearch || SEED_DATA.externalApis.googleProgrammableSearch;
  const aiqApi = state.archive.externalApis?.nvidiaAIQResearch || SEED_DATA.externalApis.nvidiaAIQResearch;
  const latestResults = (state.archive.extractionResults || []).slice(0, 3);
  const botFindings = state.archive.autoBotFindings || [];
  const importedFiles = state.archive.importedFiles || [];
  const browserHistory = state.archive.browserHistory || [];
  const openRecommendations = teamMessages.filter((item) => item.type === "recommendation" && item.status !== "rejected").slice(0, 3);
  const operation = getGatewayOperation(model);
  const targetParam = model?.targetParameter || "target_id";
  const profileLine = activeProfile
    ? `${activeProfile.displayName} / ${activeProfile.animalForm} / spirits: ${activeProfile.animalSpirits}`
    : "No active profile";
  const sourceLine = matches.length
    ? matches.map((source) => `${source.title} (${source.evidenceTier}, ${source.sourceType})`).join("; ")
    : "No direct local matches yet.";
  const referenceLine = references.length
    ? references.map((reference) => `${reference.title} (${reference.pageCount} pages; ${reference.evidenceTier})`).join("; ")
    : "No uploaded reference match; use the complete reference layer if needed.";
  const extractionLine = latestResults.length
    ? latestResults
        .map((result) => {
          const itemLine = (result.items || [])
            .slice(0, 2)
            .map((item) => `${item.title}${item.url ? ` <${item.url}>` : ""}`)
            .join(", ");
          return `${engineLabel(result.engine)}: ${itemLine || "no normalized items"}`;
        })
        .join("; ")
    : "No normalized extraction results yet.";
  const sourceTypes = options.sourceTypes.join(", ") || "all source types";

  return [
    `Mode: ${options.mode}. Access depth: ${options.depth}. Source access: ${sourceTypes}.`,
    `Internal model profile: ${model.displayName || "ChatGPT 5.5 Pro Internal Core"} is mapped to ${operation}(${targetParam}) through ${getGatewayPath(model)}. This is local connector-ready orchestration, not a live OpenAI-hosted model call.`,
    `Parallel extraction path: ${parallelApi.localEndpoint} can call ${parallelApi.upstreamEndpoint} from the Python server when PARALLEL_API_KEY is configured.`,
    `Local scraping path: ${scraperApi.localEndpoint} performs dependency-free HTML/text extraction with private-network target safeguards. Keyword search mode invisibly builds ${GOOGLE_SEARCH_BASE_URL}{keywords}.`,
    `Google Programmable Search: CSE ${cseApi.searchEngineId} is embedded in the Browser panel with public URL ${cseApi.publicUrl}.`,
    `File import layer: ${importedFiles.length} imported file logs are available; latest import ${importedFiles[0]?.fileName || "none"} created ${importedFiles[0]?.recordsCreated || 0} source records.`,
    `In-app browser layer: ${browserHistory.length} captured browser targets; active target ${browserContext.currentUrl}. The agent and Extract console use this browser context when building searches and source cards.`,
    `Team collaboration layer: ${teamMessages.length} posts stored; ${openRecommendations.length} open source recommendation(s) can be rejected or promoted into Sources.`,
    `Automated research bot: ${botFindings.length} persisted findings; it rotates through content sections once per minute only after the user starts it and asks before adding sources.`,
    `NVIDIA AIQ research path: ${aiqApi.backendUrl} is registered as an optional deep-research backend. Use it only after a trusted AI-Q server is reachable and health-checked.`,
    `Backend core route: ${core.title}; active stages include ${core.stages.slice(0, 4).join(", ")} before extraction/export logging.`,
    `Active profile integration: ${profileLine}. Profile data should influence prioritization and vocabulary, not replace evidence labels.`,
    `Local archive synthesis: ${sourceLine}`,
    `Uploaded reference layer: ${referenceLine}`,
    `Latest extraction source cards: ${extractionLine}`,
    `Current browser context summary: ${browserContext.currentDomain}; recent lead ${browserContext.history[0]?.url || "none"}.`,
    `Recommended next pass: search documentation, PDFs, URLs, archives, and image/OCR leads for primary-source anchors; extract citation metadata; separate folklore, occult testimony, metaphysical theory, and biological analogy into distinct evidence tiers.`,
    `Epistemic constraint: physical shapeshifting claims remain speculative unless independently verified. The agent can synthesize large research plans here, but live global-web fetching needs an external scraper/search/API connector.`,
  ].join("\n\n");
}

function renderAgent() {
  els.agentTranscript.innerHTML = state.archive.agentMessages
    .map(
      (message) => `
        <article class="message ${message.role}">
          <strong>${escapeHtml(message.role === "user" ? message.owner : "CORE Agent")}</strong>
          <p>${escapeHtml(message.content)}</p>
          <small>${new Date(message.createdAt).toLocaleString()}</small>
        </article>
      `
    )
    .join("");
  els.agentTranscript.scrollTop = els.agentTranscript.scrollHeight;

  const activeProfile = getProfile(state.currentUser?.username || state.activeProfileUsername);
  const model = getInternalModel();
  const core = getBackendCore();
  const references = getReferenceLibrary();
  const parallelApi = state.archive.externalApis?.parallelExtract || SEED_DATA.externalApis.parallelExtract;
  const scraperApi = state.archive.externalApis?.localWebScraper || SEED_DATA.externalApis.localWebScraper;
  const cseApi = state.archive.externalApis?.googleProgrammableSearch || SEED_DATA.externalApis.googleProgrammableSearch;
  const aiqApi = state.archive.externalApis?.nvidiaAIQResearch || SEED_DATA.externalApis.nvidiaAIQResearch;
  const resultCount = (state.archive.extractionResults || []).length;
  const sourceCardCount = (state.archive.extractionResults || []).reduce((sum, result) => sum + (result.items?.length || 0), 0);
  const botFindings = state.archive.autoBotFindings || [];
  const importedFiles = state.archive.importedFiles || [];
  const browserHistory = state.archive.browserHistory || [];
  const browserContext = getBrowserContext();
  const teamMessages = state.archive.teamMessages || [];
  const openRecommendations = teamMessages.filter((item) => item.type === "recommendation" && item.status !== "rejected");
  els.agentContextSummary.innerHTML = `
    <article><strong>Model Surface</strong><span>${escapeHtml(model.displayName)}; ${escapeHtml(model.status)}.</span></article>
    <article><strong>Gateway</strong><span>${escapeHtml(getGatewayOperation(model))} via ${escapeHtml(getGatewayPath(model))}; static local profile only.</span></article>
    <article><strong>Backend Core</strong><span>${escapeHtml(core.title)} with ${core.stages.length} staged mechanics.</span></article>
    <article><strong>Archive</strong><span>${state.archive.sources.length} records, ${state.archive.extractionJobs.length} queued extraction jobs.</span></article>
    <article><strong>Extraction Results</strong><span>${resultCount} result records, ${sourceCardCount} normalized source cards available to the agent.</span></article>
    <article><strong>Parallel Extract</strong><span>${escapeHtml(parallelApi.localEndpoint)} / ${state.archive.parallelExtractRuns.length} local request logs.</span></article>
    <article><strong>Local Scraper</strong><span>${escapeHtml(scraperApi.localEndpoint)} / ${state.archive.webScrapeRuns.length} local request logs.</span></article>
    <article><strong>Keyword Search</strong><span>${escapeHtml(GOOGLE_SEARCH_BASE_URL)} + user keywords; modal chooses internal window or external link.</span></article>
    <article><strong>Google CSE</strong><span>${escapeHtml(cseApi.searchEngineId)} / ${escapeHtml(cseApi.publicUrl)}.</span></article>
    <article><strong>File Import</strong><span>${importedFiles.length} imported file logs; ${importedFiles.reduce((sum, item) => sum + (item.recordsCreated || 0), 0)} sources created from uploads.</span></article>
    <article><strong>In-App Browser</strong><span>${browserHistory.length} captured targets; active ${escapeHtml(browserContext.currentUrl)}.</span></article>
    <article><strong>Browser Pull</strong><span>Agent, keyword scraper, Parallel Extract, and Extract jobs include current browser URL, CSE URL, history, and browser source leads.</span></article>
    <article><strong>Team Feed</strong><span>${teamMessages.length} posts; ${openRecommendations.length} open recommendations available for source review.</span></article>
    <article><strong>Auto Bot</strong><span>${botFindings.length} findings logged; ${botFindings.filter((entry) => entry.accepted).length} accepted into source sections.</span></article>
    <article><strong>NVIDIA AIQ</strong><span>${escapeHtml(aiqApi.backendUrl)} / ${escapeHtml(aiqApi.status)}.</span></article>
    <article><strong>References</strong><span>${references.length} uploaded PDF references loaded for background and routing.</span></article>
    <article><strong>Active Profile</strong><span>${escapeHtml(activeProfile?.displayName || "None")} / ${escapeHtml(activeProfile?.animalForm || "Not set")}</span></article>
    <article><strong>Policy</strong><span>Web/model calls require configured backend keys; source URLs remain visible and clickable.</span></article>
  `;
}

function renderModelCore() {
  const model = getInternalModel();
  const core = getBackendCore();
  const references = getReferenceLibrary();
  const parallelApi = state.archive.externalApis?.parallelExtract || SEED_DATA.externalApis.parallelExtract;
  const scraperApi = state.archive.externalApis?.localWebScraper || SEED_DATA.externalApis.localWebScraper;
  const cseApi = state.archive.externalApis?.googleProgrammableSearch || SEED_DATA.externalApis.googleProgrammableSearch;
  const aiqApi = state.archive.externalApis?.nvidiaAIQResearch || SEED_DATA.externalApis.nvidiaAIQResearch;
  if (els.modelCoreSummary) {
    els.modelCoreSummary.innerHTML = `
      <div class="status-row"><strong>${escapeHtml(model.displayName)}</strong><span>${escapeHtml(model.providerNote)}</span></div>
      <div class="status-row"><strong>Gateway</strong><span>${escapeHtml(getGatewayOperation(model))}(${escapeHtml(model.targetParameter || "target_id")}) at ${escapeHtml(getGatewayPath(model))}</span></div>
      <div class="status-row"><strong>Parallel Extract</strong><span>${escapeHtml(parallelApi.localEndpoint)} proxies ${escapeHtml(parallelApi.upstreamEndpoint)} with ${escapeHtml(parallelApi.auth)}.</span></div>
      <div class="status-row"><strong>Local Scraper</strong><span>${escapeHtml(scraperApi.localEndpoint)} extracts HTML/text directly with safeguards: ${escapeHtml(scraperApi.safeguards.slice(0, 2).join("; "))}.</span></div>
      <div class="status-row"><strong>Google CSE</strong><span>${escapeHtml(cseApi.scriptUrl)} renders ${escapeHtml(cseApi.elements.join(" + "))}; public URL ${escapeHtml(cseApi.publicUrl)}.</span></div>
      <div class="status-row"><strong>NVIDIA AIQ</strong><span>${escapeHtml(aiqApi.backendUrl)} is registered for optional routed shallow/deep research once a trusted backend is running.</span></div>
      <div class="status-row"><strong>${escapeHtml(core.title)}</strong><span>${escapeHtml(core.summary)}</span></div>
      <div class="status-row"><strong>Hard Limits</strong><span>${escapeHtml(core.hardLimits.slice(0, 2).join("; "))}</span></div>
    `;
  }

  if (els.referenceLibrary) {
    els.referenceLibrary.innerHTML = references
      .map(
        (reference) => `
          <div class="status-row">
            <strong>${escapeHtml(reference.title)}</strong>
            <span>${escapeHtml(reference.pageCount)} pages / ${escapeHtml(reference.evidenceTier)} / ${escapeHtml(reference.citationStatus)}</span>
            <span>${escapeHtml(reference.backendUse)}</span>
          </div>
        `
      )
      .join("");
  }
}

function clearAgentChat() {
  const confirmed = window.confirm("Clear local agent chat history?");
  if (!confirmed) return;
  state.archive.agentMessages = clone(SEED_DATA.agentMessages);
  persistArchive();
  renderAgent();
}

function startTeamChatPolling() {
  syncTeamChat({ renderAfter: true });
  if (state.teamChatPollTimer) window.clearInterval(state.teamChatPollTimer);
  state.teamChatPollTimer = window.setInterval(() => syncTeamChat({ renderAfter: true }), TEAM_CHAT_POLL_MS);
}

function setTeamChatStatus(text) {
  if (els.teamChatStatus) els.teamChatStatus.textContent = text;
}

async function syncTeamChat({ renderAfter = false } = {}) {
  if (!els.teamChatFeed) return;
  try {
    const response = await fetch("/api/team-chat", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data.messages)) {
      state.archive.teamMessages = mergeTeamMessages(state.archive.teamMessages || [], data.messages).slice(0, 200);
      persistArchive();
    }
    setTeamChatStatus(`Synced ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    setTeamChatStatus("Local-only chat");
  }
  if (renderAfter) renderTeamChat();
}

function mergeTeamMessages(localMessages = [], remoteMessages = []) {
  const map = new Map();
  [...remoteMessages, ...localMessages].forEach((item) => {
    if (!item?.id) return;
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  });
  return [...map.values()].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

async function postTeamChatPayload(payload) {
  try {
    const response = await fetch("/api/team-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data.messages)) {
      state.archive.teamMessages = data.messages;
      persistArchive();
      renderTeamChat();
    }
    setTeamChatStatus(`Synced ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    setTeamChatStatus("Local-only chat");
  }
}

function handleTeamChatSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.teamChatForm);
  const type = String(formData.get("type") || "message");
  const rawUrl = String(formData.get("url") || "").trim();
  const url = rawUrl ? normalizeBrowserTarget(rawUrl) : "";
  const text = String(formData.get("text") || "").trim();
  const title = String(formData.get("title") || "").trim() || (url ? `Team lead: ${domainFromUrl(url) || url}` : `${type} from ${state.currentUser?.username || "local"}`);
  if (!text) return;

  const item = {
    id: `team-${Date.now()}-${Math.round(Math.random() * 999)}`,
    type,
    owner: state.currentUser?.username || "local",
    title,
    text,
    url,
    status: type === "recommendation" ? "open" : "posted",
    votes: {},
    createdAt: new Date().toISOString(),
  };

  state.archive.teamMessages = mergeTeamMessages([item], state.archive.teamMessages || []).slice(0, 200);
  persistArchive();
  els.teamChatForm.reset();
  renderTeamChat();
  postTeamChatPayload({ action: "post", item });
}

function useBrowserUrlForTeamPost() {
  const context = getBrowserContext();
  els.teamChatForm.elements.url.value = context.currentUrl;
  if (!els.teamChatForm.elements.title.value) {
    els.teamChatForm.elements.title.value = `Browser lead: ${context.currentDomain}`;
  }
  if (!els.teamChatForm.elements.text.value) {
    els.teamChatForm.elements.text.value = `Review this in-app browser lead for the source archive: ${context.currentUrl}`;
  }
}

function renderTeamChat() {
  if (!els.teamChatFeed) return;
  const messages = [...(state.archive.teamMessages || [])].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  if (!messages.length) {
    els.teamChatFeed.innerHTML = '<div class="empty-state">No team posts yet. Share a message, update, link, or source recommendation.</div>';
    return;
  }

  els.teamChatFeed.innerHTML = messages
    .map((item) => {
      const votes = item.votes || {};
      const addVotes = Object.values(votes).filter((vote) => vote === "add").length;
      const rejectVotes = Object.values(votes).filter((vote) => vote === "reject").length;
      const isRecommendation = item.type === "recommendation";
      const isLink = item.type === "link" || Boolean(item.url);
      return `
        <article class="team-post ${escapeHtml(item.type || "message")}">
          <header>
            <div>
              <strong>${escapeHtml(item.title || item.type || "Team post")}</strong>
              <small>${escapeHtml(item.owner || "local")} / ${escapeHtml(item.type || "message")} / ${new Date(item.createdAt).toLocaleString()}</small>
            </div>
            <span class="detail-chip">${escapeHtml(item.status || "posted")}</span>
          </header>
          <p>${escapeHtml(item.text || "")}</p>
          ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a>` : ""}
          ${
            isRecommendation
              ? `<div class="vote-row"><span>${addVotes} add</span><span>${rejectVotes} reject</span></div>`
              : ""
          }
          <div class="form-actions">
            ${
              isLink
                ? `<button class="ghost-button iconless" type="button" data-team-browser="${escapeHtml(item.id)}">Open in Browser</button>`
                : ""
            }
            ${
              isLink || isRecommendation
                ? `<button class="primary-button iconless" type="button" data-team-add="${escapeHtml(item.id)}">Add to Sources</button>`
                : ""
            }
            ${
              isRecommendation
                ? `<button class="ghost-button iconless" type="button" data-team-reject="${escapeHtml(item.id)}">Reject</button>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");

  els.teamChatFeed.querySelectorAll("[data-team-browser]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = findTeamMessage(button.dataset.teamBrowser);
      if (item?.url) openInAppBrowser(item.url, item.title || item.url);
    });
  });
  els.teamChatFeed.querySelectorAll("[data-team-add]").forEach((button) => {
    button.addEventListener("click", () => addTeamItemToSources(button.dataset.teamAdd));
  });
  els.teamChatFeed.querySelectorAll("[data-team-reject]").forEach((button) => {
    button.addEventListener("click", () => rejectTeamRecommendation(button.dataset.teamReject));
  });
}

function findTeamMessage(id) {
  return (state.archive.teamMessages || []).find((item) => item.id === id);
}

function updateTeamMessage(id, update) {
  state.archive.teamMessages = (state.archive.teamMessages || []).map((item) =>
    item.id === id ? { ...item, ...update, updatedAt: new Date().toISOString() } : item
  );
  persistArchive();
  renderTeamChat();
}

function addTeamItemToSources(id) {
  const item = findTeamMessage(id);
  if (!item) return;
  const source = {
    id: `src-team-${Date.now()}`,
    title: item.title || `Team source lead from ${item.owner || "local"}`,
    category: "Documents",
    species: "Cross-form",
    domain: "Metaphysics",
    sourceType: inferSourceType(item.url),
    url: item.url || "",
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    tradition: `Team recommendation / ${item.owner || "local"}`,
    terms: extractKeywords(`${item.title} ${item.text} ${item.url}`).slice(0, 8),
    notes: `Promoted from team ${item.type || "post"} by ${state.currentUser?.username || "local"}. ${item.text || ""}`,
    coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
  };
  state.archive.sources.unshift(source);
  state.selectedId = source.id;
  const votes = { ...(item.votes || {}), [state.currentUser?.username || "local"]: "add" };
  updateTeamMessage(id, { status: "added to sources", sourceId: source.id, votes });
  postTeamChatPayload({ action: "promote", id, sourceId: source.id, user: state.currentUser?.username || "local" });
  render();
}

function rejectTeamRecommendation(id) {
  const item = findTeamMessage(id);
  if (!item) return;
  const votes = { ...(item.votes || {}), [state.currentUser?.username || "local"]: "reject" };
  updateTeamMessage(id, { status: "rejected", votes });
  postTeamChatPayload({ action: "vote", id, decision: "reject", user: state.currentUser?.username || "local" });
}

function renderProfiles() {
  els.profileTabs.innerHTML = state.archive.profiles
    .map(
      (profile) => `
        <button class="profile-tab ${profile.username === state.activeProfileUsername ? "is-active" : ""}" type="button" data-profile="${escapeHtml(profile.username)}">
          ${escapeHtml(profile.username)}
        </button>
      `
    )
    .join("");
  els.profileTabs.querySelectorAll("[data-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeProfileUsername = button.dataset.profile;
      renderProfiles();
    });
  });

  const profile = getProfile(state.activeProfileUsername) || state.archive.profiles[0];
  if (!profile) return;
  els.profileForm.elements.displayName.value = profile.displayName || "";
  els.profileForm.elements.username.value = profile.username || "";
  els.profileForm.elements.animalForm.value = profile.animalForm || "";
  els.profileForm.elements.animalSpirits.value = profile.animalSpirits || "";
  els.profileForm.elements.identityStatement.value = profile.identityStatement || "";

  els.profileExtendedSections.innerHTML = PROFILE_SECTIONS.map((label, index) => {
    const value = profile.extended?.[index] || "";
    return `
      <label>
        ${escapeHtml(label)}
        <textarea name="extended${index}" rows="3">${escapeHtml(value)}</textarea>
      </label>
    `;
  }).join("");

  els.profileIntegrationSummary.textContent = buildProfileIntegrationSummary();
}

function handleSaveProfile(event) {
  event.preventDefault();
  const formData = new FormData(els.profileForm);
  const username = String(formData.get("username"));
  const index = state.archive.profiles.findIndex((profile) => profile.username === username);
  if (index < 0) return;

  state.archive.profiles[index] = {
    ...state.archive.profiles[index],
    displayName: String(formData.get("displayName")).trim(),
    animalForm: String(formData.get("animalForm")).trim(),
    animalSpirits: String(formData.get("animalSpirits")).trim(),
    identityStatement: String(formData.get("identityStatement")).trim(),
    extended: PROFILE_SECTIONS.map((_, sectionIndex) => String(formData.get(`extended${sectionIndex}`)).trim()),
    updatedAt: new Date().toISOString(),
  };
  persistArchive();
  renderProfiles();
  renderAgent();
}

function buildProfileIntegrationSummary() {
  return state.archive.profiles
    .map((profile) => `${profile.username}: ${profile.animalForm || "form unset"}; ${profile.identityStatement || "identity statement unset"}`)
    .join(" ");
}

function getFilteredSources() {
  return state.archive.sources.filter((source) => {
    const categoryOk = state.activeCategory === "All" || source.category === state.activeCategory;
    const speciesOk = state.activeSpecies === "All" || source.species === state.activeSpecies;
    const typeOk = state.activeSourceType === "All" || source.sourceType === state.activeSourceType;
    const text = [
      source.title,
      source.category,
      source.species,
      source.domain,
      source.sourceType,
      source.evidenceTier,
      source.citationStatus,
      source.tradition,
      source.url,
      source.notes,
      ...source.terms,
    ]
      .join(" ")
      .toLowerCase();
    const searchOk = !state.search || text.includes(state.search);
    return categoryOk && speciesOk && typeOk && searchOk;
  });
}

function rankSources(prompt) {
  const keywords = extractKeywords(prompt);
  return [...state.archive.sources]
    .map((source) => {
      const text = [source.title, source.notes, source.domain, source.species, source.sourceType, ...source.terms]
        .join(" ")
        .toLowerCase();
      const score = keywords.reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0);
      return { source, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.source);
}

function getCheckedSourceTypes(container) {
  return [...container.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
}

function getProfile(username) {
  return state.archive.profiles.find((profile) => profile.username === username);
}

function mergeById(baseItems = [], incomingItems = []) {
  const map = new Map();
  [...baseItems, ...incomingItems].forEach((item) => {
    if (!item?.id) return;
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  });
  return [...map.values()];
}

function loadArchive() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return normalizeArchive(SEED_DATA);
    return normalizeArchive(JSON.parse(saved));
  } catch {
    return normalizeArchive(SEED_DATA);
  }
}

function normalizeArchive(input) {
  const base = clone(SEED_DATA);
  const archive = { ...base, ...clone(input || {}) };
  archive.project = { ...base.project, ...(archive.project || {}) };
  archive.internalModel = { ...base.internalModel, ...(archive.internalModel || {}) };
  archive.internalModel.gateway = archive.internalModel.gateway || base.internalModel.gateway;
  archive.internalModel.synthesisScope = archive.internalModel.synthesisScope?.length
    ? archive.internalModel.synthesisScope
    : base.internalModel.synthesisScope;
  archive.backendCore = { ...base.backendCore, ...(archive.backendCore || {}) };
  archive.backendCore.stages = archive.backendCore.stages?.length ? archive.backendCore.stages : base.backendCore.stages;
  archive.backendCore.permissions = archive.backendCore.permissions?.length
    ? archive.backendCore.permissions
    : base.backendCore.permissions;
  archive.backendCore.hardLimits = archive.backendCore.hardLimits?.length
    ? archive.backendCore.hardLimits
    : base.backendCore.hardLimits;
  archive.externalApis = { ...base.externalApis, ...(archive.externalApis || {}) };
  archive.externalApis.parallelExtract = {
    ...base.externalApis.parallelExtract,
    ...(archive.externalApis.parallelExtract || {}),
  };
  archive.externalApis.localWebScraper = {
    ...base.externalApis.localWebScraper,
    ...(archive.externalApis.localWebScraper || {}),
  };
  archive.externalApis.googleProgrammableSearch = {
    ...base.externalApis.googleProgrammableSearch,
    ...(archive.externalApis.googleProgrammableSearch || {}),
  };
  archive.externalApis.nvidiaAIQResearch = {
    ...base.externalApis.nvidiaAIQResearch,
    ...(archive.externalApis.nvidiaAIQResearch || {}),
  };
  archive.referenceLibrary = mergeById(base.referenceLibrary, archive.referenceLibrary || []).map((reference) => ({
    sourceType: "PDF",
    pageCount: 0,
    detectedTerms: [],
    ...reference,
    detectedTerms: (reference.detectedTerms || [])
      .map((term) => (typeof term === "string" ? term : term.term))
      .filter(Boolean),
  }));
  archive.categories = (archive.categories?.length ? archive.categories : base.categories).filter((category) => category !== "Simulations");
  archive.domains = (archive.domains?.length ? archive.domains : base.domains).filter((domain) => domain !== "Simulation");
  archive.sourceTypes = archive.sourceTypes?.length ? archive.sourceTypes : SOURCE_TYPES;
  archive.sources = mergeById(base.sources, archive.sources || []).map((source) => ({
    sourceType: "URL",
    url: "",
    terms: [],
    coreLinks: [],
    ...source,
    category: source.category === "Simulations" ? "Theoretical Concepts" : source.category,
    domain: source.domain === "Simulation" ? "Theoretical Biology" : source.domain,
  }));
  archive.profiles = DEFAULT_PROFILES.map((profile) => ({
    ...profile,
    ...(archive.profiles || []).find((item) => item.username === profile.username),
  }));
  archive.extractionJobs = archive.extractionJobs || [];
  archive.extractionResults = archive.extractionResults || [];
  archive.autoBotFindings = archive.autoBotFindings || [];
  archive.importedFiles = archive.importedFiles || [];
  archive.browserHistory = archive.browserHistory || [];
  archive.parallelExtractRuns = archive.parallelExtractRuns || [];
  archive.webScrapeRuns = archive.webScrapeRuns || [];
  archive.teamMessages = archive.teamMessages || [];
  archive.agentMessages = archive.agentMessages?.length ? archive.agentMessages : clone(SEED_DATA.agentMessages);
  return archive;
}

function persistArchive() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.archive));
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function speciesInitial(species) {
  const map = {
    Wolf: "W",
    Fox: "F",
    Kitsune: "K",
    Dragon: "D",
    "Cross-form": "X",
  };
  return map[species] || species.slice(0, 1).toUpperCase();
}

function tierClass(tier) {
  const lower = tier.toLowerCase();
  if (lower.includes("scientific")) return "scientific";
  if (lower.includes("primary") || lower.includes("secondary")) return "primary";
  if (lower.includes("speculative") || lower.includes("experiential")) return "speculative";
  return "";
}

function extractKeywords(text) {
  return [...new Set(String(text).toLowerCase().match(/[a-z][a-z-]{3,}/g) || [])]
    .filter((word) => !["with", "from", "that", "this", "into", "about", "source", "sources", "research"].includes(word))
    .slice(0, 10);
}

function download(filename, type, contents) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyOrDownload(filename, contents) {
  try {
    await navigator.clipboard.writeText(contents);
    window.alert("Copied to clipboard.");
  } catch {
    download(filename, "application/json", contents);
  }
}

function buildTextDigest(archive) {
  const parallelApi = archive.externalApis?.parallelExtract || SEED_DATA.externalApis.parallelExtract;
  const scraperApi = archive.externalApis?.localWebScraper || SEED_DATA.externalApis.localWebScraper;
  const cseApi = archive.externalApis?.googleProgrammableSearch || SEED_DATA.externalApis.googleProgrammableSearch;
  const aiqApi = archive.externalApis?.nvidiaAIQResearch || SEED_DATA.externalApis.nvidiaAIQResearch;
  const lines = [
    archive.project.name,
    `Version: ${archive.project.version}`,
    "",
    "Epistemic policy:",
    archive.project.epistemicPolicy,
    "",
    "Connector note:",
    archive.project.aiConnectorNote,
    "",
    "Internal model core:",
    `${archive.internalModel.displayName} - ${archive.internalModel.status}`,
    `Gateway operation: ${getGatewayOperation(archive.internalModel)}(${archive.internalModel.targetParameter || "target_id"}) at ${getGatewayPath(archive.internalModel)}`,
    archive.internalModel.providerNote,
    "",
    "Backend mechanics core:",
    `${archive.backendCore.title}: ${archive.backendCore.summary}`,
    `Stages: ${archive.backendCore.stages.join(", ")}`,
    "",
    "Parallel Extract API:",
    `Local endpoint: ${parallelApi.localEndpoint}`,
    `Upstream endpoint: ${parallelApi.upstreamEndpoint}`,
    `Authentication: ${parallelApi.auth}`,
    `Saved request logs: ${archive.parallelExtractRuns?.length || 0}`,
    "",
    "Local Web Scraper:",
    `Local endpoint: ${scraperApi.localEndpoint}`,
    `Authentication: ${scraperApi.auth}`,
    `Saved request logs: ${archive.webScrapeRuns?.length || 0}`,
    `Keyword mode: ${scraperApi.keywordMode ? "enabled" : "disabled"}`,
    `Hidden search base: ${scraperApi.searchBaseUrl || GOOGLE_SEARCH_BASE_URL}`,
    `Safeguards: ${(scraperApi.safeguards || []).join(", ")}`,
    "",
    "Google Programmable Search:",
    `Search engine ID: ${cseApi.searchEngineId || GOOGLE_CSE_ID}`,
    `Script URL: ${cseApi.scriptUrl || GOOGLE_CSE_SCRIPT_URL}`,
    `Public URL: ${cseApi.publicUrl || GOOGLE_CSE_PUBLIC_URL}`,
    `Elements: ${(cseApi.elements || []).join(", ")}`,
    "",
    "Automated AI Research Bot:",
    `${archive.autoBotFindings?.length || 0} findings logged`,
    `${(archive.autoBotFindings || []).filter((entry) => entry.accepted).length} findings accepted into source sections`,
    "Cadence: opt-in, one attempt per minute, pauses for user review.",
    "",
    "File Import Layer:",
    `${archive.importedFiles?.length || 0} imported file logs`,
    `${(archive.importedFiles || []).reduce((sum, item) => sum + (item.recordsCreated || 0), 0)} source records created from uploaded files`,
    ...((archive.importedFiles || []).slice(0, 8).map((item) => `- ${item.fileName} (${item.parser}; ${item.recordsCreated} sources)`)),
    "",
    "In-App Browser:",
    `${archive.browserHistory?.length || 0} captured browser targets`,
    ...((archive.browserHistory || []).slice(0, 8).map((entry) => `- ${entry.url}`)),
    "",
    "Team Chat and Recommendations:",
    `${archive.teamMessages?.length || 0} team posts stored`,
    `${(archive.teamMessages || []).filter((item) => item.type === "recommendation" && item.status !== "rejected").length} open recommendations`,
    ...((archive.teamMessages || []).slice(0, 8).map((item) => `- ${item.type}: ${item.title || item.text} (${item.status || "posted"})${item.url ? ` - ${item.url}` : ""}`)),
    "",
    "NVIDIA AIQ Research:",
    `Backend URL: ${aiqApi.backendUrl}`,
    `Status: ${aiqApi.status}`,
    `Capabilities: ${(aiqApi.capabilities || []).join(", ")}`,
    "",
    "Extraction results:",
    ...((archive.extractionResults || []).length
      ? archive.extractionResults.flatMap((result) => [
          `- ${engineLabel(result.engine)} / ${result.createdAt} / ${result.itemCount || result.items?.length || 0} items`,
          `  Prompt: ${result.sourcePrompt || "Direct URL extraction run"}`,
          ...((result.items || []).slice(0, 4).map((item) => `  * ${item.title}${item.url ? ` - ${item.url}` : ""}`)),
        ])
      : ["- No normalized extraction results yet."]),
    "",
    "Uploaded reference layer:",
    ...archive.referenceLibrary.map(
      (reference) =>
        `- ${reference.title} (${reference.pageCount} pages; ${reference.evidenceTier}; ${reference.citationStatus})`
    ),
    "",
    "Contents:",
    ...archive.categories.map((category) => `- ${category}`),
    "",
    "User profiles:",
    ...archive.profiles.map((profile) => `- ${profile.username}: ${profile.animalForm}; ${profile.identityStatement}`),
    "",
    "Extraction jobs:",
    ...archive.extractionJobs.map((job) => `- ${job.prompt} [${job.mode}; ${job.depth}; ${job.sourceTypes.join(", ")}]`),
    "",
    "Source log:",
  ];
  archive.sources.forEach((source) => {
    lines.push(
      "",
      `## ${source.title}`,
      `Category: ${source.category}`,
      `Form: ${source.species}`,
      `Domain: ${source.domain}`,
      `Source type: ${source.sourceType}`,
      `Evidence: ${source.evidenceTier}`,
      `Citation: ${source.citationStatus}`,
      `Locator: ${source.url || "None yet"}`,
      `Terms: ${source.terms.join(", ") || "None yet"}`,
      `Notes: ${source.notes}`
    );
  });
  return lines.join("\n");
}

function buildHtmlDigest(archive) {
  const parallelApi = archive.externalApis?.parallelExtract || SEED_DATA.externalApis.parallelExtract;
  const scraperApi = archive.externalApis?.localWebScraper || SEED_DATA.externalApis.localWebScraper;
  const cseApi = archive.externalApis?.googleProgrammableSearch || SEED_DATA.externalApis.googleProgrammableSearch;
  const aiqApi = archive.externalApis?.nvidiaAIQResearch || SEED_DATA.externalApis.nvidiaAIQResearch;
  const rows = archive.sources
    .map(
      (source) => `
        <tr>
          <td>${escapeHtml(source.title)}</td>
          <td>${escapeHtml(source.category)}</td>
          <td>${escapeHtml(source.species)}</td>
          <td>${escapeHtml(source.domain)}</td>
          <td>${escapeHtml(source.sourceType)}</td>
          <td>${escapeHtml(source.evidenceTier)}</td>
          <td>${escapeHtml(source.citationStatus)}</td>
        </tr>
      `
    )
    .join("");
  const referenceRows = (archive.referenceLibrary || [])
    .map(
      (reference) => `
        <tr>
          <td>${escapeHtml(reference.title)}</td>
          <td>${escapeHtml(reference.pageCount)}</td>
          <td>${escapeHtml(reference.evidenceTier)}</td>
          <td>${escapeHtml(reference.citationStatus)}</td>
          <td>${escapeHtml(reference.backendUse)}</td>
        </tr>
      `
    )
    .join("");
  const resultRows = (archive.extractionResults || [])
    .flatMap((result) =>
      (result.items || []).map(
        (item) => `
          <tr>
            <td>${escapeHtml(engineLabel(result.engine))}</td>
            <td>${escapeHtml(result.sourcePrompt || "Direct URL extraction run")}</td>
            <td>${escapeHtml(item.title)}</td>
            <td>${item.url ? `<a href="${escapeHtml(item.url)}">${escapeHtml(item.url)}</a>` : ""}</td>
            <td>${escapeHtml(item.summary || "")}</td>
          </tr>
        `
      )
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>${escapeHtml(archive.project.name)} Digest</title>
<style>
body{font-family:Inter,Arial,sans-serif;margin:32px;color:#17211f;background:#f7f8f4}
h1{font-size:28px}p{max-width:900px;line-height:1.5;color:#59645f}
table{border-collapse:collapse;width:100%;background:#fff}th,td{border:1px solid #d8ded7;padding:10px;text-align:left;font-size:13px}th{background:#edf1ed}
</style>
<h1>${escapeHtml(archive.project.name)}</h1>
<p>${escapeHtml(archive.project.epistemicPolicy)}</p>
<p>${escapeHtml(archive.project.aiConnectorNote)}</p>
<h2>Internal Model Core</h2>
<p>${escapeHtml(archive.internalModel.displayName)} / ${escapeHtml(archive.internalModel.status)}. Gateway: ${escapeHtml(getGatewayOperation(archive.internalModel))}(${escapeHtml(archive.internalModel.targetParameter || "target_id")}) at ${escapeHtml(getGatewayPath(archive.internalModel))}.</p>
<p>${escapeHtml(archive.backendCore.title)}: ${escapeHtml(archive.backendCore.summary)}</p>
<h2>Parallel Extract API</h2>
<p>Local endpoint: ${escapeHtml(parallelApi.localEndpoint)}. Upstream endpoint: ${escapeHtml(parallelApi.upstreamEndpoint)}. Authentication: ${escapeHtml(parallelApi.auth)}.</p>
<h2>Local Web Scraper</h2>
<p>Local endpoint: ${escapeHtml(scraperApi.localEndpoint)}. Authentication: ${escapeHtml(scraperApi.auth)}. Keyword mode: ${escapeHtml(String(Boolean(scraperApi.keywordMode)))}. Hidden search base: ${escapeHtml(scraperApi.searchBaseUrl || GOOGLE_SEARCH_BASE_URL)}. Safeguards: ${escapeHtml((scraperApi.safeguards || []).join(", "))}.</p>
<h2>Google Programmable Search</h2>
<p>Search engine ID: ${escapeHtml(cseApi.searchEngineId || GOOGLE_CSE_ID)}. Script URL: ${escapeHtml(cseApi.scriptUrl || GOOGLE_CSE_SCRIPT_URL)}. Public URL: ${escapeHtml(cseApi.publicUrl || GOOGLE_CSE_PUBLIC_URL)}.</p>
<h2>Automated AI Research Bot</h2>
<p>${escapeHtml(String(archive.autoBotFindings?.length || 0))} findings logged; ${escapeHtml(String((archive.autoBotFindings || []).filter((entry) => entry.accepted).length))} accepted into source sections. Cadence: opt-in, one attempt per minute, pauses for user review.</p>
<h2>File Import Layer</h2>
<p>${escapeHtml(String(archive.importedFiles?.length || 0))} imported file logs; ${escapeHtml(String((archive.importedFiles || []).reduce((sum, item) => sum + (item.recordsCreated || 0), 0)))} source records created from uploaded files.</p>
<h2>In-App Browser</h2>
<p>${escapeHtml(String(archive.browserHistory?.length || 0))} captured browser targets. Latest: ${escapeHtml(archive.browserHistory?.[0]?.url || "none")}.</p>
<h2>Team Chat and Recommendations</h2>
<p>${escapeHtml(String(archive.teamMessages?.length || 0))} team posts stored; ${escapeHtml(String((archive.teamMessages || []).filter((item) => item.type === "recommendation" && item.status !== "rejected").length))} open recommendations.</p>
<h2>NVIDIA AIQ Research</h2>
<p>Backend URL: ${escapeHtml(aiqApi.backendUrl)}. Status: ${escapeHtml(aiqApi.status)}.</p>
<h2>Extraction Results</h2>
<table>
<thead><tr><th>Engine</th><th>Prompt</th><th>Title</th><th>URL</th><th>Summary</th></tr></thead>
<tbody>${resultRows || '<tr><td colspan="5">No normalized extraction results yet.</td></tr>'}</tbody>
</table>
<h2>Uploaded Reference Layer</h2>
<table>
<thead><tr><th>Title</th><th>Pages</th><th>Evidence</th><th>Citation</th><th>Backend Use</th></tr></thead>
<tbody>${referenceRows}</tbody>
</table>
<h2>Source Log</h2>
<table>
<thead><tr><th>Title</th><th>Category</th><th>Form</th><th>Domain</th><th>Type</th><th>Evidence</th><th>Citation</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</html>`;
}

async function copyCodexBrief() {
  const brief = `Continue building the CORE Shapeshifting Research Atlas as a rigorous internal archive and research operating system.

Preserve the evidence model: primary text, secondary scholarship, scientific analogy, experiential claim, and speculative framework.
Keep supernatural, metaphysical, occult, and esoteric claims explicitly labeled by source type and certainty.
The static app now includes gated local sign-in, source-type listings, extraction job queueing, profile-aware local synthesis, three editable user profiles, an uploaded Internal Core System Gateway model profile, ErydirCeisiwr backend mechanics stages, and a metadata-only uploaded PDF reference layer.
Next build priorities: real backend auth, secure password storage, live web/PDF/archive extraction, secure OpenAI API connector, database collaboration, and deployment.`;

  try {
    await navigator.clipboard.writeText(brief);
    window.alert("Codex brief copied.");
  } catch {
    download("codex-build-brief.txt", "text/plain", brief);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
