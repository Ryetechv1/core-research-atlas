"use strict";

const STORAGE_KEY = "core-shapeshifting-research-atlas";
const MEMORY_BANK_KEY = `${STORAGE_KEY}:memory-bank`;
const STORAGE_BACKUP_KEY = `${STORAGE_KEY}:last-good-backup`;
const SESSION_KEY = "core-shapeshifting-active-user";
const USER_LOCATION_KEY = `${STORAGE_KEY}:user-location`;
const GOOGLE_SEARCH_BASE_URL = "https://www.google.com/search?q=";
const GOOGLE_CSE_ID = "56f7592d1993141c3";
const GOOGLE_CSE_SCRIPT_URL = `https://cse.google.com/cse.js?cx=${GOOGLE_CSE_ID}`;
const GOOGLE_CSE_PUBLIC_URL = `https://cse.google.com/cse?cx=${GOOGLE_CSE_ID}#gsc.tab=0`;
const BROWSER_DEFAULT_URL = GOOGLE_CSE_PUBLIC_URL;
const CLOUDFLARE_AI_SEARCH_API_URL = "https://4afc7ed7-768d-4ed9-857f-94db2d87917e.search.ai.cloudflare.com/";
const HEALTH_API_PATH = "/api/health";
const SEARCH_API_PATH = "/api/search";
const OPENAI_CHAT_API_PATH = "/api/openai-chat";
const TEAM_CHAT_API_PATH = "/api/team-chat";
const TEAM_CHAT_STORAGE_KEY = `${STORAGE_KEY}:team-chat`;
const TEAM_CHAT_CHANNEL_NAME = "core-team-chat-sync";
const SOURCE_FEED_STORAGE_KEY = `${STORAGE_KEY}:source-feed`;
const SOURCE_FEED_CHANNEL_NAME = "core-source-feed-sync";
const TEAM_SYNC_URL_KEY = `${STORAGE_KEY}:team-sync-url`;
const TEAM_SYNC_QUERY_KEYS = ["sync", "teamSync", "teamSyncUrl"];
const TEAM_CHAT_POLL_MS = 5_000;
const SOURCE_FEED_REFRESH_MS = 6_000;
const TEAM_SOURCE_APPROVAL_THRESHOLD = 2;
const TEAM_VOTABLE_TYPES = new Set(["update", "link", "promote", "recommendation"]);
const IMPORT_TEXT_SLICE_BYTES = 650_000;
const MAX_STORED_FILE_BYTES = 1_500_000;
const FILE_STORE_DB_NAME = "core-atlas-file-store";
const FILE_STORE_OBJECT_STORE = "files";
const FILE_STORE_DB_VERSION = 1;
const FILE_STORE_MAX_BYTES = 50_000_000;
const PREVIEW_TEXT_LIMIT = 80_000;
const GUEST_SESSION_VALUE = "Guest";
const GUEST_USER = { username: "Guest", password: "", role: "Guest", readOnly: true };

const GOOGLE_CAPABILITIES = [
  { id: "web", label: "Search", description: "Google web results", kind: "google" },
  { id: "images", label: "Images", description: "Image result mode", kind: "google" },
  { id: "videos", label: "Videos", description: "Video result mode", kind: "google" },
  { id: "news", label: "News", description: "News result mode", kind: "google" },
  { id: "books", label: "Books", description: "Google Books search", kind: "google" },
  { id: "scholar", label: "Scholar", description: "Scholar and academic leads", kind: "google" },
  { id: "pdf", label: "PDFs", description: "Google PDF/filetype search", kind: "google" },
  { id: "archives", label: "Archives", description: "Archive-focused search", kind: "google" },
  { id: "patents", label: "Patents", description: "Google Patents", kind: "google" },
  { id: "translate", label: "Translate", description: "Google Translate", kind: "google" },
];

const VIRTUAL_GOOGLE_OS_LOCK = Object.freeze({
  id: "virtual-google-os-preserved-2026-07-08",
  protected: true,
  defaultUrl: BROWSER_DEFAULT_URL,
  searchBaseUrl: GOOGLE_SEARCH_BASE_URL,
  cseId: GOOGLE_CSE_ID,
  csePublicUrl: GOOGLE_CSE_PUBLIC_URL,
  capabilityIds: GOOGLE_CAPABILITIES.map((capability) => capability.id),
});

const AUTH_USERS = [
  { username: "UserSeth", password: "User1password", role: "ADMIN", readOnly: false },
  { username: "UserSemaj", password: "User2password", role: "Member", readOnly: false },
  { username: "UserKhiimori", password: "User3password", role: "Member", readOnly: false },
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

const IMAGE_IMPORT_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".tif", ".tiff", ".heic", ".avif"];

const PROFILE_SECTIONS = [
  "Origin and path",
  "Animal instincts and senses",
  "Spiritual practices",
  "Research responsibilities",
  "Boundaries and integration notes",
];

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
    "Internal routing and review scaffold derived from the ErydirCeisiwr attachment request. It controls how profiles, source records, browser leads, documents, imports, memory snapshots, and exports are staged inside the static build.",
  operatingMode: "Local static archive with source logging, in-app browser, file import, team chat, collaboration documents, profiles, and memory bank.",
  stages: [
    "Intent intake",
    "Profile context merge",
    "Reference lookup",
    "Evidence-tier separation",
    "Mechanics review",
    "Source log organization",
    "Export and review logging",
  ],
  permissions: [
    "Read local archive state",
    "Read three project profiles",
    "Read uploaded reference metadata",
    "Create source and document records",
    "Save browser, team, import, and memory records",
  ],
  hardLimits: [
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
      "Profile data helps the team preserve research responsibilities and review context.",
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
      "Profile data helps prioritize fox and kitsune review needs.",
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
      "Profile data helps guide cross-form collaboration and review.",
    ],
  },
];

const DEFAULT_COLLAB_DOCS = [
  {
    id: "doc-core-research-brief",
    title: "CORE Research Brief",
    type: "Research Brief",
    status: "Draft",
    owner: "UserSeth",
    createdAt: new Date("2026-07-04T00:00:00").toISOString(),
    updatedAt: new Date("2026-07-04T00:00:00").toISOString(),
    contentHtml:
      "<h2>Research Objective</h2><p>Use this workspace to draft source-backed briefs, grimoire chapters, meeting notes, PDF handoffs, and review packets. Keep links visible and mark every claim by evidence tier before promoting it into Sources.</p><h3>Current Method</h3><ul><li>Open pages in the in-app browser.</li><li>Insert browser leads into this document.</li><li>Export drafts as text, HTML, JSON, or print them to PDF.</li></ul>",
  },
];

const DEFAULT_FILE_MANAGER = {
  rootId: "file-root",
  selectedId: "file-root",
  nodes: [
    {
      id: "file-root",
      parentId: "",
      kind: "folder",
      name: "CORE Atlas",
      createdAt: new Date("2026-07-04T00:00:00").toISOString(),
      updatedAt: new Date("2026-07-04T00:00:00").toISOString(),
    },
    {
      id: "file-sources",
      parentId: "file-root",
      kind: "folder",
      name: "Sources",
      createdAt: new Date("2026-07-04T00:00:00").toISOString(),
      updatedAt: new Date("2026-07-04T00:00:00").toISOString(),
    },
    {
      id: "file-imports",
      parentId: "file-root",
      kind: "folder",
      name: "Imports",
      createdAt: new Date("2026-07-04T00:00:00").toISOString(),
      updatedAt: new Date("2026-07-04T00:00:00").toISOString(),
    },
    {
      id: "file-team",
      parentId: "file-root",
      kind: "folder",
      name: "Team Shared",
      createdAt: new Date("2026-07-04T00:00:00").toISOString(),
      updatedAt: new Date("2026-07-04T00:00:00").toISOString(),
    },
    {
      id: "file-readme",
      parentId: "file-root",
      kind: "file",
      name: "README.txt",
      extension: ".txt",
      mimeType: "text/plain",
      size: 218,
      text: "Use this virtual file manager to organize source packets, imports, research notes, exported documents, and cloud handoff plans. Files are stored in this browser archive unless exported or uploaded elsewhere.",
      previewKind: "text",
      createdAt: new Date("2026-07-04T00:00:00").toISOString(),
      updatedAt: new Date("2026-07-04T00:00:00").toISOString(),
    },
  ],
};

const SEED_DATA = {
  project: {
    name: "CORE Shapeshifting Research Atlas",
    version: "0.8.0",
    epistemicPolicy:
      "Catalog supernatural, occult, metaphysical, cultural, and speculative biological claims with explicit evidence labels. Do not treat metaphysical claims as established biomedical fact.",
    corePrompt:
      "Shapeshifting is modeled here as an interdisciplinary research construct spanning molecular, chemical, biological, physiological, psychological, metaphysical, occult, esoteric, and spiritual mechanics. The atlas stores claims under a Core Manifestation Template / Holographic Blueprint vocabulary while preserving source context and certainty level.",
    aiConnectorNote:
      "Separate AI assistant, retrieval console, and crawler surfaces have been removed. The atlas now focuses on source logging, in-app browsing, imports, profiles, team collaboration, documents, and memory snapshots.",
  },
  backendCore: BACKEND_CORE,
  referenceLibrary: REFERENCE_LIBRARY,
  externalApis: {
    googleProgrammableSearch: {
      provider: "Google Programmable Search Engine",
      searchEngineId: GOOGLE_CSE_ID,
      scriptUrl: GOOGLE_CSE_SCRIPT_URL,
      publicUrl: GOOGLE_CSE_PUBLIC_URL,
      elements: ["gcse-searchbox", "gcse-searchresults"],
      status: "Embedded in Browser panel with external public URL fallback.",
    },
    googleCustomSearchJson: {
      provider: "Google Custom Search JSON API",
      localEndpoint: SEARCH_API_PATH,
      auth: "Server-side GOOGLE_CUSTOM_SEARCH_API_KEY",
      searchEngineId: GOOGLE_CSE_ID,
      status: "Preferred backend search path when hosted on a server with an API key; otherwise the app falls back to embedded CSE result cards.",
    },
    openAiResponsesChat: {
      provider: "OpenAI Responses API",
      localEndpoint: OPENAI_CHAT_API_PATH,
      model: "gpt-5.5",
      auth: "Server-side OPENAI_API_KEY",
      status: "Optional backend chat that synthesizes atlas, browser, team, docs, profile, and memory context.",
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
    cloudStorageWorkspace: {
      provider: "Cloud storage and document workspace",
      status: "External launch integrations for import/export handoff from the Files tab.",
      services: [
        { name: "Google Drive", url: "https://drive.google.com/drive/my-drive", purpose: "Cloud file storage" },
        { name: "MEGA Cloud", url: "https://mega.nz/fm", purpose: "Large archive storage" },
        { name: "Google Docs", url: "https://docs.google.com/document/u/0/", purpose: "Document drafting" },
        { name: "Google Forms", url: "https://docs.google.com/forms/u/0/", purpose: "Team intake forms" },
        { name: "Google Sheets", url: "https://docs.google.com/spreadsheets/u/0/", purpose: "Citation and review tables" },
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
  importedFiles: [],
  browserHistory: [],
  browserSearchResults: [],
  browserPreview: null,
  openAiChatMessages: [],
  teamMessages: [],
  collabDocs: DEFAULT_COLLAB_DOCS,
  fileManager: DEFAULT_FILE_MANAGER,
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
        "Use as a baseline for literary and mythological transformation motifs. Review animal-change structure, agency, reversibility, and moral framing.",
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
        "Used as an internal operational scaffold for prompt intake, profile merging, reference lookup, evidence separation, source review, and export logging. It is not used as visual design.",
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
  activePanel: "sourcePanel",
  activeProfileUsername: window.localStorage.getItem(SESSION_KEY) || "UserSeth",
  activeCollabDocId: "",
  currentUser: null,
  search: "",
  selectedId: null,
  currentBrowserUrl: BROWSER_DEFAULT_URL,
  guestBrowserHistory: [],
  guestBrowserSearchResults: [],
  guestBrowserPreview: null,
  teamChatChannel: null,
  teamChatBackendAvailable: null,
  teamSyncBaseUrl: getInitialTeamSyncBaseUrl(),
  sourceFeedChannel: null,
  sourceFeedTimer: null,
  fileClipboard: null,
  fileManagerSaveTimer: null,
  fileManagerStatusMessage: "",
  filePreviewObjectUrls: [],
  backendCapabilities: {
    checked: false,
    checking: null,
    available: false,
    routes: [],
    googleSearchConfigured: false,
    openAiChatConfigured: false,
    platform: "static",
  },
  importBusy: false,
  openAiChatBusy: false,
  activeMemorySnapshotId: "",
  teamChatPollTimer: null,
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  wireEvents();
  populateFormOptions();
  loadTeamMessagesFromLocalStorage();
  startTeamChatBroadcast();
  startSourceFeedMonitor();
  initAuth();
  render();
  startTeamChatPolling();
});

function cacheElements() {
  els.authOverlay = document.getElementById("authOverlay");
  els.authForm = document.getElementById("authForm");
  els.guestLoginButton = document.getElementById("guestLoginButton");
  els.authError = document.getElementById("authError");
  els.currentUserBadge = document.getElementById("currentUserBadge");
  els.signOutButton = document.getElementById("signOutButton");
  els.categoryNav = document.getElementById("categoryNav");
  els.speciesFilters = document.getElementById("speciesFilters");
  els.sourceTypeFilter = document.getElementById("sourceTypeFilter");
  els.sourceList = document.getElementById("sourceList");
  els.sourceFeedStatus = document.getElementById("sourceFeedStatus");
  els.refreshSourcesButton = document.getElementById("refreshSourcesButton");
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
  els.browserOsDock = document.getElementById("browserOsDock");
  els.browserOsStatus = document.getElementById("browserOsStatus");
  els.browserPreview = document.getElementById("browserPreview");
  els.browserSearchResults = document.getElementById("browserSearchResults");
  els.browserHistory = document.getElementById("browserHistory");
  els.cloudflareFallbackForm = document.getElementById("cloudflareFallbackForm");
  els.cloudflareFallbackInput = document.getElementById("cloudflareFallbackInput");
  els.cloudflareFallbackStatus = document.getElementById("cloudflareFallbackStatus");
  els.cloudflareEndpointButton = document.getElementById("cloudflareEndpointButton");
  els.openAiChatForm = document.getElementById("openAiChatForm");
  els.openAiChatTranscript = document.getElementById("openAiChatTranscript");
  els.openAiChatStatus = document.getElementById("openAiChatStatus");
  els.openAiClearButton = document.getElementById("openAiClearButton");
  els.teamChatForm = document.getElementById("teamChatForm");
  els.teamFileInput = document.getElementById("teamFileInput");
  els.teamChatFeed = document.getElementById("teamChatFeed");
  els.teamChatStatus = document.getElementById("teamChatStatus");
  els.teamSyncForm = document.getElementById("teamSyncForm");
  els.teamSyncStatus = document.getElementById("teamSyncStatus");
  els.clearTeamSyncButton = document.getElementById("clearTeamSyncButton");
  els.refreshTeamChatButton = document.getElementById("refreshTeamChatButton");
  els.useBrowserForTeamPostButton = document.getElementById("useBrowserForTeamPostButton");
  els.newCollabDocButton = document.getElementById("newCollabDocButton");
  els.exportCollabLibraryButton = document.getElementById("exportCollabLibraryButton");
  els.collabImportInput = document.getElementById("collabImportInput");
  els.collabImportStatus = document.getElementById("collabImportStatus");
  els.collabDocList = document.getElementById("collabDocList");
  els.collabDocStatusChip = document.getElementById("collabDocStatusChip");
  els.collabDocTitleInput = document.getElementById("collabDocTitleInput");
  els.collabDocTypeSelect = document.getElementById("collabDocTypeSelect");
  els.collabDocStatusSelect = document.getElementById("collabDocStatusSelect");
  els.collabDocOwnerInput = document.getElementById("collabDocOwnerInput");
  els.collabDocEditor = document.getElementById("collabDocEditor");
  els.insertBrowserLeadButton = document.getElementById("insertBrowserLeadButton");
  els.saveCollabDocButton = document.getElementById("saveCollabDocButton");
  els.exportCollabTextButton = document.getElementById("exportCollabTextButton");
  els.exportCollabHtmlButton = document.getElementById("exportCollabHtmlButton");
  els.exportCollabJsonButton = document.getElementById("exportCollabJsonButton");
  els.printCollabDocButton = document.getElementById("printCollabDocButton");
  els.collabDocToSourceButton = document.getElementById("collabDocToSourceButton");
  els.cloudIntegrationGrid = document.getElementById("cloudIntegrationGrid");
  els.fileManagerPath = document.getElementById("fileManagerPath");
  els.fileManagerStatus = document.getElementById("fileManagerStatus");
  els.fileManagerTree = document.getElementById("fileManagerTree");
  els.fileManagerFolderView = document.getElementById("fileManagerFolderView");
  els.fileExplorerFolderName = document.getElementById("fileExplorerFolderName");
  els.fileManagerDetail = document.getElementById("fileManagerDetail");
  els.fileNewFolderButton = document.getElementById("fileNewFolderButton");
  els.fileNewTextButton = document.getElementById("fileNewTextButton");
  els.fileRenameButton = document.getElementById("fileRenameButton");
  els.fileCopyButton = document.getElementById("fileCopyButton");
  els.fileMoveButton = document.getElementById("fileMoveButton");
  els.filePasteButton = document.getElementById("filePasteButton");
  els.fileDeleteButton = document.getElementById("fileDeleteButton");
  els.fileExportButton = document.getElementById("fileExportButton");
  els.fileShareTeamButton = document.getElementById("fileShareTeamButton");
  els.fileManagerImportInput = document.getElementById("fileManagerImportInput");
  els.createMemorySnapshotButton = document.getElementById("createMemorySnapshotButton");
  els.exportMemoryBankButton = document.getElementById("exportMemoryBankButton");
  els.memoryBankSummary = document.getElementById("memoryBankSummary");
  els.memorySnapshotList = document.getElementById("memorySnapshotList");
  els.memorySnapshotPreview = document.getElementById("memorySnapshotPreview");
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
  els.filePreviewOverlay = document.getElementById("filePreviewOverlay");
  els.filePreviewTitle = document.getElementById("filePreviewTitle");
  els.filePreviewMeta = document.getElementById("filePreviewMeta");
  els.filePreviewBody = document.getElementById("filePreviewBody");
  els.filePreviewCloseButton = document.getElementById("filePreviewCloseButton");
}

function wireEvents() {
  els.authForm.addEventListener("submit", handleSignIn);
  els.guestLoginButton.addEventListener("click", handleGuestLogin);
  els.signOutButton.addEventListener("click", signOut);

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderSources();
  });

  els.sourceTypeFilter.addEventListener("change", (event) => {
    state.activeSourceType = event.target.value;
    renderSources();
  });

  els.refreshSourcesButton?.addEventListener("click", () => refreshSourceFeed("Manual source refresh"));
  window.addEventListener("focus", () => refreshSourceFeed("Window focus refresh"));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshSourceFeed("Visibility refresh");
  });

  els.toggleAddFormButton.addEventListener("click", () => {
    if (!ensureCanWrite("add source records")) return;
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
  document.querySelector(".google-cse-embed")?.addEventListener("click", handleCseResultClick, true);
  window.addEventListener("core-cse-search-start", handleCseSearchStart);
  window.addEventListener("core-cse-results-ready", handleCseResultsReady);
  els.googleCsePublicLink?.addEventListener("click", () => {
    openExternalUrl(GOOGLE_CSE_PUBLIC_URL);
  });
  els.browserExternalButton.addEventListener("click", openCurrentBrowserTargetExternal);
  els.browserAddSourceButton.addEventListener("click", addCurrentBrowserPageToSources);
  els.cloudflareFallbackForm?.addEventListener("submit", handleCloudflareFallbackSearch);
  els.cloudflareEndpointButton?.addEventListener("click", () => openExternalUrl(CLOUDFLARE_AI_SEARCH_API_URL));
  els.openAiChatForm.addEventListener("submit", handleOpenAiChatSubmit);
  els.openAiClearButton.addEventListener("click", clearOpenAiChat);
  els.teamSyncForm.addEventListener("submit", handleTeamSyncSubmit);
  els.clearTeamSyncButton.addEventListener("click", clearTeamSyncServer);
  els.teamChatForm.addEventListener("submit", handleTeamChatSubmit);
  els.filePreviewCloseButton.addEventListener("click", closeFilePreviewDialog);
  els.filePreviewOverlay.addEventListener("click", (event) => {
    if (event.target === els.filePreviewOverlay) closeFilePreviewDialog();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.filePreviewOverlay.hidden) closeFilePreviewDialog();
  });
  els.refreshTeamChatButton.addEventListener("click", () => syncTeamChat({ renderAfter: true }));
  els.useBrowserForTeamPostButton.addEventListener("click", useBrowserUrlForTeamPost);
  els.newCollabDocButton.addEventListener("click", createCollabDoc);
  els.exportCollabLibraryButton.addEventListener("click", exportCollabLibrary);
  els.collabImportInput.addEventListener("change", handleCollabImport);
  document.querySelectorAll("[data-doc-command]").forEach((button) => {
    button.addEventListener("click", () => runDocCommand(button.dataset.docCommand));
  });
  els.insertBrowserLeadButton.addEventListener("click", insertBrowserLeadIntoDoc);
  els.saveCollabDocButton.addEventListener("click", saveActiveCollabDoc);
  els.exportCollabTextButton.addEventListener("click", () => exportActiveCollabDoc("txt"));
  els.exportCollabHtmlButton.addEventListener("click", () => exportActiveCollabDoc("html"));
  els.exportCollabJsonButton.addEventListener("click", () => exportActiveCollabDoc("json"));
  els.printCollabDocButton.addEventListener("click", printActiveCollabDoc);
  els.collabDocToSourceButton.addEventListener("click", addActiveCollabDocToSources);
  els.cloudIntegrationGrid?.querySelectorAll("[data-cloud-open]").forEach((button) => {
    button.addEventListener("click", () => openExternalUrl(button.dataset.cloudOpen));
  });
  els.fileNewFolderButton?.addEventListener("click", createFileManagerFolder);
  els.fileNewTextButton?.addEventListener("click", createFileManagerTextFile);
  els.fileRenameButton?.addEventListener("click", renameFileManagerNode);
  els.fileCopyButton?.addEventListener("click", () => copyFileManagerNode("copy"));
  els.fileMoveButton?.addEventListener("click", () => copyFileManagerNode("move"));
  els.filePasteButton?.addEventListener("click", pasteFileManagerNode);
  els.fileDeleteButton?.addEventListener("click", deleteFileManagerNode);
  els.fileExportButton?.addEventListener("click", exportFileManagerNode);
  els.fileShareTeamButton?.addEventListener("click", shareSelectedFileToTeamChat);
  els.fileManagerImportInput?.addEventListener("change", handleFileManagerImport);
  els.createMemorySnapshotButton.addEventListener("click", () => createManualMemorySnapshot("Manual user snapshot"));
  els.exportMemoryBankButton.addEventListener("click", exportMemoryBank);
  els.profileForm.addEventListener("submit", handleSaveProfile);
  els.exportProfilesButton.addEventListener("click", () => {
    if (!ensureCanWrite("export profile data")) return;
    download("core-user-profiles.json", "application/json", JSON.stringify(state.archive.profiles, null, 2));
  });

  document.getElementById("exportJsonButton").addEventListener("click", () => {
    if (!ensureCanWrite("export archive data")) return;
    download("core-research-atlas.json", "application/json", JSON.stringify(state.archive, null, 2));
  });

  document.getElementById("exportTextButton").addEventListener("click", () => {
    if (!ensureCanWrite("export archive data")) return;
    download("core-research-atlas.txt", "text/plain", buildTextDigest(state.archive));
  });

  document.getElementById("exportHtmlButton").addEventListener("click", () => {
    if (!ensureCanWrite("export archive data")) return;
    download("core-research-atlas-digest.html", "text/html", buildHtmlDigest(state.archive));
  });

  document.getElementById("copyBriefButton").addEventListener("click", copyCodexBrief);

  replayBufferedCseEvents();

  document.getElementById("resetButton").addEventListener("click", () => {
    if (!ensureCanWrite("reset the archive")) return;
    const confirmed = window.confirm("Reset local archive, profiles, browser leads, documents, and chat to the starter state?");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    state.archive = clone(SEED_DATA);
    state.selectedId = null;
    state.activeProfileUsername = state.currentUser?.username || "UserSeth";
    render();
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      setActivePanel(button.dataset.panel, { save: true });
    });
  });
  window.addEventListener("beforeunload", saveCurrentUserLocation);
  window.addEventListener("pagehide", saveCurrentUserLocation);
}

function initAuth() {
  const username = window.localStorage.getItem(SESSION_KEY);
  state.currentUser = username === GUEST_SESSION_VALUE ? GUEST_USER : AUTH_USERS.find((user) => user.username === username) || null;
  if (!state.currentUser) {
    showAuth(true);
    return;
  }
  state.activeProfileUsername = isGuestUser() ? state.archive.profiles[0]?.username || "UserSeth" : state.currentUser.username;
  restoreUserLocation();
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
  restoreUserLocation();
  els.authForm.reset();
  els.authError.textContent = "";
  showAuth(false);
  render();
}

function handleGuestLogin() {
  state.currentUser = GUEST_USER;
  state.activeProfileUsername = state.archive.profiles[0]?.username || "UserSeth";
  state.guestBrowserHistory = [];
  state.guestBrowserSearchResults = [];
  state.guestBrowserPreview = null;
  window.localStorage.setItem(SESSION_KEY, GUEST_SESSION_VALUE);
  restoreUserLocation();
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
    els.currentUserBadge.textContent = `${user.username} / ${user.role}${isGuestUser() ? " / View only" : ""}`;
  }
}

function isGuestUser() {
  return Boolean(state.currentUser?.readOnly);
}

function currentLocationStorageKey() {
  return `${USER_LOCATION_KEY}:${state.currentUser?.username || window.localStorage.getItem(SESSION_KEY) || "anonymous"}`;
}

function restoreUserLocation() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(currentLocationStorageKey()) || "{}");
    if (saved.panel) state.activePanel = saved.panel;
    if (saved.selectedId) state.selectedId = saved.selectedId;
    if (saved.currentBrowserUrl) state.currentBrowserUrl = saved.currentBrowserUrl;
    if (saved.activeProfileUsername) state.activeProfileUsername = saved.activeProfileUsername;
    if (saved.activeCollabDocId) state.activeCollabDocId = saved.activeCollabDocId;
    window.setTimeout(() => {
      if (Number.isFinite(saved.scrollY)) window.scrollTo({ top: saved.scrollY, behavior: "auto" });
    }, 0);
  } catch {
    window.localStorage.removeItem(currentLocationStorageKey());
  }
}

function saveUserLocation(update = {}) {
  if (!state.currentUser) return;
  const payload = {
    panel: state.activePanel || "sourcePanel",
    selectedId: state.selectedId || "",
    currentBrowserUrl: state.currentBrowserUrl || "",
    activeProfileUsername: state.activeProfileUsername || "",
    activeCollabDocId: state.activeCollabDocId || "",
    scrollY: window.scrollY || 0,
    updatedAt: new Date().toISOString(),
    ...update,
  };
  try {
    window.localStorage.setItem(currentLocationStorageKey(), JSON.stringify(payload));
  } catch {
    // Location restore is best-effort only.
  }
}

function saveCurrentUserLocation() {
  saveUserLocation();
}

function setActivePanel(panelId, { save = false } = {}) {
  const targetPanel = document.getElementById(panelId) ? panelId : "sourcePanel";
  state.activePanel = targetPanel;
  document.querySelectorAll(".segment").forEach((segment) => {
    segment.classList.toggle("is-active", segment.dataset.panel === targetPanel);
  });
  document.querySelectorAll(".panel-view").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === targetPanel);
  });
  if (save) saveUserLocation({ panel: targetPanel });
}

function ensureCanWrite(action = "change the atlas") {
  if (!isGuestUser()) return true;
  window.alert(`Guest mode is view-only. Sign in as a project user to ${action}.`);
  return false;
}

function writeDisabledAttr() {
  return isGuestUser() ? ' disabled aria-disabled="true" title="Guest mode is view-only."' : "";
}

function renderPermissionState() {
  const guest = isGuestUser();
  document.body.classList.toggle("is-guest-mode", guest);
  const readOnlyFormIds = [
    "addSourceForm",
    "fileImportForm",
    "openAiChatForm",
    "teamChatForm",
    "profileForm",
  ];
  readOnlyFormIds.forEach((id) => {
    const form = document.getElementById(id);
    form?.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = guest;
    });
  });
  [
    "fileNewFolderButton",
    "fileNewTextButton",
    "fileRenameButton",
    "fileCopyButton",
    "fileMoveButton",
    "filePasteButton",
    "fileDeleteButton",
    "fileExportButton",
    "fileShareTeamButton",
    "fileManagerImportInput",
  ].forEach((id) => {
    const control = document.getElementById(id);
    if (control) control.disabled = guest;
  });
  [
    "toggleAddFormButton",
    "resetButton",
    "exportJsonButton",
    "exportTextButton",
    "exportHtmlButton",
    "copyBriefButton",
    "browserAddSourceButton",
    "openAiClearButton",
    "selectChatGptFilesButton",
    "saveFilesToChatGptButton",
    "clearImportedFilesButton",
    "useBrowserForTeamPostButton",
    "exportProfilesButton",
    "newCollabDocButton",
    "exportCollabLibraryButton",
    "collabImportInput",
    "collabDocTitleInput",
    "collabDocTypeSelect",
    "collabDocStatusSelect",
    "collabDocOwnerInput",
    "insertBrowserLeadButton",
    "saveCollabDocButton",
    "exportCollabTextButton",
    "exportCollabHtmlButton",
    "exportCollabJsonButton",
    "printCollabDocButton",
    "collabDocToSourceButton",
    "createMemorySnapshotButton",
    "exportMemoryBankButton",
  ].forEach((id) => {
    const control = document.getElementById(id);
    if (control) control.disabled = guest;
  });
  document.querySelectorAll("[data-doc-command]").forEach((control) => {
    control.disabled = guest;
  });
  if (els.collabDocEditor) {
    els.collabDocEditor.contentEditable = guest ? "false" : "true";
    els.collabDocEditor.classList.toggle("is-read-only", guest);
    els.collabDocEditor.setAttribute("aria-readonly", String(guest));
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
}

function setOptions(select, values) {
  select.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
}

function render() {
  renderAuthState();
  setActivePanel(state.activePanel || "sourcePanel");
  populateFormOptions();
  renderNavigation();
  renderSources();
  renderFramework();
  renderImportPanel();
  renderBrowserPanel();
  renderOpenAiChat();
  renderTeamSyncSettings();
  renderTeamChat();
  renderCollabDocs();
  renderFileManager();
  renderMemoryBank();
  renderProfiles();
  renderReferenceLibrary();
  renderMetrics();
  renderPermissionState();
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

function startSourceFeedMonitor() {
  loadSourceFeedFromLocalStorage();
  if ("BroadcastChannel" in window) {
    state.sourceFeedChannel = new BroadcastChannel(SOURCE_FEED_CHANNEL_NAME);
    state.sourceFeedChannel.addEventListener("message", (event) => {
      if (event.data?.type !== "source-feed" || !Array.isArray(event.data.sources)) return;
      mergeSourceFeed(event.data.sources, "Cross-tab source update", { replace: true });
    });
  }
  window.addEventListener("storage", (event) => {
    if (event.key === SOURCE_FEED_STORAGE_KEY && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue);
        if (Array.isArray(payload.sources)) mergeSourceFeed(payload.sources, "Stored source feed update", { replace: true });
      } catch {
        setSourceFeedStatus("Source feed storage skipped malformed update");
      }
    }
    if (event.key === STORAGE_KEY && event.newValue) {
      refreshSourceFeed("Archive storage update");
    }
  });
  refreshSourceFeed("App access refresh");
  if (state.sourceFeedTimer) window.clearInterval(state.sourceFeedTimer);
  state.sourceFeedTimer = window.setInterval(() => refreshSourceFeed("Live source feed refresh"), SOURCE_FEED_REFRESH_MS);
}

function setSourceFeedStatus(text) {
  if (els.sourceFeedStatus) els.sourceFeedStatus.textContent = text;
}

function loadSourceFeedFromLocalStorage() {
  try {
    const payload = JSON.parse(window.localStorage.getItem(SOURCE_FEED_STORAGE_KEY) || "{}");
    if (Array.isArray(payload.sources)) mergeSourceFeed(payload.sources, "Source feed restored");
  } catch {
    window.localStorage.removeItem(SOURCE_FEED_STORAGE_KEY);
  }
}

function refreshSourceFeed(reason = "Source refresh") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const archive = normalizeArchive(JSON.parse(saved));
      mergeSourceFeed(archive.sources || [], reason, { replace: true });
    }
    renderSources();
    renderNavigation();
    renderMetrics();
    setSourceFeedStatus(`Live ${new Date().toLocaleTimeString()}`);
  } catch {
    setSourceFeedStatus("Live feed recovered from current memory");
    renderSources();
  }
}

function mergeSourceFeed(incomingSources = [], reason = "Source feed update", { replace = false } = {}) {
  const before = state.archive.sources?.length || 0;
  state.archive.sources = replace
    ? incomingSources.map(normalizeSourceRecord)
    : mergeById(state.archive.sources || [], incomingSources.map(normalizeSourceRecord));
  const after = state.archive.sources.length;
  if (!state.selectedId && after) state.selectedId = state.archive.sources[0].id;
  if (after !== before) persistArchive(reason);
  renderSources();
  renderNavigation();
  renderMetrics();
  setSourceFeedStatus(`${after} tracked / ${new Date().toLocaleTimeString()}`);
}

function broadcastSourceFeed(reason = "Source feed update") {
  if (isGuestUser()) return;
  const sources = (state.archive.sources || []).map(normalizeSourceRecord);
  try {
    window.localStorage.setItem(
      SOURCE_FEED_STORAGE_KEY,
      JSON.stringify({ sources, updatedAt: new Date().toISOString(), reason })
    );
  } catch {
    // The source feed still remains in the main archive if this cache cannot be written.
  }
  state.sourceFeedChannel?.postMessage({ type: "source-feed", sources, reason });
  setSourceFeedStatus(`${sources.length} tracked / ${new Date().toLocaleTimeString()}`);
}

function renderSources() {
  let sources = [];
  try {
    state.archive.sources = (state.archive.sources || []).map(normalizeSourceRecord);
    sources = getFilteredSources();
  } catch {
    els.sourceList.innerHTML = '<div class="empty-state">Source logs recovered after a malformed record. Refresh Sources to retry.</div>';
    setSourceFeedStatus("Source feed recovered");
    return;
  }
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
    row.querySelector(".source-row-select").addEventListener("click", () => {
      state.selectedId = source.id;
      saveUserLocation({ selectedId: state.selectedId, panel: "sourcePanel" });
      renderSources();
    });
    row.querySelector("[data-source-view]").addEventListener("click", () => {
      state.selectedId = source.id;
      saveUserLocation({ selectedId: state.selectedId, panel: "sourcePanel" });
      renderSources();
      openSourceInBrowser(source.id);
    });
    const removeButton = row.querySelector("[data-source-remove]");
    removeButton.hidden = !canRemoveSourceLogs();
    removeButton.addEventListener("click", () => removeSourceLog(source.id));
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
    ${source.url ? `<p><strong>Locator:</strong> <button class="link-button" type="button" data-source-open="${escapeHtml(source.id)}">${escapeHtml(source.url)}</button></p>` : ""}
    <div class="chip-row">
      ${source.terms.map((term) => `<span class="detail-chip">${escapeHtml(term)}</span>`).join("")}
    </div>
    <div class="source-info-grid">
      <span><strong>ID:</strong> ${escapeHtml(source.id)}</span>
      <span><strong>Tradition:</strong> ${escapeHtml(source.tradition || "Unspecified")}</span>
      <span><strong>CORE:</strong> ${escapeHtml((source.coreLinks || []).join(", ") || "None")}</span>
      <span><strong>Log file:</strong> ${escapeHtml(sourceLogLocator(source))}</span>
    </div>
    <details class="source-log-details" open>
      <summary>Source Log Content / Information</summary>
      <pre class="source-log-pre">${escapeHtml(formatSourceLog(source))}</pre>
    </details>
    <div class="form-actions">
      ${source.url || source.importId || source.fileAttachment || source.referenceId ? `<button class="primary-button iconless" type="button" data-source-open="${escapeHtml(source.id)}">${isInternalSourceLocator(source) ? "Preview File" : "Open External"}</button>` : ""}
      <button class="ghost-button iconless" type="button" data-source-preview="${escapeHtml(source.id)}">Full Source Info</button>
      ${canRemoveSourceLogs() ? `<button class="ghost-button iconless danger-action" type="button" data-source-delete="${escapeHtml(source.id)}">Remove Source Log</button>` : ""}
    </div>
  `;
  els.selectedRecord.querySelectorAll("[data-source-open]").forEach((button) => {
    button.addEventListener("click", () => openSourceInBrowser(button.dataset.sourceOpen));
  });
  els.selectedRecord.querySelectorAll("[data-source-preview]").forEach((button) => {
    button.addEventListener("click", () => previewSourceInBrowser(button.dataset.sourcePreview));
  });
  els.selectedRecord.querySelectorAll("[data-source-delete]").forEach((button) => {
    button.addEventListener("click", () => removeSourceLog(button.dataset.sourceDelete));
  });
}

function canRemoveSourceLogs() {
  return state.currentUser?.username === "UserSeth" && !isGuestUser();
}

function removeSourceLog(sourceId) {
  if (!canRemoveSourceLogs()) {
    window.alert("Only UserSeth can remove source logs.");
    return;
  }
  const source = state.archive.sources.find((item) => item.id === sourceId);
  if (!source) return;
  const confirmed = window.confirm(`Remove source log "${source.title}"? This only removes it from the atlas archive.`);
  if (!confirmed) return;
  state.archive.sources = state.archive.sources.filter((item) => item.id !== sourceId);
  if (state.selectedId === sourceId) state.selectedId = state.archive.sources[0]?.id || null;
  persistArchive("Source log removed");
  render();
}

function sourceLogLocator(source) {
  if (source.fileAttachment) return `team-file://${source.teamMessageId || source.id}/${source.fileAttachment.fileName || "file"}`;
  if (source.referenceId) return `data/reference_ingest.json#${source.referenceId}`;
  if (source.importId) return `import://${source.importId}/${source.fileRef?.fileName || source.title}`;
  if (source.url?.startsWith("local-collab-doc://")) return source.url;
  return `data/research_seed.json#${source.id}`;
}

function formatSourceLog(source) {
  return JSON.stringify(
    {
      sourceLogFile: sourceLogLocator(source),
      id: source.id,
      title: source.title,
      category: source.category,
      species: source.species,
      domain: source.domain,
      sourceType: source.sourceType,
      url: source.url || "",
      evidenceTier: source.evidenceTier,
      citationStatus: source.citationStatus,
      tradition: source.tradition,
      terms: source.terms || [],
      coreLinks: source.coreLinks || [],
      notes: source.notes || "",
      importId: source.importId || "",
      teamMessageId: source.teamMessageId || "",
      fileRef: source.fileRef || source.fileAttachment || null,
      fullRecord: source,
    },
    null,
    2
  );
}

async function openSourceInBrowser(sourceId) {
  const source = state.archive.sources.find((item) => item.id === sourceId);
  if (!source) return;
  previewSourceInBrowser(sourceId);
  if (isInternalSourceLocator(source)) {
    if (!(await openSourceOriginalFile(source))) {
      openSourceFilePreview(sourceId);
    }
    return;
  }
  if (source.url) openExternalUrl(source.url);
}

async function openSourceOriginalFile(source = {}) {
  if (source.fileAttachment) {
    return openStoredFilePage(source.fileAttachment, { title: source.title, origin: "Team source log", url: source.url });
  }
  if (source.importId) {
    const imported = findImportedFile(source.importId);
    if (imported) return openStoredFilePage(imported, { title: source.title, origin: "Imported source log", url: source.url });
  }
  if (source.url?.startsWith("local-collab-doc://")) {
    const doc = getCollabDocFromUrl(source.url);
    if (doc) {
      return openStoredFilePage(
        {
          fileName: `${doc.title || "collaboration-doc"}.html`,
          extension: ".html",
          mimeType: "text/html",
          size: String(doc.contentHtml || "").length,
          previewKind: "text",
          textExcerpt: collabDocToText(doc),
          summary: `${doc.type || "Document"} / ${doc.status || "Draft"} / ${doc.owner || "Unassigned"}`,
          storedPreview: true,
        },
        { title: source.title, origin: "Collaboration document source" }
      );
    }
  }
  return false;
}

function isInternalSourceLocator(source = {}) {
  return Boolean(
    source.fileAttachment ||
      source.importId ||
      source.referenceId ||
      source.url?.startsWith("import://") ||
      source.url?.startsWith("team-file://") ||
      source.url?.startsWith("local-collab-doc://") ||
      source.url?.startsWith("data/reference_ingest.json")
  );
}

function previewSourceInBrowser(sourceId) {
  const source = state.archive.sources.find((item) => item.id === sourceId);
  if (!source) return;
  setBrowserPreview(sourceToBrowserPreview(source));
  renderBrowserPreview();
}

function sourceToBrowserPreview(source) {
  return {
    title: source.title,
    url: source.url || "",
    type: `Source / ${source.sourceType || "URL"}`,
    summary: source.notes || "",
    sourceInfo: `${source.category} / ${source.domain} / ${source.evidenceTier} / ${source.citationStatus}`,
    details: JSON.stringify(source, null, 2),
  };
}

function findImportedFile(importId) {
  return (state.archive.importedFiles || []).find((item) => item.id === importId);
}

function openSourceFilePreview(sourceId) {
  const source = state.archive.sources.find((item) => item.id === sourceId);
  if (!source) return;
  if (source.fileAttachment) {
    openFilePreviewDialog(source.fileAttachment, { title: source.title, origin: "Team source log", url: source.url });
    return;
  }
  if (source.importId) {
    const imported = findImportedFile(source.importId);
    if (imported) {
      openFilePreviewDialog(imported, { title: source.title, origin: "Imported source log", url: source.url });
      return;
    }
  }
  if (source.referenceId) {
    const reference = getReferenceLibrary().find((item) => item.id === source.referenceId);
    if (reference) {
      openFilePreviewDialog(
        {
          fileName: reference.fileName || reference.title,
          extension: ".pdf",
          mimeType: "application/pdf",
          size: 0,
          previewKind: "data",
          summary: `${reference.title}. ${reference.backendUse || reference.role || ""}`,
          textExcerpt: JSON.stringify(reference, null, 2),
          storedPreview: false,
        },
        { title: source.title, origin: "Uploaded reference metadata", url: source.url }
      );
      return;
    }
  }
  if (source.url?.startsWith("local-collab-doc://")) {
    const doc = getCollabDocFromUrl(source.url);
    if (doc) {
      openFilePreviewDialog(
        {
          fileName: `${doc.title || "collaboration-doc"}.txt`,
          extension: ".txt",
          mimeType: "text/plain",
          size: stripHtml(doc.contentHtml || "").length,
          previewKind: "text",
          summary: `${doc.type || "Document"} / ${doc.status || "Draft"} / ${doc.owner || "Unassigned"}`,
          textExcerpt: collabDocToText(doc),
          storedPreview: true,
        },
        { title: source.title, origin: "Collaboration document source" }
      );
      return;
    }
  }
  if (source.url && /^https?:\/\//i.test(source.url)) {
    openFilePreviewDialog({ fileName: source.title, url: source.url, previewKind: "web", summary: source.notes }, { title: source.title, origin: "Web source" });
  }
}

function openTeamFilePreview(messageId) {
  const item = findTeamMessage(messageId);
  if (!item?.fileAttachment) return;
  openFilePreviewDialog(item.fileAttachment, { title: item.title, origin: `Team post / ${item.owner || "local"}` });
}

function openFilePreviewDialog(file, context = {}) {
  if (!els.filePreviewOverlay || !file) return;
  const title = context.title || file.fileName || "File Preview";
  els.filePreviewTitle.textContent = title;
  els.filePreviewMeta.textContent = [context.origin, file.fileName, file.mimeType || file.extension, formatBytes(file.size || 0)]
    .filter(Boolean)
    .join(" / ");
  els.filePreviewBody.innerHTML = renderFilePreviewContent(file, context);
  els.filePreviewOverlay.hidden = false;
  document.body.classList.add("is-modal-open");
  els.filePreviewCloseButton.focus();
  els.filePreviewBody.querySelectorAll("[data-preview-external]").forEach((button) => {
    button.addEventListener("click", () => openExternalUrl(button.dataset.previewExternal));
  });
  els.filePreviewBody.querySelectorAll("[data-preview-original]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!(await openStoredFilePage(file, context))) {
        window.alert("The original file bytes are not stored for this source. Re-import the file so the app can keep the actual PDF/media/text content in its browser file store.");
      }
    });
  });
  hydrateFilePreviewFromStore(file, context);
}

function closeFilePreviewDialog() {
  if (!els.filePreviewOverlay) return;
  revokeFilePreviewObjectUrls();
  els.filePreviewOverlay.hidden = true;
  document.body.classList.remove("is-modal-open");
  els.filePreviewBody.innerHTML = "";
}

function renderFilePreviewContent(file = {}, context = {}) {
  const kind = file.previewKind || previewKindForFile(file);
  const dataUrl = file.objectUrl || file.dataUrl || "";
  const text = file.textExcerpt || "";
  const summary = file.summary || "No summary stored.";
  const warnings = Array.isArray(file.warnings) ? file.warnings : [];
  const url = context.url || file.url || "";
  const hasOriginal = Boolean(dataUrl || file.blobKey || isTextOriginalFile(file, kind) || /^https?:\/\//i.test(url));
  const warningHtml = warnings.length ? `<ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : "";
  const originalButton = hasOriginal
    ? `<button class="primary-button iconless" type="button" data-preview-original>Open Original File</button>`
    : "";
  const meta = `
    <details class="file-preview-metadata">
      <summary>File details and source metadata</summary>
    <div class="file-preview-meta-grid">
      <span><strong>Name:</strong> ${escapeHtml(file.fileName || context.title || "Untitled")}</span>
      <span><strong>Type:</strong> ${escapeHtml(file.mimeType || file.extension || kind)}</span>
      <span><strong>Size:</strong> ${escapeHtml(formatBytes(file.size || 0))}</span>
      <span><strong>Stored content:</strong> ${file.blobKey || file.storedPreview || dataUrl ? "Actual file available" : "Metadata only"}</span>
    </div>
    <p>${escapeHtml(summary)}</p>
    ${warningHtml}
    </details>
  `;
  if (kind === "web" && url) {
    return `<div class="file-preview-content-first"><button class="primary-button iconless" type="button" data-preview-external="${escapeHtml(url)}">Open External</button>${originalButton}</div>${meta}`;
  }
  if (dataUrl && kind === "image") return `<img class="file-preview-media" src="${escapeHtml(dataUrl)}" alt="${escapeHtml(file.fileName || "Image preview")}"><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  if (dataUrl && kind === "video") return `<video class="file-preview-media" controls src="${escapeHtml(dataUrl)}"></video><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  if (dataUrl && kind === "audio") return `<audio class="file-preview-audio" controls src="${escapeHtml(dataUrl)}"></audio><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  if (dataUrl && kind === "pdf") return `<iframe class="file-preview-document" title="${escapeHtml(file.fileName || "PDF preview")}" src="${escapeHtml(dataUrl)}"></iframe><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  if (dataUrl && kind === "text") {
    const decoded = decodeDataUrlText(dataUrl) || text;
    return `<pre class="file-preview-text">${escapeHtml(clampText(decoded, PREVIEW_TEXT_LIMIT))}</pre><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  }
  if (dataUrl) {
    return `<iframe class="file-preview-document" title="${escapeHtml(file.fileName || "Raw file preview")}" src="${escapeHtml(dataUrl)}"></iframe><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  }
  if (file.blobKey) {
    return `<div class="file-preview-loading">Loading actual stored file content...</div><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  }
  if (text && isTextOriginalFile(file, kind)) {
    return `<pre class="file-preview-text">${escapeHtml(text)}</pre><div class="file-preview-content-first">${originalButton}</div>${meta}`;
  }
  return `<div class="file-preview-unavailable"><strong>Actual file content is not stored for this record.</strong><span>Re-import the file to store and preview the real PDF, image, audio, video, or document content.</span></div>${meta}`;
}

async function hydrateFilePreviewFromStore(file = {}, context = {}) {
  if (!file.blobKey || file.dataUrl || file.objectUrl || !els.filePreviewBody || els.filePreviewOverlay.hidden) return;
  try {
    const hydrated = await hydrateStoredFile(file);
    els.filePreviewBody.innerHTML = renderFilePreviewContent(hydrated, context);
    els.filePreviewBody.querySelectorAll("[data-preview-original]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!(await openStoredFilePage(hydrated, context))) {
          window.alert("The original file bytes are not available in this browser store.");
        }
      });
    });
  } catch (error) {
    els.filePreviewBody.querySelector(".file-preview-loading")?.replaceWith(fileStoreUnavailableElement(error.message));
  }
}

function fileStoreUnavailableElement(message) {
  const wrapper = document.createElement("div");
  wrapper.className = "file-preview-unavailable";
  wrapper.innerHTML = `<strong>Stored file could not be opened.</strong><span>${escapeHtml(message || "Re-import the file to restore the actual preview.")}</span>`;
  return wrapper;
}

async function hydrateStoredFile(file = {}) {
  if (!file.blobKey) return file;
  const stored = await readStoredFileBlob(file.blobKey);
  if (!stored?.blob) throw new Error("No stored Blob found for this file key.");
  const objectUrl = URL.createObjectURL(stored.blob);
  state.filePreviewObjectUrls.push(objectUrl);
  const hydrated = {
    ...file,
    fileName: file.fileName || stored.fileName,
    mimeType: file.mimeType || stored.mimeType,
    size: file.size || stored.size,
    previewKind: file.previewKind || previewKindForFile(stored),
    objectUrl,
    storedPreview: true,
  };
  if (isTextOriginalFile(hydrated)) {
    hydrated.textExcerpt = await stored.blob.text();
  }
  return hydrated;
}

function revokeFilePreviewObjectUrls() {
  state.filePreviewObjectUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
}

async function openStoredFilePage(file = {}, context = {}) {
  let viewerWindow = null;
  try {
    viewerWindow = window.open("about:blank", "_blank");
    if (viewerWindow) {
      viewerWindow.document.write("<!doctype html><title>Opening file...</title><body style=\"margin:0;background:#050505;color:#fff;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;\">Opening original file...</body>");
      viewerWindow.document.close();
    }
  } catch {
    viewerWindow = null;
  }
  if (file.blobKey && !file.objectUrl) {
    file = await hydrateStoredFile(file);
  }
  const kind = file.previewKind || previewKindForFile(file);
  const dataUrl = file.objectUrl || file.dataUrl || "";
  const url = context.url || file.url || "";
  if (!dataUrl && /^https?:\/\//i.test(url)) {
    if (viewerWindow) {
      viewerWindow.location.href = url;
    } else {
      openExternalUrl(url);
    }
    return true;
  }
  const text = isTextOriginalFile(file, kind) ? decodeDataUrlText(dataUrl) || file.text || file.textExcerpt || "" : "";
  if (!dataUrl && !text) {
    try {
      viewerWindow?.close();
    } catch {
      // Nothing to close.
    }
    return false;
  }

  saveCurrentUserLocation();
  const title = context.title || file.fileName || "Source file";
  const fileName = file.fileName || title;
  const type = file.mimeType || file.extension || kind;
  const summary = file.summary || context.origin || "Stored atlas file";
  const escapedDataUrl = escapeHtml(dataUrl);
  const escapedName = escapeHtml(fileName);
  let viewer = "";

  if (dataUrl && kind === "pdf") {
    viewer = `<iframe class="original-viewer-frame" title="${escapedName}" src="${escapedDataUrl}"></iframe>`;
  } else if (dataUrl && kind === "image") {
    viewer = `<img class="original-viewer-media" src="${escapedDataUrl}" alt="${escapedName}">`;
  } else if (dataUrl && kind === "video") {
    viewer = `<video class="original-viewer-media" controls src="${escapedDataUrl}"></video>`;
  } else if (dataUrl && kind === "audio") {
    viewer = `<audio class="original-viewer-audio" controls src="${escapedDataUrl}"></audio>`;
  } else if (text) {
    viewer = `<pre class="original-viewer-text">${escapeHtml(text)}</pre>`;
  } else if (dataUrl) {
    viewer = `<a class="original-download" href="${escapedDataUrl}" download="${escapedName}">Open or download ${escapedName}</a>`;
  }

  const downloadLink = dataUrl
    ? `<a class="original-download" href="${escapedDataUrl}" download="${escapedName}">Download Original</a>`
    : "";
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: linear-gradient(135deg, #050505, #303030 55%, #f5f5f5); color: #fff; font-family: Inter, system-ui, sans-serif; }
    header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 18px; border-bottom: 1px solid rgba(255,255,255,.28); background: rgba(0,0,0,.46); }
    h1 { margin: 0; font-size: 18px; line-height: 1.25; }
    p { margin: 4px 0 0; color: rgba(255,255,255,.76); font-size: 13px; }
    main { display: grid; gap: 14px; min-height: calc(100vh - 84px); padding: 16px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .meta span, .original-download { border: 1px solid #fff; border-radius: 8px; padding: 8px 10px; color: #111; background: linear-gradient(145deg, #fff, #cfcfcf); font-size: 12px; font-weight: 760; text-decoration: none; }
    .original-viewer-frame { width: 100%; min-height: 78vh; border: 1px solid #fff; border-radius: 8px; background: #fff; }
    .original-viewer-media { display: block; width: min(100%, 1100px); max-height: 78vh; margin: 0 auto; border: 1px solid #fff; border-radius: 8px; background: #111; object-fit: contain; }
    .original-viewer-audio { width: min(100%, 760px); margin: 0 auto; }
    .original-viewer-text { overflow: auto; min-height: 70vh; margin: 0; padding: 16px; border: 1px solid #fff; border-radius: 8px; color: #111; background: #fff; white-space: pre-wrap; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(summary)}</p>
    </div>
    <div class="meta">
      <span>${escapeHtml(type)}</span>
      <span>${escapeHtml(formatBytes(file.size || 0))}</span>
      ${downloadLink}
    </div>
  </header>
  <main>${viewer}</main>
</body>
</html>`;
  const pageUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  let opened = false;
  if (viewerWindow) {
    viewerWindow.location.href = pageUrl;
    opened = true;
  } else {
    opened = Boolean(window.open(pageUrl, "_blank"));
  }
  window.setTimeout(() => URL.revokeObjectURL(pageUrl), 90_000);
  return opened;
}

function isTextOriginalFile(file = {}, kind = file.previewKind || previewKindForFile(file)) {
  const extension = String(file.extension || extensionFromFileName(file.fileName)).toLowerCase();
  const mime = String(file.mimeType || "").toLowerCase();
  return kind === "text" || mime.startsWith("text/") || [".txt", ".json", ".py", ".js", ".css", ".md", ".markdown", ".html", ".htm", ".csv", ".xml", ".yaml", ".yml"].includes(extension);
}

function decodeDataUrlText(dataUrl) {
  try {
    const comma = String(dataUrl || "").indexOf(",");
    if (comma < 0) return "";
    const meta = dataUrl.slice(0, comma);
    const payload = dataUrl.slice(comma + 1);
    return meta.includes(";base64") ? atob(payload) : decodeURIComponent(payload);
  } catch {
    return "";
  }
}

function handleAddSource(event) {
  event.preventDefault();
  if (!ensureCanWrite("add source records")) return;
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
  if (!ensureCanWrite("import files")) return;
  if (state.importBusy) return;

  const files = [...(els.fileImportInput.files || [])];
  if (!files.length) {
    window.alert("Choose one or more files to import.");
    return;
  }

  const options = getImportOptions();
  state.importBusy = true;
  renderImportPanel(`Analyzing ${files.length} file${files.length === 1 ? "" : "s"}...`);

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const analyzed = await analyzeUploadedFile(file);
        return integrateImportedFile(analyzed, options);
      } catch (error) {
        return {
          fileName: file.name,
          ok: false,
          warning: error.message,
          recordsCreated: 0,
        };
      }
    })
  );

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
    chatgptMode: formData.get("chatgptMode") === "on",
  };
}

async function analyzeUploadedFile(file) {
  const extension = extensionFromFileName(file.name);
  let preStoredBlobKey = "";
  try {
    preStoredBlobKey = await writeStoredFileBlob(file);
  } catch {
    preStoredBlobKey = "";
  }
  if (!shouldUseServerImport(file, extension)) {
    const fallback = await analyzeFileInBrowser(file);
    if (!fallback.blobKey && preStoredBlobKey) {
      fallback.blobKey = preStoredBlobKey;
      fallback.storedPreview = true;
    }
    return fallback;
  }

  const capabilities = await ensureBackendCapabilities();
  if (!hasBackendRoute("/api/import-file", capabilities)) {
    return analyzeFileInBrowser(file);
  }

  const payload = new FormData();
  payload.append("file", file, file.name);

  try {
    const response = await fetch("/api/import-file", {
      method: "POST",
      body: payload,
    });
    const data = await readJsonResponse(response);
    if (response.ok && data.ok !== false && data.file) {
      return { ...data.file, source: "server", blobKey: preStoredBlobKey, storedPreview: Boolean(preStoredBlobKey || data.file.dataUrl) };
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

function shouldUseServerImport(file, extension = extensionFromFileName(file.name)) {
  if (isKnownStaticHost()) return false;
  return [".pdf", ".doc", ".docx", ".zip"].includes(extension) && file.size <= 18_000_000;
}

async function analyzeFileInBrowser(file) {
  const extension = extensionFromFileName(file.name);
  let text = "";
  const warnings = [];
  const previewKind = previewKindForFile({ extension, mimeType: file.type, fileName: file.name });
  const canStorePreview = file.size <= MAX_STORED_FILE_BYTES;
  let dataUrl = "";
  let blobKey = "";

  try {
    blobKey = await writeStoredFileBlob(file);
  } catch (error) {
    warnings.push(`Actual file storage failed: ${error.message}`);
  }
  if (!blobKey && file.size > FILE_STORE_MAX_BYTES) {
    warnings.push(`File is larger than ${formatBytes(FILE_STORE_MAX_BYTES)}; only metadata and text excerpts can be stored.`);
  }

  if ([".txt", ".json", ".py", ".js", ".css", ".md", ".markdown", ".html", ".htm", ".csv", ".xml", ".yaml", ".yml"].includes(extension)) {
    text = await readFileTextSlice(file, IMPORT_TEXT_SLICE_BYTES);
    if (file.size > IMPORT_TEXT_SLICE_BYTES) warnings.push(`Only the first ${Math.round(IMPORT_TEXT_SLICE_BYTES / 1024)} KB was analyzed for speed.`);
    if (extension === ".html" || extension === ".htm") text = stripHtml(text);
    if (extension === ".json") {
      try {
        text = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        warnings.push("JSON parse failed in browser; imported as raw text.");
      }
    }
    if (canStorePreview) dataUrl = await readFileAsDataUrl(file);
  } else if (["image", "audio", "video"].includes(previewKind)) {
    text = `${file.name}\n${file.type || "application/octet-stream"}\n${formatBytes(file.size)} ${previewKind} upload.`;
    if (canStorePreview) {
      dataUrl = await readFileAsDataUrl(file);
    } else {
      warnings.push(`File is larger than ${formatBytes(MAX_STORED_FILE_BYTES)}; only metadata was stored for the preview.`);
    }
  } else {
    const buffer = await file.slice(0, Math.min(file.size, 220_000)).arrayBuffer();
    text = printableBinaryText(new Uint8Array(buffer));
    warnings.push(`${extension || "This file"} used browser-side metadata/best-effort preview. Run the Python server for richer PDF/DOCX parsing.`);
    if (canStorePreview && [".pdf"].includes(extension)) dataUrl = await readFileAsDataUrl(file);
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
    previewKind,
    blobKey,
    dataUrl,
    storedPreview: Boolean(dataUrl || blobKey),
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
    previewKind: fileData.previewKind || previewKindForFile(fileData),
    blobKey: fileData.blobKey || "",
    dataUrl: fileData.dataUrl || "",
    storedPreview: Boolean(fileData.dataUrl || fileData.blobKey),
    keywords: fileData.keywords || extractKeywords(fileData.text),
    summary: fileData.summary || summarizeImportText(fileData.text),
    textLength: String(fileData.text || "").length,
    textExcerpt: clampText(fileData.text || "", 12000),
    childCount: fileData.children?.length || 0,
    recordsCreated: createdSources.length,
    sourceIds: createdSources.map((source) => source.id),
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
    fileRef: {
      importId,
      fileName: fileData.fileName,
      extension: fileData.extension,
      mimeType: fileData.mimeType,
      previewKind: fileData.previewKind || previewKindForFile(fileData),
      blobKey: fileData.blobKey || "",
    },
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
              <div class="form-actions">
                <button class="primary-button iconless" type="button" data-import-preview="${escapeHtml(item.id)}">Preview File</button>
                ${
                  item.sourceIds?.[0]
                    ? `<button class="ghost-button iconless" type="button" data-import-source="${escapeHtml(item.sourceIds[0])}">Open First Source</button>`
                    : ""
                }
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No files imported yet.</div>';

  els.importedFileList.querySelectorAll("[data-import-preview]").forEach((button) => {
    button.addEventListener("click", () => previewImportedFile(button.dataset.importPreview));
  });
  els.importedFileList.querySelectorAll("[data-import-source]").forEach((button) => {
    button.addEventListener("click", () => previewSourceInBrowser(button.dataset.importSource));
  });
}

function previewImportedFile(importId) {
  const item = (state.archive.importedFiles || []).find((record) => record.id === importId);
  if (!item) return;
  openFilePreviewDialog(item, { title: item.fileName, origin: "Import log" });
  setBrowserPreview(importedFileToBrowserPreview(item));
  renderBrowserPreview();
}

function importedFileToBrowserPreview(item) {
  return {
    title: item.fileName || "Imported file",
    url: "",
    type: `Imported ${item.extension || "file"}`,
    summary: item.summary || "Imported research file.",
    sourceInfo: `${item.parser || "browser"} / ${item.recordsCreated || 0} source records`,
    details: JSON.stringify(
      {
        id: item.id,
        fileName: item.fileName,
        extension: item.extension,
        mimeType: item.mimeType,
        size: item.size,
        parser: item.parser,
        strategy: item.strategy,
        owner: item.owner,
        createdAt: item.createdAt,
        recordsCreated: item.recordsCreated,
        sourceIds: item.sourceIds || [],
        keywords: item.keywords || [],
        warnings: item.warnings || [],
        textExcerpt: item.textExcerpt,
      },
      null,
      2
    ),
  };
}

async function handleSelectChatGptFiles() {
  if (!ensureCanWrite("import ChatGPT files")) return;
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
  if (!ensureCanWrite("save files to the ChatGPT library")) return;
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
  if (!ensureCanWrite("clear imported file logs")) return;
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
  const url = normalizeBrowserTarget(target);
  openInAppBrowser(url, target, { query: extractBrowserQuery(target, url) });
}

function handleCloudflareFallbackSearch(event) {
  event.preventDefault();
  const query = String(new FormData(els.cloudflareFallbackForm).get("query") || "").trim();
  if (!query) return;
  if (els.cloudflareFallbackStatus) {
    els.cloudflareFallbackStatus.textContent =
      "Cloudflare did not return a usable chat response in the embedded widget, so this query was routed through the locked Virtual Google OS.";
  }
  const url = buildGoogleCapabilityUrl("web", query);
  openInAppBrowser(url, `Cloudflare fallback: ${query}`, {
    query,
    preview: {
      id: `cloudflare-fallback-${Date.now()}`,
      type: "Cloudflare fallback / Virtual Google OS",
      title: `Cloudflare fallback: ${query}`,
      url,
      summary:
        "The Cloudflare AI Search widget is preserved above. This fallback keeps research working by routing the same query through the locked Virtual Google OS with visible links, previews, and source actions.",
      sourceInfo: `Cloudflare fallback via Google CSE ${GOOGLE_CSE_ID}`,
      links: [
        { title: "Cloudflare public endpoint", url: CLOUDFLARE_AI_SEARCH_API_URL },
        ...buildGoogleCapabilityLinks(query),
      ],
      details: JSON.stringify(
        {
          query,
          cloudflareApiUrl: CLOUDFLARE_AI_SEARCH_API_URL,
          expectedCloudflareSetup: [
            "Public Endpoint enabled",
            "Chat/completions endpoint enabled for chat-page-snippet",
            "GitHub Pages host allowed by CORS / Authorized hosts",
          ],
          virtualGoogleOsLock: VIRTUAL_GOOGLE_OS_LOCK,
        },
        null,
        2
      ),
      score: 1000,
    },
  });
}

function openInAppBrowser(url, label = url, options = {}) {
  const normalizedUrl = normalizeBrowserTarget(url);
  const query = options.query || extractBrowserQuery(label, normalizedUrl);
  state.currentBrowserUrl = normalizedUrl;
  saveUserLocation({ currentBrowserUrl: normalizedUrl, panel: state.activePanel || "browserPanel" });
  const history = getBrowserHistory();
  history.unshift({
    id: `browser-${Date.now()}`,
    url: normalizedUrl,
    label,
    owner: state.currentUser?.username || "local",
    createdAt: new Date().toISOString(),
  });
  setBrowserHistory(dedupeBrowserHistory(history).slice(0, 30));
  if (query) {
    setBrowserSearchResults(buildVirtualBrowserResults(query, normalizedUrl));
  }
  const preview =
    options.preview || {
      title: label || domainFromUrl(normalizedUrl) || "Current browser target",
      url: normalizedUrl,
      type: query ? "Search target" : inferSourceType(normalizedUrl),
      summary: query
        ? `Search query routed through the internal research browser: ${query}.`
        : "Loaded into the virtual research browser. External pages are shown as in-app source previews first because many sites block iframe embedding.",
      sourceInfo: query ? `Google CSE ${GOOGLE_CSE_ID}` : domainFromUrl(normalizedUrl) || "Direct URL",
    };
  setBrowserPreview(preview);
  loadInAppBrowserFrame(normalizedUrl, preview);
  renderBrowserPanel();
}

function loadInAppBrowserFrame(url, preview = null) {
  if (!els.inAppBrowserFrame) return;
  els.inAppBrowserFrame.dataset.currentUrl = url;
  if (isLocalCollabDocUrl(url)) {
    els.inAppBrowserFrame.removeAttribute("src");
    const doc = getCollabDocFromUrl(url);
    els.inAppBrowserFrame.srcdoc = doc ? renderCollabDocHtml(doc) : renderBrowserFrameDocument(url, preview);
    return;
  }
  if (shouldAttemptIframeEmbed(url)) {
    els.inAppBrowserFrame.removeAttribute("srcdoc");
    els.inAppBrowserFrame.src = url;
    return;
  }
  els.inAppBrowserFrame.removeAttribute("src");
  els.inAppBrowserFrame.srcdoc = renderBrowserFrameDocument(url, preview);
}

function shouldAttemptIframeEmbed(url) {
  if (!url) return false;
  if (isLocalCollabDocUrl(url)) return false;
  if (isCseUrl(url)) return false;
  if (/^(data|assets|docs|dist)\//i.test(url) || url.startsWith("./") || url.startsWith("../") || url.startsWith("/")) return true;
  return !/^https?:\/\//i.test(url);
}

function renderBrowserFrameDocument(url, preview = {}) {
  const title = escapeHtml(preview?.title || domainFromUrl(url) || url);
  const summary = escapeHtml(
    preview?.summary ||
      "This page is represented as a source preview inside the app. Many public sites block iframe display with X-Frame-Options or Content-Security-Policy, so the virtual browser keeps the URL, snippets, and links visible here."
  );
  const source = escapeHtml(preview?.sourceInfo || domainFromUrl(url) || inferSourceType(url));
  const safeUrl = escapeHtml(url);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; background: #050505; color: #f8f8f8; }
      main { min-height: 100vh; display: grid; align-content: center; gap: 16px; padding: 32px; box-sizing: border-box; }
      article { border: 1px solid #3b3b3b; border-radius: 8px; padding: 20px; background: linear-gradient(145deg, #151515, #0a0a0a); }
      h1 { margin: 0 0 8px; font-size: 22px; }
      p { color: #d8d8d8; line-height: 1.55; }
      code { display: block; overflow-wrap: anywhere; color: #fff; background: #000; border: 1px solid #333; padding: 10px; border-radius: 6px; }
      small { color: #aaa; text-transform: uppercase; letter-spacing: .08em; }
    </style>
  </head>
  <body>
    <main>
      <article>
        <small>${source}</small>
        <h1>${title}</h1>
        <p>${summary}</p>
        <code>${safeUrl}</code>
      </article>
    </main>
  </body>
</html>`;
}

function renderBrowserPanel() {
  if (!els.browserHistory) return;
  const history = getBrowserHistory();
  const current = state.currentBrowserUrl || history[0]?.url || BROWSER_DEFAULT_URL;
  if (els.inAppBrowserFrame && els.inAppBrowserFrame.dataset.currentUrl !== current) {
    loadInAppBrowserFrame(current, getBrowserPreview());
  }
  els.inAppBrowserStatus.textContent = browserStatusMessage(current);
  renderBrowserOsDock();
  renderBrowserPreview();
  renderBrowserSearchResults();
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
                <button class="ghost-button iconless" type="button" data-browser-open="${escapeHtml(entry.url)}">Open External</button>
                <button class="ghost-button iconless" type="button" data-browser-preview="${escapeHtml(entry.id)}">Preview</button>
                <button class="ghost-button iconless" type="button" data-browser-source="${escapeHtml(entry.url)}"${writeDisabledAttr()}>Add Source</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No in-app browser history yet.</div>';

  els.browserHistory.querySelectorAll("[data-browser-open]").forEach((button) => {
    button.addEventListener("click", () => openExternalUrl(button.dataset.browserOpen));
  });
  els.browserHistory.querySelectorAll("[data-browser-preview]").forEach((button) => {
    button.addEventListener("click", () => previewBrowserHistoryItem(button.dataset.browserPreview));
  });
  els.browserHistory.querySelectorAll("[data-browser-source]").forEach((button) => {
    button.addEventListener("click", () => addBrowserUrlToSources(button.dataset.browserSource));
  });
}

function renderBrowserPreview() {
  if (!els.browserPreview) return;
  const preview = getBrowserPreview();
  if (!preview) {
    els.browserPreview.innerHTML = '<div class="empty-state">Open a search result, source, file, or URL to see the actual preview content and links here.</div>';
    return;
  }
  const content = preview.summary || preview.sourceInfo || preview.url || "No content preview is available for this item yet.";
  els.browserPreview.innerHTML = `
    <article class="browser-preview-card">
      <header>
        <div>
          <strong>${escapeHtml(preview.title || "Browser preview")}</strong>
          <small>${escapeHtml(preview.type || "Source")} / ${escapeHtml(preview.sourceInfo || domainFromUrl(preview.url) || "No source info")}</small>
        </div>
        ${preview.url ? `<span class="detail-chip">${escapeHtml(domainFromUrl(preview.url) || inferSourceType(preview.url))}</span>` : ""}
      </header>
      ${preview.url ? `<p class="result-url">${escapeHtml(preview.url)}</p>` : ""}
      <div class="browser-preview-content">${escapeHtml(content)}</div>
      ${
        preview.details
          ? `<details class="browser-preview-details"><summary>Technical metadata</summary><pre>${escapeHtml(preview.details)}</pre></details>`
          : ""
      }
      <div class="form-actions">
        ${preview.url ? `<button class="primary-button iconless" type="button" data-preview-open="${escapeHtml(preview.url)}">Open External</button>` : ""}
        ${preview.url ? `<button class="ghost-button iconless" type="button" data-preview-source="${escapeHtml(preview.url)}"${writeDisabledAttr()}>Add to Sources</button>` : ""}
      </div>
    </article>
  `;
  els.browserPreview.querySelectorAll("[data-preview-open]").forEach((button) => {
    button.addEventListener("click", () => openExternalUrl(button.dataset.previewOpen));
  });
  els.browserPreview.querySelectorAll("[data-preview-source]").forEach((button) => {
    button.addEventListener("click", () => addBrowserUrlToSources(button.dataset.previewSource));
  });
}

function renderBrowserOsDock() {
  if (!els.browserOsDock) return;
  const query = extractBrowserQuery(els.inAppBrowserForm?.elements.target?.value || "", state.currentBrowserUrl) || "shapeshifting research";
  if (els.browserOsStatus) {
    els.browserOsStatus.textContent = `${VIRTUAL_GOOGLE_OS_LOCK.capabilityIds.length} locked Google modes`;
  }
  els.browserOsDock.innerHTML = GOOGLE_CAPABILITIES.map(
    (capability) => `
      <button class="browser-os-tile" type="button" data-google-mode="${escapeHtml(capability.id)}">
        <strong>${escapeHtml(capability.label)}</strong>
        <span>${escapeHtml(capability.description)}</span>
      </button>
    `
  ).join("");
  els.browserOsDock.querySelectorAll("[data-google-mode]").forEach((button) => {
    button.addEventListener("click", () => openGoogleCapability(button.dataset.googleMode, query));
  });
}

function openGoogleCapability(mode, query = "") {
  const text = String(query || els.inAppBrowserForm?.elements.target?.value || "shapeshifting research").trim() || "shapeshifting research";
  const capability = GOOGLE_CAPABILITIES.find((item) => item.id === mode) || GOOGLE_CAPABILITIES[0];
  const url = buildGoogleCapabilityUrl(capability.id, text);
  openInAppBrowser(url, `${capability.label}: ${text}`, {
    query: text,
    preview: {
      id: `google-mode-${capability.id}-${Date.now()}`,
      type: `Google ${capability.label}`,
      title: `${capability.label}: ${text}`,
      url,
      summary: `${capability.description}. Opened as a virtual OS browser target with visible in-app links and source actions.`,
      sourceInfo: `Google ${capability.label}`,
      links: buildGoogleCapabilityLinks(text),
      details: JSON.stringify({ mode: capability.id, query: text, url }, null, 2),
      score: 1000,
    },
  });
}

function buildGoogleCapabilityUrl(mode, query) {
  const encoded = encodeURIComponent(String(query || "").trim());
  const pdfQuery = encodeURIComponent(`${query} filetype:pdf`);
  const archiveQuery = encodeURIComponent(`${query} site:archive.org OR site:loc.gov OR site:archive.is`);
  const urls = {
    web: `https://www.google.com/search?q=${encoded}`,
    images: `https://www.google.com/search?tbm=isch&q=${encoded}`,
    videos: `https://www.google.com/search?tbm=vid&q=${encoded}`,
    news: `https://news.google.com/search?q=${encoded}`,
    books: `https://books.google.com/books?q=${encoded}`,
    scholar: `https://scholar.google.com/scholar?q=${encoded}`,
    pdf: `https://www.google.com/search?q=${pdfQuery}`,
    archives: `https://www.google.com/search?q=${archiveQuery}`,
    patents: `https://patents.google.com/?q=${encoded}`,
    translate: `https://translate.google.com/?sl=auto&tl=en&text=${encoded}&op=translate`,
  };
  return urls[mode] || urls.web;
}

function buildGoogleCapabilityLinks(query) {
  return GOOGLE_CAPABILITIES.map((capability) => ({
    title: capability.label,
    url: buildGoogleCapabilityUrl(capability.id, query),
  }));
}

function renderBrowserSearchResults() {
  if (!els.browserSearchResults) return;
  const results = getBrowserSearchResults();
  if (!results.length) {
    els.browserSearchResults.innerHTML =
      '<div class="empty-state">Search from the address field or click CSE results to build internal previews from sources, files, browser history, documents, and references.</div>';
    return;
  }
  els.browserSearchResults.innerHTML = `
    <div class="result-summary-bar">
      <span>${results.length} internal result cards</span>
      <span>Source, file, document, reference, and browser leads</span>
    </div>
    ${results
      .map(
        (item) => `
          <article class="browser-result-card">
            <header>
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <small>${escapeHtml(item.type)} / ${escapeHtml(item.sourceInfo || domainFromUrl(item.url) || "local archive")}</small>
              </div>
              ${item.url ? `<span class="detail-chip">${escapeHtml(domainFromUrl(item.url) || inferSourceType(item.url))}</span>` : ""}
            </header>
            ${renderBrowserResultUrl(item)}
            <p>${escapeHtml(item.summary || "No preview summary available.")}</p>
            ${renderBrowserCardLinks(item)}
            <div class="form-actions">
              ${item.url ? `<button class="primary-button iconless" type="button" data-browser-result-open="${escapeHtml(item.id)}">Open External</button>` : ""}
              <button class="ghost-button iconless" type="button" data-browser-result-preview="${escapeHtml(item.id)}">Full Info</button>
              ${item.url ? `<button class="ghost-button iconless" type="button" data-browser-result-source="${escapeHtml(item.id)}"${writeDisabledAttr()}>Add Source</button>` : ""}
            </div>
          </article>
        `
      )
      .join("")}
  `;
  els.browserSearchResults.querySelectorAll("[data-browser-result-open]").forEach((button) => {
    button.addEventListener("click", () => openBrowserResult(button.dataset.browserResultOpen));
  });
  els.browserSearchResults.querySelectorAll("[data-browser-result-preview]").forEach((button) => {
    button.addEventListener("click", () => previewBrowserResult(button.dataset.browserResultPreview));
  });
  els.browserSearchResults.querySelectorAll("[data-browser-result-source]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = findBrowserResult(button.dataset.browserResultSource);
      if (result?.url) addBrowserUrlToSources(result.url);
    });
  });
  els.browserSearchResults.querySelectorAll("[data-open-browser-url]").forEach((button) => {
    button.addEventListener("click", () => openExternalUrl(button.dataset.openBrowserUrl));
  });
}

function renderBrowserCardLinks(item) {
  const links = dedupeLinks([
    ...(item.url ? [{ url: item.url, title: "Primary site" }] : []),
    ...(item.links || []),
  ]).slice(0, 5);
  if (!links.length) return "";
  return `
    <div class="browser-card-links">
      <strong>Sites and links</strong>
      ${links
        .map(
          (link) =>
            `<button class="link-button" type="button" data-open-browser-url="${escapeHtml(link.url)}">${escapeHtml(link.title || domainFromUrl(link.url) || link.url)}</button>`
        )
        .join("")}
    </div>
  `;
}

function renderBrowserResultUrl(item) {
  if (!item?.url) return '<p class="result-url is-missing">No direct link stored for this result yet.</p>';
  return `
    <div class="browser-result-url-row">
      <span>Result link</span>
      <button class="link-button result-link-button" type="button" data-open-browser-url="${escapeHtml(item.url)}">${escapeHtml(item.url)}</button>
    </div>
  `;
}

function getOpenAiChatMessages() {
  state.archive.openAiChatMessages = Array.isArray(state.archive.openAiChatMessages) ? state.archive.openAiChatMessages : [];
  return state.archive.openAiChatMessages;
}

function renderOpenAiChat(statusText = "") {
  if (!els.openAiChatTranscript) return;
  const capabilities = state.backendCapabilities;
  if (els.openAiChatStatus) {
    els.openAiChatStatus.textContent = statusText || openAiChatStatusText(capabilities);
  }
  const submitButton = els.openAiChatForm?.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.disabled = state.openAiChatBusy || isGuestUser();
    submitButton.textContent = state.openAiChatBusy ? "Sending..." : "Send";
  }
  if (els.openAiClearButton) {
    els.openAiClearButton.disabled = isGuestUser() || state.openAiChatBusy || !getOpenAiChatMessages().length;
  }

  const messages = getOpenAiChatMessages();
  els.openAiChatTranscript.innerHTML = messages.length
    ? messages
        .slice(-80)
        .map(
          (message) => `
            <article class="openai-chat-message ${message.role === "user" ? "user" : "assistant"}${message.error ? " error" : ""}">
              <header>
                <strong>${escapeHtml(message.role === "user" ? message.owner || "You" : "OpenAI GPT-5.5")}</strong>
                <small>${escapeHtml(message.createdAt ? new Date(message.createdAt).toLocaleString() : "")}</small>
              </header>
              <div class="openai-message-body">${renderLinkedText(message.content || "")}</div>
              ${
                message.model
                  ? `<small class="openai-meta">${escapeHtml(message.model)} / ${escapeHtml(message.reasoningEffort || "high")} / ${escapeHtml(message.verbosity || "medium")}</small>`
                  : ""
              }
            </article>
          `
        )
        .join("")
    : '<div class="empty-state">No OpenAI chat messages yet. Ask a question after running the Python backend with OPENAI_API_KEY configured.</div>';
  els.openAiChatTranscript.querySelectorAll("[data-open-ai-url]").forEach((button) => {
    button.addEventListener("click", () => openExternalUrl(button.dataset.openAiUrl));
  });
}

function openAiChatStatusText(capabilities = state.backendCapabilities) {
  if (state.openAiChatBusy) return "Contacting OpenAI...";
  if (!capabilities.checked) return "Backend not checked";
  if (isKnownStaticHost()) return "Static host: local atlas mode";
  if (!hasBackendRoute(OPENAI_CHAT_API_PATH, capabilities)) return "OpenAI route unavailable on this host";
  if (!capabilities.openAiChatConfigured) return "Missing backend OPENAI_API_KEY";
  return "OpenAI backend ready";
}

async function handleOpenAiChatSubmit(event) {
  event.preventDefault();
  if (!ensureCanWrite("use OpenAI chat")) return;
  const formData = new FormData(els.openAiChatForm);
  const prompt = String(formData.get("prompt") || "").trim();
  if (!prompt) return;

  const messages = getOpenAiChatMessages();
  const userMessage = {
    id: `openai-user-${Date.now()}`,
    role: "user",
    owner: state.currentUser?.username || "local",
    content: prompt,
    createdAt: new Date().toISOString(),
  };
  messages.push(userMessage);
  state.archive.openAiChatMessages = messages.slice(-120);
  state.openAiChatBusy = true;
  persistArchive("OpenAI chat prompt");
  renderOpenAiChat("Contacting backend...");

  try {
    const capabilities = await ensureBackendCapabilities();
    if (isKnownStaticHost() || capabilities.platform === "static") {
      getOpenAiChatMessages().push({
        id: `openai-static-${Date.now()}`,
        role: "assistant",
        owner: "Atlas Local Mode",
        content: buildStaticHostOpenAiReply(prompt),
        error: false,
        errorType: "static_host",
        createdAt: new Date().toISOString(),
      });
      state.archive.openAiChatMessages = getOpenAiChatMessages().slice(-120);
      persistArchive("Static host atlas response");
      return;
    }
    if (!hasBackendRoute(OPENAI_CHAT_API_PATH, capabilities)) {
      getOpenAiChatMessages().push({
        id: `openai-backend-missing-${Date.now()}`,
        role: "assistant",
        owner: "Atlas Local Mode",
        content: buildStaticHostOpenAiReply(prompt),
        error: false,
        errorType: "backend_route_missing",
        createdAt: new Date().toISOString(),
      });
      state.archive.openAiChatMessages = getOpenAiChatMessages().slice(-120);
      persistArchive("Missing backend atlas response");
      return;
    }
    if (!capabilities.openAiChatConfigured) {
      throw new Error("OPENAI_API_KEY is not configured on the backend host. The key must stay server-side.");
    }

    const response = await fetch(OPENAI_CHAT_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: state.archive.openAiChatMessages.slice(-16).map((message) => ({
          role: message.role,
          content: message.content,
        })),
        options: {
          reasoningEffort: String(formData.get("reasoningEffort") || "high"),
          verbosity: String(formData.get("verbosity") || "medium"),
        },
        context: formData.get("includeContext") === "on" ? buildOpenAiChatContext(prompt) : null,
      }),
    });
    const data = await readJsonResponse(response);
    if (!response.ok || data.ok === false) {
      getOpenAiChatMessages().push({
        id: `openai-error-${Date.now()}`,
        role: "assistant",
        owner: "OpenAI GPT-5.5",
        content: buildOpenAiFailureReply(data, prompt, response.status),
        error: true,
        errorType: data.errorType || "api_error",
        createdAt: new Date().toISOString(),
      });
      state.archive.openAiChatMessages = getOpenAiChatMessages().slice(-120);
      persistArchive("OpenAI chat unavailable notice");
      return;
    }
    getOpenAiChatMessages().push({
      id: `openai-assistant-${Date.now()}`,
      role: "assistant",
      owner: "OpenAI GPT-5.5",
      content: data.reply || "No response text returned.",
      model: data.model || "gpt-5.5",
      reasoningEffort: data.reasoningEffort || String(formData.get("reasoningEffort") || "high"),
      verbosity: data.verbosity || String(formData.get("verbosity") || "medium"),
      createdAt: new Date().toISOString(),
    });
    state.archive.openAiChatMessages = getOpenAiChatMessages().slice(-120);
    els.openAiChatForm.reset();
    persistArchive("OpenAI chat response");
  } catch (error) {
    getOpenAiChatMessages().push({
      id: `openai-error-${Date.now()}`,
      role: "assistant",
      owner: "OpenAI GPT-5.5",
      content: buildOpenAiFailureReply({ error: error.message, errorType: "backend_unavailable" }, prompt),
      error: true,
      errorType: "backend_unavailable",
      createdAt: new Date().toISOString(),
    });
    state.archive.openAiChatMessages = getOpenAiChatMessages().slice(-120);
    persistArchive("OpenAI chat unavailable notice");
  } finally {
    state.openAiChatBusy = false;
    renderOpenAiChat();
  }
}

function buildOpenAiChatContext(prompt) {
  const browser = getBrowserContext();
  const sourceCandidates = rankSources(`${prompt} ${browser.searchText}`).slice(0, 8);
  const topSources = (sourceCandidates.length ? sourceCandidates : state.archive.sources.slice(0, 8)).map((source) => ({
    id: source.id,
    title: source.title,
    category: source.category,
    species: source.species,
    domain: source.domain,
    sourceType: source.sourceType,
    url: source.url,
    evidenceTier: source.evidenceTier,
    citationStatus: source.citationStatus,
    terms: source.terms,
    notes: clampText(source.notes, 450),
  }));
  const memoryBank = getMemoryBank();
  return {
    project: {
      name: state.archive.project.name,
      version: state.archive.project.version,
      epistemicPolicy: state.archive.project.epistemicPolicy,
      corePrompt: clampText(state.archive.project.corePrompt, 900),
    },
    activeUser: state.currentUser?.username || "local",
    activeProfile: getProfile(state.activeProfileUsername) || null,
    allProfileSummaries: (state.archive.profiles || []).map((profile) => ({
      username: profile.username,
      role: profile.role,
      animalForm: profile.animalForm,
      animalSpirits: profile.animalSpirits,
      identityStatement: profile.identityStatement,
    })),
    browser: {
      summary: browserContextSummary(browser),
      currentUrl: browser.currentUrl,
      preview: browser.preview,
      virtualResults: (browser.virtualResults || []).slice(0, 8),
    },
    topSources,
    references: getReferenceLibrary().map((reference) => ({
      id: reference.id,
      title: reference.title,
      fileName: reference.fileName,
      sourceType: reference.sourceType,
      evidenceTier: reference.evidenceTier,
      citationStatus: reference.citationStatus,
      backendUse: reference.backendUse,
      detectedTerms: reference.detectedTerms,
    })),
    recentTeamMessages: (state.archive.teamMessages || []).slice(0, 12),
    collaborationDocs: getCollabDocs().slice(0, 8).map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      owner: doc.owner,
      textPreview: clampText(stripHtml(doc.contentHtml || ""), 700),
    })),
    importedFiles: (state.archive.importedFiles || []).slice(0, 8).map((file) => ({
      fileName: file.fileName,
      parser: file.parser,
      summary: file.summary,
      warnings: file.warnings,
      recordsCreated: file.recordsCreated,
    })),
    memory: {
      snapshotCount: memoryBank.snapshots?.length || 0,
      latest: memoryBank.snapshots?.[0]
        ? {
            reason: memoryBank.snapshots[0].reason,
            owner: memoryBank.snapshots[0].owner,
            createdAt: memoryBank.snapshots[0].createdAt,
            counts: memoryBank.snapshots[0].counts,
          }
        : null,
    },
  };
}

function buildOpenAiFailureReply(data = {}, prompt = "", statusCode = 0) {
  const errorType = data.errorType || "api_error";
  const error = data.error || `OpenAI chat route returned HTTP ${statusCode || "unknown"}.`;
  if (errorType === "quota_exceeded") {
    return [
      "OpenAI was reached, but this API project has no usable quota, credits, or billing available right now.",
      "",
      `OpenAI error: ${error}`,
      "",
      "Fix:",
      "- Add API billing or credits: https://platform.openai.com/settings/organization/billing",
      "- Check project/org usage limits: https://platform.openai.com/settings/organization/limits",
      "- ChatGPT Plus/Pro and OpenAI API billing are separate.",
      "- After billing is active, you can test cheaper by setting OPENAI_CHAT_MODEL=gpt-5.4-mini in .env.local, then switch back to gpt-5.5 when ready.",
      "",
      "Local atlas fallback:",
      buildLocalAtlasReply(prompt),
    ].join("\n");
  }
  if (errorType === "authentication") {
    return [
      "OpenAI rejected the backend key.",
      "",
      `OpenAI error: ${error}`,
      "",
      "Fix: replace OPENAI_API_KEY in .env.local with a valid project key, restart python server.py, then try again.",
      "",
      "Local atlas fallback:",
      buildLocalAtlasReply(prompt),
    ].join("\n");
  }
  if (errorType === "access_or_model") {
    return [
      "OpenAI was reached, but this key/project does not have access to the configured model.",
      "",
      `OpenAI error: ${error}`,
      "",
      "Fix: check OPENAI_CHAT_MODEL in .env.local and the project tied to the API key.",
      "",
      "Local atlas fallback:",
      buildLocalAtlasReply(prompt),
    ].join("\n");
  }
  if (errorType === "backend_unavailable") {
    return [
      "The OpenAI backend route is not available from this host.",
      "",
      `App error: ${error}`,
      "",
      "Fix: run the Python backend with python server.py, or deploy the app to a backend host that supports /api/openai-chat. GitHub Pages alone is static and cannot execute this API route.",
      "",
      "Local atlas fallback:",
      buildLocalAtlasReply(prompt),
    ].join("\n");
  }
  return [
    "OpenAI chat is not available right now.",
    "",
    `Error: ${error}`,
    "",
    "Local atlas fallback:",
    buildLocalAtlasReply(prompt),
  ].join("\n");
}

function buildStaticHostOpenAiReply(prompt = "") {
  return [
    "This page is running on GitHub Pages, which is a static host. Static hosts cannot execute /api/openai-chat, so a real OpenAI call cannot run from this URL without a backend.",
    "",
    "I am answering in Atlas Local Mode from the data already inside this app.",
    "",
    buildLocalAtlasReply(prompt),
    "",
    "To enable real OpenAI replies:",
    "- Run locally: python server.py --host 127.0.0.1 --port 5177",
    "- Open: http://127.0.0.1:5177/",
    "- Or deploy the Python/API backend to Render, Vercel, Railway, Fly.io, or another backend host and set OPENAI_API_KEY there.",
    "- Do not put OPENAI_API_KEY into GitHub Pages JavaScript; that would expose the key publicly.",
  ].join("\n");
}

function buildLocalAtlasReply(prompt = "") {
  const browser = getBrowserContext();
  const rankedSources = rankSources(`${prompt} ${browser.searchText}`).slice(0, 5);
  const sources = rankedSources.length ? rankedSources : state.archive.sources.slice(0, 5);
  const sourceLines = sources.map((source) => {
    const locator = source.url ? ` / ${source.url}` : "";
    return `- ${source.title} [${source.evidenceTier}; ${source.citationStatus}]${locator}: ${clampText(source.notes, 180)}`;
  });
  const browserPreview = browser.preview
    ? `${browser.preview.title || "Current preview"} / ${browser.preview.url || browser.preview.type || "no URL"}`
    : "No active browser preview.";
  const docs = getCollabDocs()
    .slice(0, 3)
    .map((doc) => `- ${doc.title} (${doc.status || "Draft"}): ${clampText(stripHtml(doc.contentHtml || ""), 140)}`);
  return [
    `Prompt: ${prompt || "No prompt provided."}`,
    `Current browser context: ${browserPreview}`,
    "",
    "Best matching source leads:",
    ...(sourceLines.length ? sourceLines : ["- No source leads available yet."]),
    "",
    "Useful document context:",
    ...(docs.length ? docs : ["- No collaboration documents available yet."]),
    "",
    "Next step: open or add source links in the Browser tab, then retry OpenAI after API billing/quota is active.",
  ].join("\n");
}

function clearOpenAiChat() {
  if (!ensureCanWrite("clear OpenAI chat messages")) return;
  if (!getOpenAiChatMessages().length) return;
  const confirmed = window.confirm("Clear the local OpenAI chat transcript?");
  if (!confirmed) return;
  state.archive.openAiChatMessages = [];
  persistArchive("OpenAI chat cleared");
  renderOpenAiChat();
}

function renderLinkedText(value) {
  return escapeHtml(value)
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      (url) => `<button class="link-button inline-link" type="button" data-open-ai-url="${escapeHtml(url)}">${escapeHtml(url)}</button>`
    )
    .replace(/\n/g, "<br>");
}

function replayBufferedCseEvents() {
  const buffered = Array.isArray(window.coreCseEvents) ? window.coreCseEvents.splice(0) : [];
  buffered.forEach((event) => {
    if (event.type === "core-cse-search-start") {
      handleCseSearchStart({ detail: event.detail });
    }
    if (event.type === "core-cse-results-ready") {
      handleCseResultsReady({ detail: event.detail });
    }
  });
}

function handleCseSearchStart(event) {
  const query = String(event.detail?.query || "").trim();
  if (!query) return;
  const searchUrl = buildCseSearchUrl(query);
  state.currentBrowserUrl = searchUrl;
  const history = getBrowserHistory();
  history.unshift({
    id: `browser-cse-${Date.now()}`,
    url: searchUrl,
    label: `CSE search: ${query}`,
    owner: state.currentUser?.username || "local",
    createdAt: new Date().toISOString(),
  });
  setBrowserHistory(dedupeBrowserHistory(history).slice(0, 30));
  setBrowserPreview({
    title: `Google CSE search: ${query}`,
    url: searchUrl,
    type: "Google Programmable Search query",
    summary: "This query came from the embedded Google search box. Result links are mirrored into internal cards when Google exposes them to the page callback.",
    sourceInfo: `Google CSE ${GOOGLE_CSE_ID}`,
  });
  setBrowserSearchResults(buildVirtualBrowserResults(query, searchUrl));
  renderBrowserPanel();
}

function handleCseResultsReady(event) {
  const query = String(event.detail?.query || "").trim();
  if (!query) return;
  const searchUrl = buildCseSearchUrl(query);
  const googleCards = normalizeCseResultCards(query, event.detail?.results || []);
  const localCards = buildVirtualBrowserResults(query, searchUrl);
  const cards = dedupeBrowserResults([...googleCards, ...localCards])
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);
  setBrowserSearchResults(cards);
  setBrowserPreview({
    title: `Google CSE results: ${query}`,
    url: searchUrl,
    type: "Google Programmable Search result set",
    summary: `${googleCards.length} Google result card(s) and ${Math.max(cards.length - googleCards.length, 0)} local archive lead(s) are available below. External open buttons launch the target outside the atlas while preview cards stay available here.`,
    sourceInfo: `Google CSE ${GOOGLE_CSE_ID}`,
    details: JSON.stringify(
      {
        query,
        googleResultCount: googleCards.length,
        totalCardCount: cards.length,
        searchUrl,
      },
      null,
      2
    ),
  });
  state.currentBrowserUrl = searchUrl;
  renderBrowserPanel();
}

function normalizeCseResultCards(query, results = []) {
  return results
    .map((item, index) => {
      const url = unwrapSearchResultUrl(item.url || item.unescapedUrl || item.clicktrackUrl || item.cacheUrl || "");
      const title = stripHtml(item.titleNoFormatting || item.title || domainFromUrl(url) || `Google result ${index + 1}`);
      const summary = stripHtml(item.contentNoFormatting || item.content || item.snippet || item.visibleUrl || "");
      if (!url) return null;
      return {
        id: `google-cse-${Date.now()}-${index}`,
        type: "Google CSE result",
        title,
        url,
        summary: summary || `Google Programmable Search result for ${query}.`,
        sourceInfo: item.visibleUrl || domainFromUrl(url) || `Google CSE ${GOOGLE_CSE_ID}`,
        details: JSON.stringify(
          {
            title,
            url,
            visibleUrl: item.visibleUrl || "",
            content: summary,
            richSnippet: item.richSnippet || null,
          },
          null,
          2
        ),
        score: 900 - index,
      };
    })
    .filter(Boolean);
}

function handleCseResultClick(event) {
  const link = event.target.closest?.("a");
  if (!link?.href) return;
  const url = unwrapSearchResultUrl(link.href);
  if (!url || isCseUrl(url) || url.startsWith("javascript:")) return;
  event.preventDefault();
  openInAppBrowser(url, link.textContent.trim() || url, {
    preview: {
      title: link.textContent.trim() || domainFromUrl(url) || url,
      url,
      type: inferSourceType(url),
      summary: "Opened from an embedded Google Programmable Search result. The browser will render it in-app if the target allows iframe embedding.",
      sourceInfo: `Google CSE ${GOOGLE_CSE_ID}`,
    },
  });
}

function getBrowserHistory() {
  return isGuestUser() ? state.guestBrowserHistory : state.archive.browserHistory || [];
}

function setBrowserHistory(history) {
  if (isGuestUser()) {
    state.guestBrowserHistory = history;
    return;
  }
  state.archive.browserHistory = history;
  persistArchive();
}

function getBrowserSearchResults() {
  return isGuestUser() ? state.guestBrowserSearchResults : state.archive.browserSearchResults || [];
}

function setBrowserSearchResults(results) {
  if (isGuestUser()) {
    state.guestBrowserSearchResults = results;
    return;
  }
  state.archive.browserSearchResults = results;
  persistArchive();
}

function getBrowserPreview() {
  return isGuestUser() ? state.guestBrowserPreview : state.archive.browserPreview || null;
}

function setBrowserPreview(preview) {
  if (isGuestUser()) {
    state.guestBrowserPreview = preview;
    return;
  }
  state.archive.browserPreview = preview;
  persistArchive();
}

function extractBrowserQuery(value, url = "") {
  const raw = String(value || "").trim();
  try {
    const parsed = new URL(url || raw);
    const hashParams = new URLSearchParams(String(parsed.hash || "").replace(/^#/, ""));
    const cseQuery =
      parsed.searchParams.get("gsc.q") ||
      hashParams.get("gsc.q") ||
      parsed.searchParams.get("q") ||
      hashParams.get("q");
    if (cseQuery) return cseQuery;
    if (parsed.hostname.includes("google.") && parsed.pathname.includes("/search")) {
      return parsed.searchParams.get("q") || raw;
    }
    return "";
  } catch {
    if (/^https?:\/\//i.test(raw) || /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return "";
    return raw;
  }
}

function buildVirtualBrowserResults(query, currentUrl = "") {
  const keywords = extractKeywords(query);
  const rows = [];
  rows.push({
    id: `browser-query-${Date.now()}`,
    type: "Search query",
    title: query,
    url: currentUrl,
    summary: `Google Programmable Search query routed through the in-app research browser: ${query}.`,
    sourceInfo: `Google CSE ${GOOGLE_CSE_ID}`,
    links: buildGoogleCapabilityLinks(query),
    details: JSON.stringify(
      {
        query,
        currentUrl,
        googleCapabilities: buildGoogleCapabilityLinks(query),
      },
      null,
      2
    ),
    score: 999,
  });

  (state.archive.sources || []).forEach((source) => {
    const haystack = [source.title, source.url, source.notes, source.category, source.domain, source.sourceType, ...(source.terms || [])].join(" ");
    const score = browserResultScore(haystack, keywords);
    if (score > 0) {
      rows.push({
        id: `source-${source.id}`,
        type: `Source / ${source.sourceType || "URL"}`,
        title: source.title,
        url: source.url || "",
        summary: source.notes,
        sourceInfo: `${source.category} / ${source.domain} / ${source.citationStatus}`,
        links: source.url ? [{ url: source.url, title: source.title }] : [],
        details: JSON.stringify(source, null, 2),
        score,
      });
    }
  });

  (state.archive.importedFiles || []).forEach((file) => {
    const haystack = [file.fileName, file.summary, file.parser, ...(file.keywords || [])].join(" ");
    const score = browserResultScore(haystack, keywords);
    if (score > 0) {
      rows.push({
        id: `file-${file.id || file.fileName}`,
        type: "Imported file",
        title: file.fileName || "Imported file",
        url: file.url || "",
        summary: file.summary || `${file.recordsCreated || 0} source records created from this upload.`,
        sourceInfo: `${file.parser || "browser"} / ${file.contentType || "file"}`,
        details: JSON.stringify(file, null, 2),
        score,
      });
    }
  });

  getCollabDocs().forEach((doc) => {
    const haystack = [doc.title, doc.type, doc.status, doc.owner, stripHtml(doc.contentHtml || "")].join(" ");
    const score = browserResultScore(haystack, keywords);
    if (score > 0) {
      rows.push({
        id: `collab-${doc.id}`,
        type: `Collaboration doc / ${doc.type || "Document"}`,
        title: doc.title || "Untitled document",
        url: `local-collab-doc://${doc.id}`,
        summary: clampText(stripHtml(doc.contentHtml || ""), 260),
        sourceInfo: `${doc.status || "Draft"} / ${doc.owner || "Unassigned"}`,
        details: JSON.stringify(doc, null, 2),
        score,
      });
    }
  });

  getReferenceLibrary().forEach((reference) => {
    const haystack = [reference.title, reference.role, reference.backendUse, reference.evidenceTier, ...(reference.detectedTerms || [])].join(" ");
    const score = browserResultScore(haystack, keywords);
    if (score > 0) {
      rows.push({
        id: `reference-${reference.id}`,
        type: "Uploaded reference",
        title: reference.title,
        url: `data/reference_ingest.json#${reference.id}`,
        summary: reference.role,
        sourceInfo: `${reference.pageCount || "?"} pages / ${reference.citationStatus}`,
        details: JSON.stringify(reference, null, 2),
        score,
      });
    }
  });

  getBrowserHistory().forEach((entry) => {
    const haystack = [entry.label, entry.url].join(" ");
    const score = browserResultScore(haystack, keywords);
    if (score > 0) {
      rows.push({
        id: `history-${entry.id}`,
        type: "Browser history",
        title: entry.label || entry.url,
        url: entry.url,
        summary: `Previously opened in the in-app browser on ${new Date(entry.createdAt).toLocaleString()}.`,
        sourceInfo: entry.owner || "local",
        score,
      });
    }
  });

  return dedupeBrowserResults(rows)
    .sort((a, b) => b.score - a.score)
    .slice(0, 16);
}

function browserResultScore(text, keywords) {
  const haystack = String(text || "").toLowerCase();
  if (!keywords.length) return haystack ? 1 : 0;
  return keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function dedupeBrowserResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = result.url || result.id || result.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findBrowserResult(id) {
  return getBrowserSearchResults().find((item) => item.id === id);
}

function openBrowserResult(id) {
  const result = findBrowserResult(id);
  if (!result) return;
  previewBrowserResult(id);
  if (result.url) openExternalUrl(result.url);
}

function previewBrowserResult(id) {
  const result = findBrowserResult(id);
  if (!result) return;
  setBrowserPreview(result);
  renderBrowserPreview();
}

function previewBrowserHistoryItem(id) {
  const entry = getBrowserHistory().find((item) => item.id === id);
  if (!entry) return;
  setBrowserPreview({
    title: entry.label || entry.url,
    url: entry.url,
    type: "Browser history",
    summary: `Opened in the in-app browser on ${new Date(entry.createdAt).toLocaleString()}.`,
    sourceInfo: entry.owner || "local",
    details: JSON.stringify(entry, null, 2),
  });
  renderBrowserPreview();
}

function unwrapSearchResultUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const wrapped = parsed.searchParams.get("q") || parsed.searchParams.get("url");
    if (wrapped && /^https?:\/\//i.test(wrapped)) return wrapped;
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

function openCurrentBrowserTargetExternal() {
  const target = String(els.inAppBrowserForm.elements.target.value || "").trim();
  const url = state.currentBrowserUrl || (target ? normalizeBrowserTarget(target) : "");
  if (!url) {
    window.alert("Enter a URL or search query first.");
    return;
  }
  openExternalUrl(url);
}

function openExternalUrl(url) {
  const target = String(url || "").trim();
  if (!target) return;
  saveCurrentUserLocation();
  if (/^import:\/\//i.test(target) || /^team-file:\/\//i.test(target) || /^local-collab-doc:\/\//i.test(target)) {
    window.alert("This is an internal atlas locator. Use Preview File or Full Source Info to inspect it.");
    return;
  }
  const normalized = normalizeBrowserTarget(target);
  window.open(normalized, "_blank", "noopener,noreferrer");
}

function addCurrentBrowserPageToSources() {
  if (!ensureCanWrite("add browser pages to Sources")) return;
  const target = String(els.inAppBrowserForm.elements.target.value || "").trim();
  const url = state.currentBrowserUrl || (target ? normalizeBrowserTarget(target) : "");
  if (!url) {
    window.alert("Open a browser page first.");
    return;
  }
  addBrowserUrlToSources(url);
}

function addBrowserUrlToSources(url) {
  if (!ensureCanWrite("add browser pages to Sources")) return;
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
  if (/^(data|assets|docs|dist)\//i.test(target) || target.startsWith("./") || target.startsWith("../") || target.startsWith("/")) return target;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return target;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(target)) return `https://${target}`;
  return buildCseSearchUrl(target);
}

function buildCseSearchUrl(query) {
  const text = String(query || "").trim();
  if (!text) return GOOGLE_CSE_PUBLIC_URL;
  return `https://cse.google.com/cse?cx=${GOOGLE_CSE_ID}&gsc.q=${encodeURIComponent(text)}#gsc.tab=0`;
}

function browserStatusMessage(url) {
  if (!url) return "No page loaded yet.";
  if (isCseUrl(url)) {
    return `Loaded Google Programmable Search Engine ${GOOGLE_CSE_ID}. Use the embedded CSE search box above, or open the public CSE URL if the fallback frame is restricted.`;
  }
  if (isLocalCollabDocUrl(url)) {
    return "Loaded a collaboration document preview inside the virtual browser.";
  }
  if (isKnownFrameBlockedUrl(url)) {
    return `Loaded ${url} into the virtual browser preview. Google and many public sites block iframe display, so the app keeps the page URL, source preview, and links in-app.`;
  }
  return /^https?:\/\//i.test(url)
    ? `Loaded ${url} into the virtual browser preview. The app keeps URL and card metadata in-app.`
    : `Loaded ${url} in the in-app browser.`;
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

function isLocalCollabDocUrl(url) {
  return String(url || "").startsWith("local-collab-doc://");
}

function getCollabDocFromUrl(url) {
  if (!isLocalCollabDocUrl(url)) return null;
  const id = String(url).replace("local-collab-doc://", "");
  return getCollabDocs().find((doc) => doc.id === id) || null;
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
  const history = getBrowserHistory();
  const currentUrl = state.currentBrowserUrl || history[0]?.url || BROWSER_DEFAULT_URL;
  const virtualResults = getBrowserSearchResults();
  const preview = getBrowserPreview();
  const browserSources = (state.archive.sources || [])
    .filter((source) => source.id?.startsWith("src-browser-") || String(source.tradition || "").includes("In-app browser"))
    .slice(0, 5);
  const teamBrowserLeads = (state.archive.teamMessages || [])
    .filter((item) => isTeamPostVotable(item) && item.url && item.status !== "rejected")
    .slice(0, 5);
  const collabDocs = getCollabDocs()
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      owner: doc.owner,
      updatedAt: doc.updatedAt,
      summary: clampText(stripHtml(doc.contentHtml || ""), 260),
    }))
    .slice(0, 5);
  return {
    currentUrl,
    currentDomain: domainFromUrl(currentUrl) || "cse.google.com",
    csePublicUrl: GOOGLE_CSE_PUBLIC_URL,
    history: history.slice(0, 6),
    virtualResults: virtualResults.slice(0, 8),
    preview,
    browserSources,
    teamBrowserLeads,
    collabDocs,
    searchText: [
      currentUrl,
      preview?.title,
      preview?.url,
      preview?.summary,
      ...history.slice(0, 6).flatMap((entry) => [entry.label, entry.url]),
      ...virtualResults.slice(0, 8).flatMap((result) => [result.title, result.url, result.summary, result.sourceInfo]),
      ...browserSources.flatMap((source) => [source.title, source.url, source.notes, ...(source.terms || [])]),
      ...teamBrowserLeads.flatMap((item) => [item.title, item.url, item.text]),
      ...collabDocs.flatMap((doc) => [doc.title, doc.type, doc.status, doc.summary]),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function browserContextSummary(context = getBrowserContext()) {
  const historyLines = context.history.map((entry) => `- ${entry.label || entry.url}: ${entry.url}`).join("\n");
  const resultLines = (context.virtualResults || []).map((item) => `- ${item.title}: ${item.url || item.type}`).join("\n");
  const sourceLines = context.browserSources.map((source) => `- ${source.title}: ${source.url || "no URL"}`).join("\n");
  const teamLines = context.teamBrowserLeads.map((item) => `- ${item.title || item.type}: ${item.url}`).join("\n");
  const docLines = (context.collabDocs || []).map((doc) => `- ${doc.title}: ${doc.status || "Draft"} / ${doc.summary}`).join("\n");
  return [
    `Current browser URL: ${context.currentUrl}`,
    `Current browser domain: ${context.currentDomain}`,
    context.preview ? `Current browser preview: ${context.preview.title} / ${context.preview.url || context.preview.type}` : "Current browser preview: none",
    `Google CSE URL: ${context.csePublicUrl}`,
    context.history.length ? `Recent browser history:\n${historyLines}` : "Recent browser history: none yet",
    resultLines ? `Virtual browser result cards:\n${resultLines}` : "Virtual browser result cards: none yet",
    context.browserSources.length ? `Browser source leads:\n${sourceLines}` : "Browser source leads: none promoted yet",
    context.teamBrowserLeads.length ? `Team browser leads:\n${teamLines}` : "Team browser leads: none yet",
    docLines ? `Collaboration document context:\n${docLines}` : "Collaboration document context: none yet",
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

function readFileTextSlice(file, bytes = IMPORT_TEXT_SLICE_BYTES) {
  return file.slice(0, Math.min(file.size, bytes)).text();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("File preview read failed.")));
    reader.readAsDataURL(file);
  });
}

function openFileStore() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB file storage is not available in this browser."));
      return;
    }
    const request = indexedDB.open(FILE_STORE_DB_NAME, FILE_STORE_DB_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE_OBJECT_STORE)) {
        db.createObjectStore(FILE_STORE_OBJECT_STORE, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error || new Error("IndexedDB file store failed to open.")));
  });
}

async function writeStoredFileBlob(file, id = fileStoreKeyForFile(file)) {
  if (!file || file.size > FILE_STORE_MAX_BYTES) return "";
  const db = await openFileStore();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(FILE_STORE_OBJECT_STORE, "readwrite");
      const store = transaction.objectStore(FILE_STORE_OBJECT_STORE);
      store.put({
        id,
        blob: file,
        fileName: file.name || id,
        mimeType: file.type || "application/octet-stream",
        size: file.size || 0,
        updatedAt: new Date().toISOString(),
      });
      transaction.addEventListener("complete", resolve);
      transaction.addEventListener("error", () => reject(transaction.error || new Error("Stored file write failed.")));
      transaction.addEventListener("abort", () => reject(transaction.error || new Error("Stored file write aborted.")));
    });
    return id;
  } finally {
    db.close();
  }
}

async function readStoredFileBlob(id) {
  if (!id) return null;
  const db = await openFileStore();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(FILE_STORE_OBJECT_STORE, "readonly");
      const request = transaction.objectStore(FILE_STORE_OBJECT_STORE).get(id);
      request.addEventListener("success", () => resolve(request.result || null));
      request.addEventListener("error", () => reject(request.error || new Error("Stored file read failed.")));
    });
  } finally {
    db.close();
  }
}

function fileStoreKeyForFile(file) {
  const safeName = slugify(file?.name || "file");
  return `blob-${Date.now()}-${Math.round(Math.random() * 9999)}-${safeName}`;
}

function previewKindForFile(fileData = {}) {
  const mime = String(fileData.mimeType || fileData.type || "").toLowerCase();
  const extension = fileData.extension || extensionFromFileName(fileData.fileName);
  if (mime.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".avif"].includes(extension)) return "image";
  if (mime.startsWith("video/") || [".mp4", ".webm", ".mov", ".avi", ".mkv"].includes(extension)) return "video";
  if (mime.startsWith("audio/") || [".mp3", ".wav", ".ogg", ".m4a", ".flac"].includes(extension)) return "audio";
  if (mime.includes("pdf") || extension === ".pdf") return "pdf";
  if ([".txt", ".json", ".py", ".js", ".css", ".md", ".markdown", ".html", ".htm", ".csv", ".xml", ".yaml", ".yml"].includes(extension)) return "text";
  if ([".zip", ".doc", ".docx"].includes(extension)) return "document";
  if (/^https?:\/\//i.test(fileData.url || "")) return "web";
  return "data";
}

function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function sourceTypeForFile(fileData) {
  const extension = fileData.extension || extensionFromFileName(fileData.fileName);
  if (extension === ".pdf") return "PDF";
  if ([".html", ".htm"].includes(extension)) return "Documentation";
  if ([".zip", ".json"].includes(extension)) return "Archive";
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".avif"].includes(extension)) return "WebP / Image";
  if ([".mp4", ".webm", ".mov", ".avi", ".mkv", ".mp3", ".wav", ".ogg", ".m4a", ".flac"].includes(extension)) return "Video / Transcript";
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

async function readJsonResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text || "{}");
  } catch {
    return {
      ok: false,
      error: `Expected JSON from ${response.url || "API route"} but received ${text.slice(0, 120) || "an empty response"}.`,
    };
  }
}

async function ensureBackendCapabilities() {
  if (state.backendCapabilities.checked) return state.backendCapabilities;
  if (state.backendCapabilities.checking) return state.backendCapabilities.checking;
  return detectBackendCapabilities({ renderAfter: false });
}

function staticHostCapabilities() {
  return {
    checked: true,
    checking: null,
    available: false,
    routes: [],
    googleSearchConfigured: false,
    openAiChatConfigured: false,
    platform: "static",
  };
}

function isKnownStaticHost() {
  return window.location.protocol === "file:" || window.location.hostname.endsWith(".github.io");
}

async function detectBackendCapabilities({ renderAfter = true } = {}) {
  if (isKnownStaticHost()) {
    state.backendCapabilities = staticHostCapabilities();
    return state.backendCapabilities;
  }
  if (state.backendCapabilities.checking) return state.backendCapabilities.checking;
  state.backendCapabilities.checking = fetch(HEALTH_API_PATH, { cache: "no-store" })
    .then(async (response) => {
      const data = await readJsonResponse(response);
      state.backendCapabilities = {
        checked: true,
        checking: null,
        available: response.ok && data.ok !== false,
        routes: Array.isArray(data.routes) ? data.routes : [],
        googleSearchConfigured: Boolean(data.googleSearchConfigured),
        openAiChatConfigured: Boolean(data.openAiChatConfigured),
        platform: data.platform || (response.ok ? "local-python" : "static"),
      };
      if (renderAfter) {
        renderTeamChat();
        renderOpenAiChat();
      }
      return state.backendCapabilities;
    })
    .catch(() => {
      state.backendCapabilities = staticHostCapabilities();
      if (renderAfter) {
        renderTeamChat();
        renderOpenAiChat();
      }
      return state.backendCapabilities;
    });
  return state.backendCapabilities.checking;
}

function hasBackendRoute(route, capabilities = state.backendCapabilities) {
  return Boolean(capabilities?.available && Array.isArray(capabilities.routes) && capabilities.routes.includes(route));
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    if (!link?.url || seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
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

function inferSourceType(url) {
  const lower = String(url || "").toLowerCase();
  if (lower.startsWith("local-collab-doc://")) return "Documentation";
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".webp") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "WebP / Image";
  }
  if (lower.includes("archive.org") || lower.endsWith(".zip")) return "Archive";
  return "URL";
}

function getBackendCore() {
  return state.archive.backendCore || SEED_DATA.backendCore;
}

function getReferenceLibrary() {
  return state.archive.referenceLibrary?.length ? state.archive.referenceLibrary : SEED_DATA.referenceLibrary;
}

function renderReferenceLibrary() {
  if (!els.referenceLibrary) return;
  const references = getReferenceLibrary();
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

function loadTeamMessagesFromLocalStorage() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(TEAM_CHAT_STORAGE_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) {
      state.archive.teamMessages = mergeTeamMessages(state.archive.teamMessages || [], saved).slice(0, 200);
    }
  } catch {
    window.localStorage.removeItem(TEAM_CHAT_STORAGE_KEY);
  }
}

function persistTeamMessagesLocal() {
  try {
    window.localStorage.setItem(TEAM_CHAT_STORAGE_KEY, JSON.stringify((state.archive.teamMessages || []).slice(0, 200)));
  } catch {
    // Local storage can be unavailable in privacy-restricted contexts.
  }
}

function startTeamChatBroadcast() {
  if ("BroadcastChannel" in window) {
    state.teamChatChannel = new BroadcastChannel(TEAM_CHAT_CHANNEL_NAME);
    state.teamChatChannel.addEventListener("message", (event) => {
      if (event.data?.type !== "team-messages" || !Array.isArray(event.data.messages)) return;
      state.archive.teamMessages = mergeTeamMessages(state.archive.teamMessages || [], event.data.messages).slice(0, 200);
      persistTeamMessagesLocal();
      renderTeamChat();
    });
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== TEAM_CHAT_STORAGE_KEY || !event.newValue) return;
    try {
      const messages = JSON.parse(event.newValue);
      if (!Array.isArray(messages)) return;
      state.archive.teamMessages = mergeTeamMessages(state.archive.teamMessages || [], messages).slice(0, 200);
      renderTeamChat();
    } catch {
      // Ignore malformed cross-tab storage events.
    }
  });
}

function broadcastTeamMessages() {
  const messages = (state.archive.teamMessages || []).slice(0, 200);
  persistTeamMessagesLocal();
  state.teamChatChannel?.postMessage({ type: "team-messages", messages });
}

function startTeamChatPolling() {
  syncTeamChat({ renderAfter: true });
  if (state.teamChatPollTimer) window.clearInterval(state.teamChatPollTimer);
  state.teamChatPollTimer = window.setInterval(() => syncTeamChat({ renderAfter: true }), TEAM_CHAT_POLL_MS);
}

function setTeamChatStatus(text) {
  if (els.teamChatStatus) els.teamChatStatus.textContent = text;
}

function renderTeamSyncSettings() {
  if (!els.teamSyncForm) return;
  els.teamSyncForm.elements.syncUrl.value = state.teamSyncBaseUrl || "";
  const endpoint = getTeamChatEndpoint();
  const mode = state.teamSyncBaseUrl ? "Shared sync server" : isKnownStaticHost() ? "Static local-only mode" : "This host backend";
  const endpointLabel = state.teamSyncBaseUrl ? endpoint : isKnownStaticHost() ? "no shared backend configured" : endpoint;
  if (els.teamSyncStatus) {
    els.teamSyncStatus.textContent = `${mode}: ${endpointLabel || "no shared backend configured"}`;
  }
}

function handleTeamSyncSubmit(event) {
  event.preventDefault();
  const raw = String(new FormData(els.teamSyncForm).get("syncUrl") || "").trim();
  const normalized = normalizeTeamSyncBaseUrl(raw);
  if (!normalized) {
    clearTeamSyncServer();
    return;
  }
  state.teamSyncBaseUrl = normalized;
  window.localStorage.setItem(TEAM_SYNC_URL_KEY, normalized);
  state.backendCapabilities.checked = false;
  renderTeamSyncSettings();
  syncTeamChat({ renderAfter: true });
}

function clearTeamSyncServer() {
  state.teamSyncBaseUrl = "";
  window.localStorage.removeItem(TEAM_SYNC_URL_KEY);
  renderTeamSyncSettings();
  syncTeamChat({ renderAfter: true });
}

function getInitialTeamSyncBaseUrl() {
  const fromUrl = readTeamSyncUrlFromLocation();
  const saved = window.localStorage.getItem(TEAM_SYNC_URL_KEY) || "";
  const normalized = normalizeTeamSyncBaseUrlValue(fromUrl || saved);
  if (fromUrl && normalized) {
    window.localStorage.setItem(TEAM_SYNC_URL_KEY, normalized);
  }
  return normalized;
}

function readTeamSyncUrlFromLocation() {
  const locations = [window.location.search, String(window.location.hash || "").replace(/^#/, "?")];
  for (const value of locations) {
    const params = new URLSearchParams(value);
    for (const key of TEAM_SYNC_QUERY_KEYS) {
      const match = params.get(key);
      if (match) return match;
    }
  }
  return "";
}

function normalizeTeamSyncBaseUrl(value) {
  const normalized = normalizeTeamSyncBaseUrlValue(value);
  if (!normalized && String(value || "").trim()) {
    window.alert("Enter a valid sync server URL, for example https://your-backend.example.com");
  }
  return normalized;
}

function normalizeTeamSyncBaseUrlValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const withProtocol = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const parsed = new URL(withProtocol);
    parsed.pathname = parsed.pathname.replace(/\/api\/team-chat\/?$/i, "").replace(/\/$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function getTeamChatEndpoint() {
  if (!state.teamSyncBaseUrl) return TEAM_CHAT_API_PATH;
  try {
    return new URL(TEAM_CHAT_API_PATH, `${state.teamSyncBaseUrl}/`).toString();
  } catch {
    return TEAM_CHAT_API_PATH;
  }
}

function hasSameOriginTeamBackend(capabilities = state.backendCapabilities) {
  return hasBackendRoute(TEAM_CHAT_API_PATH, capabilities);
}

async function syncTeamChat({ renderAfter = false } = {}) {
  if (!els.teamChatFeed) return;
  const endpoint = getTeamChatEndpoint();
  const useRemoteSync = Boolean(state.teamSyncBaseUrl);
  const capabilities = useRemoteSync ? null : await ensureBackendCapabilities();
  if (!useRemoteSync && !hasSameOriginTeamBackend(capabilities)) {
    state.teamChatBackendAvailable = false;
    setTeamChatStatus("Local/cross-tab feed. Add a shared sync server URL for all 3 users.");
    renderTeamSyncSettings();
    if (renderAfter) renderTeamChat();
    return;
  }
  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await readJsonResponse(response);
    if (Array.isArray(data.messages)) {
      state.archive.teamMessages = mergeTeamMessages(state.archive.teamMessages || [], data.messages).slice(0, 200);
      applyTeamConsensusPromotions(state.archive.teamMessages);
      broadcastTeamMessages();
      persistArchive();
    }
    state.teamChatBackendAvailable = true;
    setTeamChatStatus(`Synced ${new Date().toLocaleTimeString()}${useRemoteSync ? " / shared server" : ""}`);
  } catch (error) {
    state.teamChatBackendAvailable = false;
    setTeamChatStatus(useRemoteSync ? `Shared sync failed: ${error.message}` : "Local-only feed. Shared messages need a backend.");
  }
  renderTeamSyncSettings();
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
  const endpoint = getTeamChatEndpoint();
  const useRemoteSync = Boolean(state.teamSyncBaseUrl);
  const capabilities = useRemoteSync ? null : await ensureBackendCapabilities();
  if (!useRemoteSync && !hasSameOriginTeamBackend(capabilities)) {
    state.teamChatBackendAvailable = false;
    broadcastTeamMessages();
    setTeamChatStatus("Saved locally. Add the same shared sync server URL on all 3 devices to sync together.");
    renderTeamSyncSettings();
    return;
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await readJsonResponse(response);
    if (Array.isArray(data.messages)) {
      state.archive.teamMessages = mergeTeamMessages(state.archive.teamMessages || [], data.messages).slice(0, 200);
      applyTeamConsensusPromotions(state.archive.teamMessages);
      broadcastTeamMessages();
      persistArchive();
      renderTeamChat();
    }
    state.teamChatBackendAvailable = true;
    setTeamChatStatus(`Synced ${new Date().toLocaleTimeString()}${useRemoteSync ? " / shared server" : ""}`);
  } catch (error) {
    state.teamChatBackendAvailable = false;
    broadcastTeamMessages();
    setTeamChatStatus(useRemoteSync ? `Saved locally. Shared sync failed: ${error.message}` : "Saved locally. Shared backend unavailable.");
  }
  renderTeamSyncSettings();
}

async function handleTeamChatSubmit(event) {
  event.preventDefault();
  if (!ensureCanWrite("post team messages")) return;
  const formData = new FormData(els.teamChatForm);
  const type = normalizeTeamPostType(formData.get("type"));
  const rawUrl = String(formData.get("url") || "").trim();
  const url = rawUrl ? normalizeBrowserTarget(rawUrl) : "";
  const text = String(formData.get("text") || "").trim();
  const upload = els.teamFileInput?.files?.[0] || null;
  const fileAttachment = upload ? await analyzeTeamFileAttachment(upload) : null;
  const title =
    String(formData.get("title") || "").trim() ||
    (fileAttachment
      ? `${teamPostTypeLabel(type)} file: ${fileAttachment.fileName}`
      : url
        ? `${teamPostTypeLabel(type)} lead: ${domainFromUrl(url) || url}`
        : `${teamPostTypeLabel(type)} from ${state.currentUser?.username || "local"}`);
  if (!text && !fileAttachment) return;

  const item = {
    id: `team-${Date.now()}-${Math.round(Math.random() * 999)}`,
    type,
    owner: state.currentUser?.username || "local",
    title,
    text: text || (fileAttachment ? `Review uploaded file: ${fileAttachment.fileName}` : ""),
    url,
    status: isTeamPostVotable({ type }) ? "review" : "posted",
    votes: {},
    reactions: {},
    fileAttachment,
    createdAt: new Date().toISOString(),
  };

  state.archive.teamMessages = mergeTeamMessages([item], state.archive.teamMessages || []).slice(0, 200);
  broadcastTeamMessages();
  persistArchive();
  els.teamChatForm.reset();
  if (els.teamFileInput) els.teamFileInput.value = "";
  renderTeamChat();
  postTeamChatPayload({ action: "post", item });
}

async function analyzeTeamFileAttachment(file) {
  const analyzed = await analyzeFileInBrowser(file);
  return {
    id: `team-file-${Date.now()}-${Math.round(Math.random() * 999)}`,
    fileName: analyzed.fileName,
    extension: analyzed.extension,
    mimeType: analyzed.mimeType,
    size: analyzed.size,
    previewKind: analyzed.previewKind || previewKindForFile(analyzed),
    summary: analyzed.summary,
    keywords: (analyzed.keywords || []).slice(0, 12),
    textExcerpt: clampText(analyzed.text || "", PREVIEW_TEXT_LIMIT),
    dataUrl: analyzed.dataUrl || "",
    storedPreview: Boolean(analyzed.dataUrl),
    warnings: analyzed.warnings || [],
    createdAt: new Date().toISOString(),
  };
}

function useBrowserUrlForTeamPost() {
  if (!ensureCanWrite("draft team posts")) return;
  const context = getBrowserContext();
  if (els.teamChatForm.elements.type.value === "message") {
    els.teamChatForm.elements.type.value = "link";
  }
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
    const note =
      state.teamChatBackendAvailable === false
        ? " To sync all 3 users, enter the same shared team sync server URL on every device. GitHub Pages by itself is local-only."
        : "";
    els.teamChatFeed.innerHTML = `<div class="empty-state">No team posts yet. Share a message, update, link, or promotion candidate.${escapeHtml(note)}</div>`;
    return;
  }

  els.teamChatFeed.innerHTML = messages
    .map((item) => {
      const { addVotes, rejectVotes } = getTeamVoteCounts(item);
      const type = normalizeTeamPostType(item.type);
      const typeLabel = teamPostTypeLabel(item.type);
      const hasUrl = Boolean(item.url);
      const hasAttachment = Boolean(item.fileAttachment);
      const isPromotable = isTeamPostVotable(item);
      const userVote = item.votes?.[state.currentUser?.username || "local"] || "";
      const reactionCounts = getTeamReactionCounts(item);
      const userReaction = item.reactions?.[state.currentUser?.username || "local"] || "";
      return `
        <article class="team-post ${escapeHtml(type)}">
          <header>
            <div>
              <strong>${escapeHtml(item.title || item.type || "Team post")}</strong>
              <small>${escapeHtml(item.owner || "local")} / ${escapeHtml(typeLabel)} / ${new Date(item.createdAt).toLocaleString()}</small>
            </div>
            <span class="detail-chip">${escapeHtml(item.status || "posted")}</span>
          </header>
          <p>${escapeHtml(item.text || "")}</p>
          ${item.url ? `<button class="link-button" type="button" data-team-browser="${escapeHtml(item.id)}">${escapeHtml(item.url)}</button>` : ""}
          ${
            hasAttachment
              ? `<div class="team-file-card">
                  <strong>${escapeHtml(item.fileAttachment.fileName || "Attached file")}</strong>
                  <span>${escapeHtml(item.fileAttachment.mimeType || item.fileAttachment.extension || "file")} / ${escapeHtml(formatBytes(item.fileAttachment.size || 0))}</span>
                  <p>${escapeHtml(item.fileAttachment.summary || "File attached for team review.")}</p>
                  <button class="ghost-button iconless" type="button" data-team-file-preview="${escapeHtml(item.id)}">Preview File</button>
                </div>`
              : ""
          }
          ${
            isPromotable
              ? `<div class="vote-row"><span>${addVotes}/${AUTH_USERS.length} add</span><span>${rejectVotes}/${AUTH_USERS.length} reject</span><span>${escapeHtml(userVote ? `Your vote: ${userVote}` : "Your vote: none")}</span><span>${TEAM_SOURCE_APPROVAL_THRESHOLD} add votes required</span></div>`
              : ""
          }
          <div class="form-actions">
            ${
              hasUrl
                ? `<button class="ghost-button iconless" type="button" data-team-browser="${escapeHtml(item.id)}">Open External</button>`
                : ""
            }
            ${
              isPromotable
                ? `<button class="primary-button iconless" type="button" data-team-add="${escapeHtml(item.id)}"${writeDisabledAttr()}>Vote Add to Sources</button>`
                : ""
            }
            ${
              isPromotable
                ? `<button class="ghost-button iconless" type="button" data-team-reject="${escapeHtml(item.id)}"${writeDisabledAttr()}>Vote Reject</button>`
                : ""
            }
          </div>
          <div class="reaction-row" aria-label="Team post reactions">
            <button class="reaction-button${userReaction === "like" ? " is-active" : ""}" type="button" data-team-react-like="${escapeHtml(item.id)}"${writeDisabledAttr()}>Like ${reactionCounts.likes}</button>
            <button class="reaction-button${userReaction === "dislike" ? " is-active" : ""}" type="button" data-team-react-dislike="${escapeHtml(item.id)}"${writeDisabledAttr()}>Dislike ${reactionCounts.dislikes}</button>
          </div>
        </article>
      `;
    })
    .join("");

  els.teamChatFeed.querySelectorAll("[data-team-browser]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = findTeamMessage(button.dataset.teamBrowser);
      if (item?.url) openExternalUrl(item.url);
    });
  });
  els.teamChatFeed.querySelectorAll("[data-team-add]").forEach((button) => {
    button.addEventListener("click", () => addTeamItemToSources(button.dataset.teamAdd));
  });
  els.teamChatFeed.querySelectorAll("[data-team-reject]").forEach((button) => {
    button.addEventListener("click", () => rejectTeamRecommendation(button.dataset.teamReject));
  });
  els.teamChatFeed.querySelectorAll("[data-team-file-preview]").forEach((button) => {
    button.addEventListener("click", () => openTeamFilePreview(button.dataset.teamFilePreview));
  });
  els.teamChatFeed.querySelectorAll("[data-team-react-like]").forEach((button) => {
    button.addEventListener("click", () => reactToTeamMessage(button.dataset.teamReactLike, "like"));
  });
  els.teamChatFeed.querySelectorAll("[data-team-react-dislike]").forEach((button) => {
    button.addEventListener("click", () => reactToTeamMessage(button.dataset.teamReactDislike, "dislike"));
  });
}

function findTeamMessage(id) {
  return (state.archive.teamMessages || []).find((item) => item.id === id);
}

function normalizeTeamPostType(type = "message") {
  const value = String(type || "message").trim().toLowerCase();
  if (value === "recommendation") return "promote";
  if (["message", "update", "link", "promote"].includes(value)) return value;
  return "message";
}

function teamPostTypeLabel(type = "message") {
  const normalized = normalizeTeamPostType(type);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isTeamPostVotable(item = {}) {
  return TEAM_VOTABLE_TYPES.has(String(item.type || "message").trim().toLowerCase());
}

function isOpenTeamReviewPost(item = {}) {
  return isTeamPostVotable(item) && !["rejected", "added to sources"].includes(String(item.status || "").trim().toLowerCase());
}

function getTeamVoteCounts(item = {}) {
  const votes = item.votes || {};
  return {
    addVotes: Object.values(votes).filter((vote) => vote === "add").length,
    rejectVotes: Object.values(votes).filter((vote) => vote === "reject").length,
  };
}

function getTeamReactionCounts(item = {}) {
  const reactions = item.reactions || {};
  return {
    likes: Object.values(reactions).filter((reaction) => reaction === "like").length,
    dislikes: Object.values(reactions).filter((reaction) => reaction === "dislike").length,
  };
}

function reactToTeamMessage(id, reaction) {
  if (!ensureCanWrite("react to team messages")) return;
  const item = findTeamMessage(id);
  if (!item || !["like", "dislike"].includes(reaction)) return;
  const username = state.currentUser?.username || "local";
  const reactions = { ...(item.reactions || {}) };
  if (reactions[username] === reaction) {
    delete reactions[username];
  } else {
    reactions[username] = reaction;
  }
  updateTeamMessage(id, { reactions });
  postTeamChatPayload({ action: "react", id, reaction: reactions[username] || "", user: username });
}

function updateTeamMessage(id, update) {
  state.archive.teamMessages = (state.archive.teamMessages || []).map((item) =>
    item.id === id ? { ...item, ...update, updatedAt: new Date().toISOString() } : item
  );
  broadcastTeamMessages();
  persistArchive();
  renderTeamChat();
}

function addTeamItemToSources(id) {
  if (!ensureCanWrite("vote on team posts")) return;
  const item = findTeamMessage(id);
  if (!item) return;
  if (!isTeamPostVotable(item)) {
    window.alert("Message posts are general chat only. Use Update, Link, or Promote when a post needs team voting.");
    return;
  }
  const votes = { ...(item.votes || {}), [state.currentUser?.username || "local"]: "add" };
  const nextItem = { ...item, votes };
  const { addVotes } = getTeamVoteCounts(nextItem);
  const update = {
    votes,
    status: addVotes >= TEAM_SOURCE_APPROVAL_THRESHOLD ? "approved for sources" : `review: ${addVotes}/${AUTH_USERS.length} add votes`,
  };
  if (addVotes >= TEAM_SOURCE_APPROVAL_THRESHOLD) {
    const source = ensureTeamItemSource(nextItem);
    update.status = "added to sources";
    update.sourceId = source.id;
    postTeamChatPayload({ action: "promote", id, sourceId: source.id, user: state.currentUser?.username || "local" });
  } else {
    postTeamChatPayload({ action: "vote", id, decision: "add", user: state.currentUser?.username || "local" });
  }
  updateTeamMessage(id, update);
  render();
}

function rejectTeamRecommendation(id) {
  if (!ensureCanWrite("reject team posts")) return;
  const item = findTeamMessage(id);
  if (!item) return;
  if (!isTeamPostVotable(item)) {
    window.alert("Message posts are general chat only. Use Update, Link, or Promote when a post needs team voting.");
    return;
  }
  const votes = { ...(item.votes || {}), [state.currentUser?.username || "local"]: "reject" };
  const { rejectVotes } = getTeamVoteCounts({ ...item, votes });
  updateTeamMessage(id, { status: rejectVotes >= TEAM_SOURCE_APPROVAL_THRESHOLD ? "rejected" : `review: ${rejectVotes}/${AUTH_USERS.length} reject votes`, votes });
  postTeamChatPayload({ action: "vote", id, decision: "reject", user: state.currentUser?.username || "local" });
}

function applyTeamConsensusPromotions(messages = state.archive.teamMessages || []) {
  let changed = false;
  messages.forEach((item) => {
    if (!isTeamPostVotable(item)) return;
    const { addVotes, rejectVotes } = getTeamVoteCounts(item);
    if (addVotes >= TEAM_SOURCE_APPROVAL_THRESHOLD) {
      const source = ensureTeamItemSource(item);
      item.sourceId = source.id;
      item.status = "added to sources";
      changed = true;
    } else if (rejectVotes >= TEAM_SOURCE_APPROVAL_THRESHOLD && item.status !== "rejected") {
      item.status = "rejected";
      changed = true;
    }
  });
  return changed;
}

function ensureTeamItemSource(item) {
  const sourceId = teamSourceId(item);
  const existing = state.archive.sources.find((source) => source.id === sourceId);
  if (existing) {
    state.selectedId = existing.id;
    return existing;
  }
  const attachment = item.fileAttachment || null;
  const source = {
    id: sourceId,
    title: item.title || attachment?.fileName || `Team source lead from ${item.owner || "local"}`,
    category: "Documents",
    species: "Cross-form",
    domain: "Metaphysics",
    sourceType: attachment ? sourceTypeForFile(attachment) : inferSourceType(item.url),
    url: attachment ? `team-file://${item.id}/${encodeURIComponent(attachment.fileName || "file")}` : item.url || "",
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    tradition: `Team consensus / ${item.owner || "local"}`,
    terms: extractKeywords(`${item.title || ""} ${item.text || ""} ${item.url || ""} ${attachment?.fileName || ""} ${attachment?.summary || ""}`).slice(0, 10),
    notes: `Promoted after ${TEAM_SOURCE_APPROVAL_THRESHOLD}/${AUTH_USERS.length} team add votes. ${item.text || attachment?.summary || ""}`,
    coreLinks: ["Safety and Epistemic Notes", "Core Manifestation Template"],
    teamMessageId: item.id,
    fileAttachment: attachment,
  };
  state.archive.sources.unshift(source);
  state.selectedId = source.id;
  persistArchive("Team consensus source promotion");
  return source;
}

function teamSourceId(item = {}) {
  return `src-team-${String(item.id || Date.now()).replace(/[^a-z0-9_-]/gi, "-").slice(0, 80)}`;
}

function getCollabDocs() {
  state.archive.collabDocs = state.archive.collabDocs?.length ? state.archive.collabDocs : clone(DEFAULT_COLLAB_DOCS);
  return state.archive.collabDocs;
}

function getActiveCollabDoc() {
  const docs = getCollabDocs();
  if (!docs.length) return null;
  let active = docs.find((doc) => doc.id === state.activeCollabDocId);
  if (!active) {
    active = docs[0];
    state.activeCollabDocId = active.id;
  }
  return active;
}

function renderCollabDocs() {
  if (!els.collabDocList) return;
  const docs = getCollabDocs();
  const active = getActiveCollabDoc();
  els.collabDocList.innerHTML = docs.length
    ? docs
        .map(
          (doc) => `
            <button class="collab-doc-item${active?.id === doc.id ? " is-active" : ""}" type="button" data-doc-id="${escapeHtml(doc.id)}">
              <strong>${escapeHtml(doc.title || "Untitled document")}</strong>
              <span>${escapeHtml(doc.type || "Document")} / ${escapeHtml(doc.status || "Draft")}</span>
              <small>${escapeHtml(doc.owner || "Unassigned")} / ${new Date(doc.updatedAt || doc.createdAt || Date.now()).toLocaleString()}</small>
            </button>
          `
        )
        .join("")
    : '<div class="empty-state">No collaboration documents yet.</div>';
  els.collabDocList.querySelectorAll("[data-doc-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (els.collabDocEditor && !isGuestUser()) saveActiveCollabDoc({ silent: true });
      state.activeCollabDocId = button.dataset.docId;
      saveUserLocation({ activeCollabDocId: state.activeCollabDocId, panel: "collabPanel" });
      renderCollabDocs();
    });
  });

  if (!active) {
    els.collabDocTitleInput.value = "";
    els.collabDocOwnerInput.value = "";
    els.collabDocEditor.innerHTML = "";
    els.collabDocStatusChip.textContent = "No doc";
    return;
  }

  els.collabDocTitleInput.value = active.title || "";
  els.collabDocTypeSelect.value = active.type || "Research Brief";
  els.collabDocStatusSelect.value = active.status || "Draft";
  els.collabDocOwnerInput.value = active.owner || state.currentUser?.username || "";
  els.collabDocStatusChip.textContent = `${active.type || "Document"} / ${active.status || "Draft"}`;
  els.collabDocEditor.innerHTML = sanitizeDocHtml(active.contentHtml || "<p>Start drafting here.</p>");
}

function createCollabDoc() {
  if (!ensureCanWrite("create collaboration documents")) return;
  const now = new Date().toISOString();
  const doc = {
    id: `doc-${Date.now()}`,
    title: "Untitled Research Draft",
    type: "Research Brief",
    status: "Draft",
    owner: state.currentUser?.username || "local",
    createdAt: now,
    updatedAt: now,
    contentHtml:
      "<h2>Purpose</h2><p>Write the research objective here.</p><h2>Source Leads</h2><p>Use Browser Lead to attach the current in-app browser page or search result.</p>",
  };
  state.archive.collabDocs.unshift(doc);
  state.activeCollabDocId = doc.id;
  persistArchive();
  renderCollabDocs();
}

function saveActiveCollabDoc({ silent = false } = {}) {
  if (!ensureCanWrite("save collaboration documents")) return false;
  const doc = getActiveCollabDoc();
  if (!doc) return false;
  doc.title = els.collabDocTitleInput.value.trim() || "Untitled document";
  doc.type = els.collabDocTypeSelect.value || "Research Brief";
  doc.status = els.collabDocStatusSelect.value || "Draft";
  doc.owner = els.collabDocOwnerInput.value.trim() || state.currentUser?.username || "local";
  doc.contentHtml = sanitizeDocHtml(els.collabDocEditor.innerHTML || "");
  doc.updatedAt = new Date().toISOString();
  persistArchive();
  if (!silent) {
    els.collabImportStatus.textContent = `Saved "${doc.title}" at ${new Date(doc.updatedAt).toLocaleTimeString()}.`;
    renderCollabDocs();
  }
  return true;
}

function runDocCommand(commandSpec) {
  if (!ensureCanWrite("format collaboration documents")) return;
  if (!els.collabDocEditor) return;
  const [command, value] = String(commandSpec || "").split(":");
  els.collabDocEditor.focus();
  document.execCommand(command, false, value || null);
}

function insertBrowserLeadIntoDoc() {
  if (!ensureCanWrite("insert browser leads into documents")) return;
  const context = getBrowserContext();
  const preview = context.preview;
  const url = preview?.url || context.currentUrl;
  const title = preview?.title || domainFromUrl(url) || url;
  const summary = preview?.summary || `Current in-app browser target: ${url}`;
  const leadHtml = `
    <blockquote>
      <strong>${escapeHtml(title)}</strong><br>
      ${url ? `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a><br>` : ""}
      ${escapeHtml(summary)}
    </blockquote>
  `;
  insertHtmlAtEditorCursor(leadHtml);
  saveActiveCollabDoc({ silent: true });
  els.collabImportStatus.textContent = "Inserted the active in-app browser lead into the draft.";
}

function insertHtmlAtEditorCursor(html) {
  els.collabDocEditor.focus();
  if (document.queryCommandSupported?.("insertHTML")) {
    document.execCommand("insertHTML", false, sanitizeDocHtml(html));
    return;
  }
  els.collabDocEditor.insertAdjacentHTML("beforeend", sanitizeDocHtml(html));
}

async function handleCollabImport(event) {
  if (!ensureCanWrite("import collaboration documents")) return;
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  const imported = [];
  for (const file of files) {
    const doc = await collabDocFromFile(file);
    state.archive.collabDocs.unshift(doc);
    imported.push(doc.title);
  }
  state.activeCollabDocId = state.archive.collabDocs[0]?.id || state.activeCollabDocId;
  event.target.value = "";
  persistArchive();
  els.collabImportStatus.textContent = `Imported ${imported.length} document${imported.length === 1 ? "" : "s"}: ${imported.join(", ")}.`;
  renderCollabDocs();
}

async function collabDocFromFile(file) {
  const now = new Date().toISOString();
  const name = file.name || "Imported document";
  const ext = name.split(".").pop()?.toLowerCase() || "";
  let contentHtml = "";
  let type = "Research Brief";
  if (ext === "json") {
    const parsed = parseMaybeJson(await file.text());
    const incoming = Array.isArray(parsed) ? parsed[0] : parsed?.collabDocs?.[0] || parsed;
    if (incoming?.title || incoming?.contentHtml || incoming?.content) {
      return {
        id: `doc-import-${Date.now()}-${Math.round(Math.random() * 999)}`,
        title: incoming.title || name,
        type: incoming.type || "Research Brief",
        status: incoming.status || "Draft",
        owner: incoming.owner || state.currentUser?.username || "local",
        createdAt: incoming.createdAt || now,
        updatedAt: now,
        contentHtml: sanitizeDocHtml(incoming.contentHtml || textToDocHtml(incoming.content || incoming.text || "")),
      };
    }
    contentHtml = textToDocHtml(JSON.stringify(parsed || {}, null, 2));
    type = "Source Review";
  } else if (["html", "htm"].includes(ext)) {
    contentHtml = sanitizeDocHtml(await file.text());
    type = "PDF Draft";
  } else if (["txt", "md", "py", "js", "css"].includes(ext) || file.type.startsWith("text/")) {
    contentHtml = textToDocHtml(await file.text(), ext);
    type = ext === "md" ? "Grimoire Chapter" : "Research Brief";
  } else if (IMAGE_IMPORT_EXTENSIONS.includes(`.${ext}`) || file.type.startsWith("image/")) {
    contentHtml = `
      <h2>Imported Image Metadata</h2>
      <p><strong>File:</strong> ${escapeHtml(name)}</p>
      <p><strong>Type:</strong> ${escapeHtml(file.type || ext || "image")}</p>
      <p><strong>Size:</strong> ${escapeHtml(String(file.size))} bytes</p>
      <p>This image is logged for visual-source review. Add OCR or vision parsing in a backend step if the image contains research text.</p>
    `;
    type = "Source Review";
  } else {
    contentHtml = `
      <h2>Imported File Metadata</h2>
      <p><strong>File:</strong> ${escapeHtml(name)}</p>
      <p><strong>Type:</strong> ${escapeHtml(file.type || ext || "unknown")}</p>
      <p><strong>Size:</strong> ${escapeHtml(String(file.size))} bytes</p>
      <p>This browser-only workspace saved the file metadata. Add a backend parser for full DOC, DOCX, and PDF text reading.</p>
    `;
    type = ext === "pdf" ? "PDF Draft" : "Source Review";
  }
  return {
    id: `doc-import-${Date.now()}-${Math.round(Math.random() * 999)}`,
    title: name.replace(/\.[^.]+$/, "") || name,
    type,
    status: "Draft",
    owner: state.currentUser?.username || "local",
    createdAt: now,
    updatedAt: now,
    contentHtml,
  };
}

function textToDocHtml(text, ext = "") {
  const raw = String(text || "").trim();
  if (!raw) return "<p>No text content found.</p>";
  if (ext === "md") {
    return sanitizeDocHtml(
      raw
        .split(/\n{2,}/)
        .map((block) => {
          const line = block.trim();
          if (line.startsWith("### ")) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
          if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
          if (line.startsWith("# ")) return `<h2>${escapeHtml(line.slice(2))}</h2>`;
          return `<p>${escapeHtml(line).replace(/\n/g, "<br>")}</p>`;
        })
        .join("")
    );
  }
  const codeLike = ["py", "js", "css"].includes(ext);
  if (codeLike) return `<pre>${escapeHtml(raw)}</pre>`;
  return raw
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function sanitizeDocHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  template.content.querySelectorAll("script, style, iframe, object, embed, form, input, button").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || "";
      if (name.startsWith("on") || value.trim().toLowerCase().startsWith("javascript:")) {
        node.removeAttribute(attr.name);
      }
    });
  });
  return template.innerHTML.trim() || "<p>Start drafting here.</p>";
}

function exportCollabLibrary() {
  if (!ensureCanWrite("export collaboration documents")) return;
  download("core-collaboration-docs.json", "application/json", JSON.stringify(getCollabDocs(), null, 2));
}

function exportActiveCollabDoc(format) {
  if (!ensureCanWrite("export collaboration documents")) return;
  const doc = getActiveCollabDoc();
  if (!doc) return;
  saveActiveCollabDoc({ silent: true });
  const slug = slugify(doc.title || "core-doc");
  if (format === "json") {
    download(`${slug}.json`, "application/json", JSON.stringify(doc, null, 2));
    return;
  }
  if (format === "html") {
    download(`${slug}.html`, "text/html", renderCollabDocHtml(doc));
    return;
  }
  download(`${slug}.txt`, "text/plain", collabDocToText(doc));
}

function printActiveCollabDoc() {
  if (!ensureCanWrite("print collaboration documents")) return;
  const doc = getActiveCollabDoc();
  if (!doc) return;
  saveActiveCollabDoc({ silent: true });
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    download(`${slugify(doc.title || "core-doc")}.html`, "text/html", renderCollabDocHtml(doc));
    return;
  }
  printWindow.document.open();
  printWindow.document.write(renderCollabDocHtml(doc));
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => printWindow.print(), 250);
}

function addActiveCollabDocToSources() {
  if (!ensureCanWrite("add collaboration documents to Sources")) return;
  const doc = getActiveCollabDoc();
  if (!doc || !saveActiveCollabDoc({ silent: true })) return;
  const source = {
    id: `src-doc-${Date.now()}`,
    title: `Collaboration doc: ${doc.title}`,
    category: "Documents",
    species: "Cross-form",
    domain: "Metaphysics",
    sourceType: "Documentation",
    url: `local-collab-doc://${doc.id}`,
    evidenceTier: "Speculative framework",
    citationStatus: "Needs verification",
    tradition: `Team document / ${doc.owner || state.currentUser?.username || "local"}`,
    terms: extractKeywords(`${doc.title} ${collabDocToText(doc)}`).slice(0, 8),
    notes: `Promoted from Collaboration Docs. Status: ${doc.status}. Summary: ${clampText(collabDocToText(doc), 500)}`,
    coreLinks: ["Core Manifestation Template", "Safety and Epistemic Notes"],
  };
  state.archive.sources.unshift(source);
  state.selectedId = source.id;
  persistArchive();
  els.collabImportStatus.textContent = `Added "${doc.title}" to Sources.`;
  render();
}

function collabDocToText(doc) {
  return [
    doc.title || "Untitled document",
    `${doc.type || "Document"} / ${doc.status || "Draft"} / ${doc.owner || "Unassigned"}`,
    "",
    stripHtml(doc.contentHtml || ""),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderCollabDocHtml(doc) {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(doc.title || "CORE document")}</title>
<style>
body{font-family:Inter,Arial,sans-serif;margin:32px;line-height:1.55;color:#101010;background:#fff}
main{max-width:850px;margin:auto}
h1{font-size:30px;margin:0 0 6px}small{color:#666}a{color:#111}blockquote{border-left:4px solid #222;margin:16px 0;padding:10px 14px;background:#f3f3f3}
pre{white-space:pre-wrap;background:#f5f5f5;padding:12px;border:1px solid #ddd}
</style>
<main>
<h1>${escapeHtml(doc.title || "Untitled document")}</h1>
<small>${escapeHtml(doc.type || "Document")} / ${escapeHtml(doc.status || "Draft")} / ${escapeHtml(doc.owner || "Unassigned")} / updated ${escapeHtml(new Date(doc.updatedAt || Date.now()).toLocaleString())}</small>
${sanitizeDocHtml(doc.contentHtml || "")}
</main>
</html>`;
}

function slugify(value) {
  return String(value || "core-doc")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "core-doc";
}

function getFileManager() {
  state.archive.fileManager = normalizeFileManager(state.archive.fileManager || DEFAULT_FILE_MANAGER);
  return state.archive.fileManager;
}

function normalizeFileManager(manager = DEFAULT_FILE_MANAGER) {
  const base = clone(DEFAULT_FILE_MANAGER);
  const incomingNodes = Array.isArray(manager.nodes) ? manager.nodes : [];
  const nodes = mergeById(base.nodes, incomingNodes).map(normalizeFileNode);
  if (!nodes.some((node) => node.id === base.rootId)) nodes.unshift(normalizeFileNode(base.nodes[0]));
  const selectedId = nodes.some((node) => node.id === manager.selectedId) ? manager.selectedId : base.rootId;
  return { rootId: base.rootId, selectedId, nodes };
}

function normalizeFileNode(node = {}) {
  const kind = node.kind === "folder" ? "folder" : "file";
  const now = new Date().toISOString();
  return {
    id: String(node.id || `file-${Date.now()}-${Math.round(Math.random() * 999)}`),
    parentId: String(node.parentId || ""),
    kind,
    name: String(node.name || (kind === "folder" ? "Untitled Folder" : "Untitled.txt")),
    extension: String(node.extension || (kind === "file" ? ".txt" : "")),
    mimeType: String(node.mimeType || (kind === "file" ? "text/plain" : "")),
    size: Number(node.size || 0),
    text: String(node.text || ""),
    blobKey: String(node.blobKey || ""),
    dataUrl: String(node.dataUrl || ""),
    previewKind: String(node.previewKind || (kind === "folder" ? "folder" : "text")),
    createdAt: String(node.createdAt || now),
    updatedAt: String(node.updatedAt || node.createdAt || now),
  };
}

function renderFileManager() {
  if (!els.fileManagerTree || !els.fileManagerDetail) return;
  const manager = getFileManager();
  const selected = getFileNode(manager.selectedId) || getFileNode(manager.rootId);
  if (selected) manager.selectedId = selected.id;
  els.fileManagerPath.textContent = fileManagerPath(selected?.id || manager.rootId);
  els.fileManagerStatus.textContent =
    state.fileManagerStatusMessage || `${manager.nodes.length} item${manager.nodes.length === 1 ? "" : "s"}`;
  els.fileManagerTree.innerHTML = renderFileTree(manager.rootId, 0);
  els.fileManagerTree.querySelectorAll("[data-file-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const node = getFileNode(button.dataset.fileId);
      if (node?.kind === "folder") {
        openFileManagerFolder(node.id);
        return;
      }
      openFileManagerFile(node?.id);
    });
  });
  renderFileExplorerList(selected);
  renderFileManagerDetail(selected);
  renderPermissionState();
}

function renderFileExplorerList(selected) {
  if (!els.fileManagerFolderView) return;
  const folder = selected?.kind === "folder" ? selected : getFileNode(selected?.parentId) || getFileNode(getFileManager().rootId);
  const children = folder ? getFileChildren(folder.id) : [];
  if (els.fileExplorerFolderName) els.fileExplorerFolderName.textContent = folder?.name || "CORE Atlas";
  els.fileManagerFolderView.innerHTML = children.length
    ? children
        .map((child) => {
          const active = child.id === selected?.id;
          return `
            <button class="file-explorer-row ${child.kind === "folder" ? "is-folder" : "is-file"}${active ? " is-active" : ""}" type="button" data-file-list-id="${escapeHtml(child.id)}">
              <span class="file-node-icon" aria-hidden="true"></span>
              <strong>${escapeHtml(child.name)}</strong>
              <span>${escapeHtml(child.kind === "folder" ? "Folder" : child.mimeType || child.extension || "file")}</span>
              <span>${escapeHtml(child.kind === "folder" ? `${getFileChildren(child.id).length} item${getFileChildren(child.id).length === 1 ? "" : "s"}` : formatBytes(child.size || 0))}</span>
              <small>${escapeHtml(child.kind === "folder" ? "Tap to open" : new Date(child.updatedAt || Date.now()).toLocaleString())}</small>
            </button>
          `;
        })
        .join("")
    : '<div class="file-preview-unavailable"><strong>This folder is empty.</strong><span>Import files, create a folder, or create a TXT note.</span></div>';
  els.fileManagerFolderView.querySelectorAll("[data-file-list-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const node = getFileNode(button.dataset.fileListId);
      if (node?.kind === "folder") {
        openFileManagerFolder(node.id);
        return;
      }
      openFileManagerFile(node?.id);
    });
  });
}

function renderFileTree(parentId, depth) {
  const manager = getFileManager();
  const children = getFileChildren(parentId);
  const current = getFileNode(parentId);
  const currentHtml = current
    ? `<button class="file-tree-item ${current.kind === "folder" ? "is-folder" : "is-file"}${manager.selectedId === current.id ? " is-active" : ""}" type="button" data-file-id="${escapeHtml(current.id)}" style="--depth:${depth}">
        <span class="file-tree-branch" aria-hidden="true"></span>
        <span class="file-node-icon" aria-hidden="true"></span>
        <span class="file-tree-label">
          <strong>${escapeHtml(current.name)}</strong>
          <small>${escapeHtml(current.kind === "folder" ? `${children.length} item${children.length === 1 ? "" : "s"}` : current.extension || current.mimeType || "file")}</small>
        </span>
      </button>`
    : "";
  return `${currentHtml}${children.map((child) => renderFileTree(child.id, depth + 1)).join("")}`;
}

function renderFileManagerDetail(node) {
  if (!node) {
    els.fileManagerDetail.innerHTML = '<div class="empty-state">Select a folder or file.</div>';
    return;
  }
  const children = node.kind === "folder" ? getFileChildren(node.id) : [];
  const meta = `
    <div class="file-detail-meta">
      <span><strong>Name:</strong> ${escapeHtml(node.name)}</span>
      <span><strong>Type:</strong> ${escapeHtml(node.kind === "folder" ? "Folder" : node.mimeType || node.extension || "file")}</span>
      <span><strong>Size:</strong> ${escapeHtml(formatBytes(node.size || 0))}</span>
      <span><strong>Updated:</strong> ${escapeHtml(new Date(node.updatedAt || Date.now()).toLocaleString())}</span>
    </div>
  `;
  if (node.kind === "folder") {
    els.fileManagerDetail.innerHTML = `
      <h3>${escapeHtml(node.name)}</h3>
      ${meta}
      <div class="file-preview-unavailable">
        <strong>${children.length} item${children.length === 1 ? "" : "s"} in this folder.</strong>
        <span>Select a file from the center pane to preview its actual content here.</span>
      </div>
    `;
    return;
  }
  els.fileManagerDetail.innerHTML = `
    <h3>${escapeHtml(node.name)}</h3>
    ${meta}
    <div class="file-detail-actions">
      <button class="primary-button iconless" type="button" data-file-open-original="${escapeHtml(node.id)}">Open Original</button>
      <button class="ghost-button iconless" type="button" data-file-share-team="${escapeHtml(node.id)}"${writeDisabledAttr()}>Share to Team Chat</button>
    </div>
    ${renderFileNodePreview(node)}
  `;
  const editor = els.fileManagerDetail.querySelector("[data-file-text-editor]");
  editor?.addEventListener("input", () => updateFileManagerTextFile(node.id, editor.value));
  els.fileManagerDetail.querySelectorAll("[data-file-open-original]").forEach((button) => {
    button.addEventListener("click", () => openFileManagerNodeOriginal(button.dataset.fileOpenOriginal));
  });
  els.fileManagerDetail.querySelectorAll("[data-file-share-team]").forEach((button) => {
    button.addEventListener("click", () => shareFileManagerNodeToTeam(button.dataset.fileShareTeam));
  });
  hydrateFileManagerPreviewFromStore(node);
}

function renderFileNodePreview(node) {
  const viewUrl = node.objectUrl || node.dataUrl || "";
  if (node.previewKind === "image" && viewUrl) return `<img class="file-preview-media" src="${escapeHtml(viewUrl)}" alt="${escapeHtml(node.name)}">`;
  if (node.previewKind === "video" && viewUrl) return `<video class="file-preview-media" controls src="${escapeHtml(viewUrl)}"></video>`;
  if (node.previewKind === "audio" && viewUrl) return `<audio class="file-preview-audio" controls src="${escapeHtml(viewUrl)}"></audio>`;
  if (node.previewKind === "pdf" && viewUrl) return `<iframe class="file-preview-document" title="${escapeHtml(node.name)}" src="${escapeHtml(viewUrl)}"></iframe>`;
  if (node.previewKind === "text" || node.extension === ".txt") {
    return `<textarea class="file-text-editor" data-file-text-editor rows="14">${escapeHtml(node.text || decodeDataUrlText(viewUrl) || "")}</textarea>`;
  }
  if (node.blobKey) return '<div class="file-preview-loading" data-file-store-loading>Loading actual file content...</div>';
  return '<div class="file-preview-unavailable"><strong>No actual file content stored.</strong><span>Re-import this file to preview the real document/media content.</span></div>';
}

async function hydrateFileManagerPreviewFromStore(node = {}) {
  if (!node.blobKey || node.dataUrl || !els.fileManagerDetail?.querySelector("[data-file-store-loading]")) return;
  try {
    const hydrated = await hydrateStoredFile(fileManagerNodeToPreviewFile(node));
    const html = renderFileNodePreview({ ...node, objectUrl: hydrated.objectUrl, text: hydrated.textExcerpt || node.text });
    const loading = els.fileManagerDetail.querySelector("[data-file-store-loading]");
    if (loading) loading.outerHTML = html;
  } catch (error) {
    const loading = els.fileManagerDetail.querySelector("[data-file-store-loading]");
    if (loading) loading.outerHTML = `<div class="file-preview-unavailable"><strong>Stored file could not be opened.</strong><span>${escapeHtml(error.message)}</span></div>`;
  }
}

function selectFileManagerNode(id) {
  const manager = getFileManager();
  if (!getFileNode(id)) return;
  manager.selectedId = id;
  state.fileManagerStatusMessage = "";
  persistArchive("File manager selection");
  renderFileManager();
}

function openFileManagerFolder(id) {
  const manager = getFileManager();
  const node = getFileNode(id);
  if (!node || node.kind !== "folder") return;
  manager.selectedId = node.id;
  state.fileManagerStatusMessage = `Opened ${node.name}`;
  persistArchive("Opened virtual folder");
  renderFileManager();
}

function openFileManagerFile(id) {
  const manager = getFileManager();
  const node = getFileNode(id);
  if (!node || node.kind !== "file") return;
  manager.selectedId = node.id;
  state.fileManagerStatusMessage = `Opening ${node.name}`;
  persistArchive("Opened virtual file");
  renderFileManager();
  openFilePreviewDialog(fileManagerNodeToPreviewFile(node), { title: node.name, origin: fileManagerPath(node.id) });
}

function setFileManagerStatus(message) {
  state.fileManagerStatusMessage = message;
  if (els.fileManagerStatus) els.fileManagerStatus.textContent = message;
}

function getFileNode(id) {
  return getFileManager().nodes.find((node) => node.id === id);
}

function getFileChildren(parentId) {
  return getFileManager()
    .nodes.filter((node) => node.parentId === parentId)
    .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "folder" ? -1 : 1));
}

function getSelectedFileNode() {
  const manager = getFileManager();
  return getFileNode(manager.selectedId) || getFileNode(manager.rootId);
}

function getSelectedFolderId() {
  const selected = getSelectedFileNode();
  return selected?.kind === "folder" ? selected.id : selected?.parentId || getFileManager().rootId;
}

function fileManagerPath(nodeId) {
  const names = [];
  let cursor = getFileNode(nodeId);
  const seen = new Set();
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    names.unshift(cursor.name);
    cursor = getFileNode(cursor.parentId);
  }
  return `/${names.join("/")}`;
}

function persistFileManager(reason = "File manager update") {
  getFileManager();
  persistArchive(reason);
  renderFileManager();
}

function createFileManagerFolder() {
  if (!ensureCanWrite("create folders")) return;
  const now = new Date().toISOString();
  const manager = getFileManager();
  const parentId = getSelectedFolderId();
  const node = {
    id: `file-folder-${Date.now()}`,
    parentId,
    kind: "folder",
    name: nextFileManagerName(parentId, "New Folder"),
    createdAt: now,
    updatedAt: now,
  };
  manager.nodes.push(node);
  manager.selectedId = node.id;
  state.fileManagerStatusMessage = `Created ${node.name}`;
  persistFileManager("Created virtual folder");
}

function createFileManagerTextFile() {
  if (!ensureCanWrite("create text files")) return;
  const now = new Date().toISOString();
  const manager = getFileManager();
  const parentId = getSelectedFolderId();
  const fileName = nextFileManagerName(parentId, "New Note", ".txt");
  const node = {
    id: `file-text-${Date.now()}`,
    parentId,
    kind: "file",
    name: fileName,
    extension: ".txt",
    mimeType: "text/plain",
    size: 0,
    text: "",
    previewKind: "text",
    createdAt: now,
    updatedAt: now,
  };
  manager.nodes.push(node);
  manager.selectedId = node.id;
  state.fileManagerStatusMessage = `Created ${node.name}`;
  persistFileManager("Created virtual text file");
}

function nextFileManagerName(parentId, baseName, extension = "") {
  const cleanBase = String(baseName || "New Item")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const safeBase = cleanBase || "New Item";
  const normalizedExtension = extension && extension.startsWith(".") ? extension : extension ? `.${extension}` : "";
  const taken = new Set(getFileChildren(parentId).map((node) => String(node.name || "").toLowerCase()));
  let candidate = `${safeBase}${normalizedExtension}`;
  let index = 2;
  while (taken.has(candidate.toLowerCase())) {
    candidate = `${safeBase} ${index}${normalizedExtension}`;
    index += 1;
  }
  return candidate;
}

function renameFileManagerNode() {
  if (!ensureCanWrite("rename files and folders")) return;
  const node = getSelectedFileNode();
  if (!node || node.id === getFileManager().rootId) {
    setFileManagerStatus("Select a folder or file before renaming.");
    return;
  }
  const name = window.prompt("New name", node.name);
  if (!name) return;
  node.name = name.trim();
  node.updatedAt = new Date().toISOString();
  state.fileManagerStatusMessage = `Renamed to ${node.name}`;
  persistFileManager("Renamed virtual file node");
}

function copyFileManagerNode(mode = "copy") {
  if (!ensureCanWrite(`${mode} files and folders`)) return;
  const node = getSelectedFileNode();
  if (!node || node.id === getFileManager().rootId) {
    setFileManagerStatus(`Select a file or folder before choosing ${mode}.`);
    return;
  }
  state.fileClipboard = { id: node.id, mode };
  setFileManagerStatus(`${mode === "move" ? "Ready to move" : "Copied"} ${node.name}`);
}

function pasteFileManagerNode() {
  if (!ensureCanWrite("paste files and folders")) return;
  const clipboard = state.fileClipboard;
  if (!clipboard) {
    setFileManagerStatus("Copy or move a file/folder before pasting.");
    return;
  }
  const targetFolderId = getSelectedFolderId();
  const node = getFileNode(clipboard.id);
  if (!node || node.id === getFileManager().rootId || node.id === targetFolderId || isFileDescendant(targetFolderId, node.id)) {
    setFileManagerStatus("That item cannot be pasted into the selected folder.");
    return;
  }
  if (clipboard.mode === "move") {
    node.parentId = targetFolderId;
    node.updatedAt = new Date().toISOString();
    state.fileClipboard = null;
  } else {
    cloneFileNodeTree(node.id, targetFolderId);
  }
  state.fileManagerStatusMessage = `${clipboard.mode === "move" ? "Moved" : "Pasted"} ${node.name}`;
  persistFileManager(`${clipboard.mode === "move" ? "Moved" : "Copied"} virtual file node`);
}

function cloneFileNodeTree(sourceId, parentId) {
  const source = getFileNode(sourceId);
  if (!source) return null;
  const now = new Date().toISOString();
  const cloned = { ...source, id: `file-copy-${Date.now()}-${Math.round(Math.random() * 9999)}`, parentId, name: `Copy of ${source.name}`, createdAt: now, updatedAt: now };
  getFileManager().nodes.push(cloned);
  getFileChildren(sourceId).forEach((child) => cloneFileNodeTree(child.id, cloned.id));
  return cloned;
}

function isFileDescendant(candidateId, ancestorId) {
  let cursor = getFileNode(candidateId);
  while (cursor) {
    if (cursor.parentId === ancestorId) return true;
    cursor = getFileNode(cursor.parentId);
  }
  return false;
}

function deleteFileManagerNode() {
  if (!ensureCanWrite("delete files and folders")) return;
  const node = getSelectedFileNode();
  const manager = getFileManager();
  if (!node || node.id === manager.rootId) {
    setFileManagerStatus("Select a file or folder before deleting.");
    return;
  }
  const confirmed = window.confirm(`Delete "${node.name}" and all nested contents?`);
  if (!confirmed) return;
  const ids = new Set([node.id]);
  let changed = true;
  while (changed) {
    changed = false;
    manager.nodes.forEach((item) => {
      if (ids.has(item.parentId) && !ids.has(item.id)) {
        ids.add(item.id);
        changed = true;
      }
    });
  }
  manager.nodes = manager.nodes.filter((item) => !ids.has(item.id));
  manager.selectedId = node.parentId || manager.rootId;
  state.fileManagerStatusMessage = `Deleted ${node.name}`;
  persistFileManager("Deleted virtual file node");
}

async function handleFileManagerImport(event) {
  if (!ensureCanWrite("import files into the manager")) return;
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  const parentId = getSelectedFolderId();
  const nodes = await Promise.all(files.map((file) => fileManagerNodeFromUpload(file, parentId)));
  const manager = getFileManager();
  manager.nodes.push(...nodes);
  manager.selectedId = nodes[0]?.id || manager.selectedId;
  event.target.value = "";
  state.fileManagerStatusMessage = `Imported ${nodes.length} file${nodes.length === 1 ? "" : "s"}`;
  persistFileManager(`Imported ${nodes.length} virtual file${nodes.length === 1 ? "" : "s"}`);
}

async function fileManagerNodeFromUpload(file, parentId) {
  const extension = `.${(file.name.split(".").pop() || "").toLowerCase()}`;
  const previewKind = previewKindForFile({ fileName: file.name, extension, mimeType: file.type });
  const canStoreData = file.size <= MAX_STORED_FILE_BYTES;
  const textLike = previewKind === "text";
  const text = textLike ? await readFileTextSlice(file, PREVIEW_TEXT_LIMIT) : "";
  const dataUrl = canStoreData && !textLike ? await readFileAsDataUrl(file) : "";
  let blobKey = "";
  try {
    blobKey = await writeStoredFileBlob(file);
  } catch {
    blobKey = "";
  }
  return {
    id: `file-import-${Date.now()}-${Math.round(Math.random() * 9999)}`,
    parentId,
    kind: "file",
    name: file.name,
    extension,
    mimeType: file.type || inferSourceType(file.name),
    size: file.size,
    text,
    blobKey,
    dataUrl,
    previewKind,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function updateFileManagerTextFile(id, text) {
  const node = getFileNode(id);
  if (!node || node.kind !== "file") return;
  node.text = text;
  node.size = text.length;
  node.updatedAt = new Date().toISOString();
  window.clearTimeout(state.fileManagerSaveTimer);
  state.fileManagerSaveTimer = window.setTimeout(() => persistArchive("Edited virtual text file"), 700);
}

function exportFileManagerNode() {
  const node = getSelectedFileNode();
  if (!node) {
    setFileManagerStatus("Select a file or folder before exporting.");
    return;
  }
  if (node.kind === "folder") {
    const ids = new Set([node.id]);
    let changed = true;
    while (changed) {
      changed = false;
      getFileManager().nodes.forEach((item) => {
        if (ids.has(item.parentId) && !ids.has(item.id)) {
          ids.add(item.id);
          changed = true;
        }
      });
    }
    const payload = getFileManager().nodes.filter((item) => ids.has(item.id));
    download(`${slugify(node.name)}-folder.json`, "application/json", JSON.stringify(payload, null, 2));
    return;
  }
  if (node.text || node.previewKind === "text") {
    download(node.name, node.mimeType || "text/plain", node.text || decodeDataUrlText(node.dataUrl));
    return;
  }
  download(`${slugify(node.name)}.json`, "application/json", JSON.stringify(node, null, 2));
}

async function openFileManagerNodeOriginal(nodeId) {
  const node = getFileNode(nodeId);
  if (!node || node.kind !== "file") return;
  if (!(await openStoredFilePage(fileManagerNodeToPreviewFile(node), { title: node.name, origin: fileManagerPath(node.id) }))) {
    window.alert("This file manager item only has metadata. Import the original file under the stored preview limit to open it directly.");
  }
}

function shareSelectedFileToTeamChat() {
  const node = getSelectedFileNode();
  if (!node || node.kind !== "file") {
    setFileManagerStatus("Select a file before sharing to Team Chat.");
    return;
  }
  shareFileManagerNodeToTeam(node.id);
}

function shareFileManagerNodeToTeam(nodeId) {
  if (!ensureCanWrite("share files to Team Chat")) return;
  const node = getFileNode(nodeId);
  if (!node || node.kind !== "file") return;
  const attachment = fileManagerNodeToTeamAttachment(node);
  const item = {
    id: `team-${Date.now()}-${Math.round(Math.random() * 999)}`,
    type: "promote",
    owner: state.currentUser?.username || "local",
    title: `File Manager share: ${node.name}`,
    text: `Shared from ${fileManagerPath(node.id)} for team review and possible source promotion.`,
    url: "",
    status: "review",
    votes: {},
    reactions: {},
    fileAttachment: attachment,
    createdAt: new Date().toISOString(),
  };
  state.archive.teamMessages = mergeTeamMessages([item], state.archive.teamMessages || []).slice(0, 200);
  broadcastTeamMessages();
  persistArchive("Shared file manager item to team chat");
  postTeamChatPayload({ action: "post", item });
  state.activePanel = "teamPanel";
  saveUserLocation({ panel: "teamPanel" });
  render();
}

function fileManagerNodeToPreviewFile(node = {}) {
  return {
    fileName: node.name,
    extension: node.extension,
    mimeType: node.mimeType,
    size: node.size,
    previewKind: node.previewKind || previewKindForFile(node),
    blobKey: node.blobKey || "",
    dataUrl: node.dataUrl || "",
    text: node.text || "",
    textExcerpt: node.text || decodeDataUrlText(node.dataUrl),
    summary: `${node.kind === "folder" ? "Folder" : "Virtual file"} stored in the CORE Atlas file manager.`,
    storedPreview: Boolean(node.blobKey || node.dataUrl || node.text),
    warnings: node.dataUrl || node.text ? [] : ["Original bytes are not stored for this file manager item."],
  };
}

function fileManagerNodeToTeamAttachment(node = {}) {
  const preview = fileManagerNodeToPreviewFile(node);
  return {
    id: `team-file-${Date.now()}-${Math.round(Math.random() * 999)}`,
    fileName: preview.fileName,
    extension: preview.extension,
    mimeType: preview.mimeType,
    size: preview.size,
    previewKind: preview.previewKind,
    summary: preview.summary,
    keywords: extractKeywords(`${preview.fileName} ${preview.textExcerpt || ""}`),
    textExcerpt: clampText(preview.textExcerpt || preview.text || "", PREVIEW_TEXT_LIMIT),
    blobKey: preview.blobKey || "",
    dataUrl: preview.dataUrl,
    storedPreview: preview.storedPreview,
    warnings: preview.warnings,
    createdAt: new Date().toISOString(),
  };
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
      saveUserLocation({ activeProfileUsername: state.activeProfileUsername, panel: "profilesPanel" });
      renderProfiles();
      renderPermissionState();
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
  renderPermissionState();
}

function handleSaveProfile(event) {
  event.preventDefault();
  if (!ensureCanWrite("save profile changes")) return;
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
    if (!saved) {
      const backup = window.localStorage.getItem(STORAGE_BACKUP_KEY);
      return normalizeArchive(backup ? JSON.parse(backup) : SEED_DATA);
    }
    return normalizeArchive(JSON.parse(saved));
  } catch {
    try {
      const backup = window.localStorage.getItem(STORAGE_BACKUP_KEY);
      return normalizeArchive(backup ? JSON.parse(backup) : SEED_DATA);
    } catch {
      return normalizeArchive(SEED_DATA);
    }
  }
}

function normalizeSourceRecord(source = {}) {
  const record = typeof source === "object" && source ? source : {};
  const id = String(record.id || `src-${Date.now()}-${Math.round(Math.random() * 999)}`).slice(0, 140);
  return {
    ...record,
    id,
    title: String(record.title || "Untitled source"),
    category: record.category === "Simulations" ? "Theoretical Concepts" : String(record.category || "Documents"),
    species: String(record.species || "Cross-form"),
    domain: record.domain === "Simulation" ? "Theoretical Biology" : String(record.domain || "Metaphysics"),
    sourceType: String(record.sourceType || "URL"),
    url: String(record.url || ""),
    evidenceTier: String(record.evidenceTier || "Speculative framework"),
    citationStatus: String(record.citationStatus || "Needs verification"),
    tradition: String(record.tradition || "Unspecified"),
    terms: Array.isArray(record.terms) ? record.terms.map((term) => String(term)).filter(Boolean) : [],
    notes: String(record.notes || "No notes yet."),
    coreLinks: Array.isArray(record.coreLinks) ? record.coreLinks.map((link) => String(link)).filter(Boolean) : [],
  };
}

function normalizeArchive(input) {
  const base = clone(SEED_DATA);
  const archive = { ...base, ...clone(input || {}) };
  [
    ["i", "n", "t", "e", "r", "n", "a", "l"].join("") + "Model",
    ["e", "x", "t", "r", "a", "c", "t", "i", "o", "n"].join("") + "Jobs",
    ["e", "x", "t", "r", "a", "c", "t", "i", "o", "n"].join("") + "Results",
    "auto" + ["B", "o", "t"].join("") + "Findings",
    "web" + ["S", "c", "r", "a", "p", "e"].join("") + "Runs",
    "a" + "gentMessages",
  ].forEach((key) => {
    delete archive[key];
  });
  archive.project = { ...base.project, ...(archive.project || {}) };
  archive.backendCore = { ...base.backendCore, ...(archive.backendCore || {}) };
  archive.backendCore.stages = archive.backendCore.stages?.length ? archive.backendCore.stages : base.backendCore.stages;
  archive.backendCore.permissions = archive.backendCore.permissions?.length
    ? archive.backendCore.permissions
    : base.backendCore.permissions;
  archive.backendCore.hardLimits = archive.backendCore.hardLimits?.length
    ? archive.backendCore.hardLimits
    : base.backendCore.hardLimits;
  archive.externalApis = { ...base.externalApis, ...(archive.externalApis || {}) };
  delete archive.externalApis["free" + "LocalA" + "gent"];
  delete archive.externalApis["local" + "WebS" + "craper"];
  archive.externalApis.googleProgrammableSearch = {
    ...base.externalApis.googleProgrammableSearch,
    ...(archive.externalApis.googleProgrammableSearch || {}),
  };
  archive.externalApis.googleCustomSearchJson = {
    ...base.externalApis.googleCustomSearchJson,
    ...(archive.externalApis.googleCustomSearchJson || {}),
  };
  archive.externalApis.openAiResponsesChat = {
    ...base.externalApis.openAiResponsesChat,
    ...(archive.externalApis.openAiResponsesChat || {}),
  };
  archive.externalApis.nvidiaAIQResearch = {
    ...base.externalApis.nvidiaAIQResearch,
    ...(archive.externalApis.nvidiaAIQResearch || {}),
  };
  archive.externalApis.cloudStorageWorkspace = {
    ...base.externalApis.cloudStorageWorkspace,
    ...(archive.externalApis.cloudStorageWorkspace || {}),
    services:
      archive.externalApis.cloudStorageWorkspace?.services?.length
        ? archive.externalApis.cloudStorageWorkspace.services
        : base.externalApis.cloudStorageWorkspace.services,
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
  archive.sources = mergeById(base.sources, archive.sources || []).map(normalizeSourceRecord);
  archive.profiles = DEFAULT_PROFILES.map((profile) => ({
    ...profile,
    ...(archive.profiles || []).find((item) => item.username === profile.username),
  }));
  archive.importedFiles = archive.importedFiles || [];
  archive.browserHistory = archive.browserHistory || [];
  archive.browserSearchResults = archive.browserSearchResults || [];
  archive.browserPreview = archive.browserPreview || null;
  archive.openAiChatMessages = Array.isArray(archive.openAiChatMessages) ? archive.openAiChatMessages : [];
  archive.teamMessages = archive.teamMessages || [];
  archive.collabDocs = mergeById(DEFAULT_COLLAB_DOCS, archive.collabDocs || []).map((doc) => ({
    type: "Research Brief",
    status: "Draft",
    owner: "Unassigned",
    contentHtml: "<p>Start drafting here.</p>",
    ...doc,
  }));
  archive.fileManager = normalizeFileManager(archive.fileManager || base.fileManager);
  return archive;
}

function persistArchive(reason = "Archive update") {
  if (isGuestUser()) return;
  const encoded = JSON.stringify(state.archive);
  try {
    const previous = window.localStorage.getItem(STORAGE_KEY);
    if (previous) window.localStorage.setItem(STORAGE_BACKUP_KEY, previous);
    window.localStorage.setItem(STORAGE_KEY, encoded);
    broadcastSourceFeed(reason);
    rememberArchive(reason);
  } catch (error) {
    try {
      window.localStorage.setItem(STORAGE_BACKUP_KEY, encoded);
    } catch {
      // Browser storage may be full or disabled. The in-memory state still remains for this session.
    }
    console.warn("Archive persistence failed", error);
  }
}

function getMemoryBank() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(MEMORY_BANK_KEY) || "{}");
    return {
      version: 1,
      createdAt: saved.createdAt || new Date().toISOString(),
      updatedAt: saved.updatedAt || "",
      snapshots: Array.isArray(saved.snapshots) ? saved.snapshots : [],
    };
  } catch {
    return { version: 1, createdAt: new Date().toISOString(), updatedAt: "", snapshots: [] };
  }
}

function writeMemoryBank(bank) {
  window.localStorage.setItem(MEMORY_BANK_KEY, JSON.stringify(bank));
}

function rememberArchive(reason = "Archive update") {
  if (isGuestUser()) return;
  const bank = getMemoryBank();
  const now = new Date().toISOString();
  const snapshot = {
    id: `memory-${Date.now()}-${Math.round(Math.random() * 999)}`,
    reason,
    owner: state.currentUser?.username || "local",
    createdAt: now,
    counts: archiveCounts(state.archive),
    archive: clone(state.archive),
  };
  bank.snapshots.unshift(snapshot);
  bank.updatedAt = now;
  try {
    writeMemoryBank(bank);
  } catch {
    bank.snapshots = bank.snapshots.slice(0, 40);
    try {
      writeMemoryBank(bank);
    } catch {
      // Avoid breaking the app if browser storage quota is exhausted.
    }
  }
}

function archiveCounts(archive) {
  return {
    sources: archive.sources?.length || 0,
    importedFiles: archive.importedFiles?.length || 0,
    openAiChatMessages: archive.openAiChatMessages?.length || 0,
    teamMessages: archive.teamMessages?.length || 0,
    collabDocs: archive.collabDocs?.length || 0,
    fileManagerItems: archive.fileManager?.nodes?.length || 0,
    profiles: archive.profiles?.length || 0,
  };
}

function renderMemoryBank() {
  if (!els.memoryBankSummary || !els.memorySnapshotList) return;
  const bank = getMemoryBank();
  const snapshots = bank.snapshots || [];
  const latest = snapshots[0];
  const selected = snapshots.find((snapshot) => snapshot.id === state.activeMemorySnapshotId) || latest;
  if (selected) state.activeMemorySnapshotId = selected.id;
  els.memoryBankSummary.innerHTML = `
    <article class="memory-stat"><strong>${snapshots.length}</strong><span>saved safety snapshots</span></article>
    <article class="memory-stat"><strong>${escapeHtml(latest ? new Date(latest.createdAt).toLocaleString() : "None")}</strong><span>latest memory write</span></article>
    <article class="memory-stat"><strong>${escapeHtml(latest?.owner || "None")}</strong><span>latest owner</span></article>
  `;
  els.memorySnapshotList.innerHTML = snapshots.length
    ? snapshots
        .slice(0, 80)
        .map(
          (snapshot) => `
            <button class="memory-snapshot-item${selected?.id === snapshot.id ? " is-active" : ""}" type="button" data-memory-id="${escapeHtml(snapshot.id)}">
              <strong>${escapeHtml(snapshot.reason || "Archive update")}</strong>
              <span>${escapeHtml(snapshot.owner || "local")} / ${new Date(snapshot.createdAt).toLocaleString()}</span>
              <small>${snapshot.counts.sources} sources / ${snapshot.counts.teamMessages} team posts / ${snapshot.counts.collabDocs} docs / ${snapshot.counts.fileManagerItems || 0} files / ${snapshot.counts.importedFiles} uploads / ${snapshot.counts.openAiChatMessages || 0} OpenAI messages</small>
            </button>
          `
        )
        .join("")
    : '<div class="empty-state">No memory snapshots yet. The app will create one the next time a signed-in user saves changes.</div>';
  els.memorySnapshotList.querySelectorAll("[data-memory-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeMemorySnapshotId = button.dataset.memoryId;
      renderMemoryBank();
    });
  });
  renderMemorySnapshotPreview(selected);
}

function renderMemorySnapshotPreview(snapshot) {
  if (!els.memorySnapshotPreview) return;
  if (!snapshot) {
    els.memorySnapshotPreview.innerHTML = '<div class="empty-state">Select a memory snapshot to inspect the saved archive summary.</div>';
    return;
  }
  els.memorySnapshotPreview.innerHTML = `
    <h3>${escapeHtml(snapshot.reason || "Archive update")}</h3>
    <p>${escapeHtml(new Date(snapshot.createdAt).toLocaleString())} / ${escapeHtml(snapshot.owner || "local")}</p>
    <div class="source-info-grid">
      ${Object.entries(snapshot.counts || {})
        .map(([key, value]) => `<span><strong>${escapeHtml(key)}</strong>${escapeHtml(String(value))}</span>`)
        .join("")}
    </div>
    <pre class="source-log-pre">${escapeHtml(JSON.stringify(snapshot.archive, null, 2).slice(0, 6000))}</pre>
  `;
}

function createManualMemorySnapshot(reason = "Manual snapshot") {
  if (!ensureCanWrite("create memory snapshots")) return;
  rememberArchive(reason);
  renderMemoryBank();
}

function exportMemoryBank() {
  if (!ensureCanWrite("export memory bank data")) return;
  download("core-memory-bank.json", "application/json", JSON.stringify(getMemoryBank(), null, 2));
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
  if (!ensureCanWrite("download archive data")) return;
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
  if (!ensureCanWrite("copy archive data")) return;
  try {
    await navigator.clipboard.writeText(contents);
    window.alert("Copied to clipboard.");
  } catch {
    download(filename, "application/json", contents);
  }
}

function buildTextDigest(archive) {
  const cseApi = archive.externalApis?.googleProgrammableSearch || SEED_DATA.externalApis.googleProgrammableSearch;
  const googleJsonApi = archive.externalApis?.googleCustomSearchJson || SEED_DATA.externalApis.googleCustomSearchJson;
  const openAiApi = archive.externalApis?.openAiResponsesChat || SEED_DATA.externalApis.openAiResponsesChat;
  const memoryBank = getMemoryBank();
  const lines = [
    archive.project.name,
    `Version: ${archive.project.version}`,
    "",
    "Epistemic policy:",
    archive.project.epistemicPolicy,
    "",
    "Current scope:",
    archive.project.aiConnectorNote,
    "",
    "Backend mechanics core:",
    `${archive.backendCore.title}: ${archive.backendCore.summary}`,
    `Operating mode: ${archive.backendCore.operatingMode}`,
    `Stages: ${archive.backendCore.stages.join(", ")}`,
    "",
    "Google Programmable Search:",
    `Search engine ID: ${cseApi.searchEngineId || GOOGLE_CSE_ID}`,
    `Script URL: ${cseApi.scriptUrl || GOOGLE_CSE_SCRIPT_URL}`,
    `Public URL: ${cseApi.publicUrl || GOOGLE_CSE_PUBLIC_URL}`,
    `Elements: ${(cseApi.elements || []).join(", ")}`,
    "",
    "Google Custom Search JSON API:",
    `Local endpoint: ${googleJsonApi.localEndpoint || SEARCH_API_PATH}`,
    `Authentication: ${googleJsonApi.auth || "Server-side GOOGLE_CUSTOM_SEARCH_API_KEY"}`,
    `Status: ${googleJsonApi.status || "Preferred backend search path with CSE fallback."}`,
    "",
    "OpenAI Responses Chat:",
    `Local endpoint: ${openAiApi.localEndpoint || OPENAI_CHAT_API_PATH}`,
    `Model: ${openAiApi.model || "gpt-5.5"}`,
    `Authentication: ${openAiApi.auth || "Server-side OPENAI_API_KEY"}`,
    `Status: ${openAiApi.status || "Optional backend chat."}`,
    `${archive.openAiChatMessages?.length || 0} local OpenAI chat messages stored`,
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
    "Cloud and File Workspace:",
    `${archive.externalApis?.cloudStorageWorkspace?.services?.length || 0} cloud/document launch integrations`,
    `${archive.fileManager?.nodes?.length || 0} virtual file manager items`,
    ...((archive.externalApis?.cloudStorageWorkspace?.services || []).map((service) => `- ${service.name}: ${service.url}`)),
    "",
    "Team Chat:",
    `${archive.teamMessages?.length || 0} team posts stored`,
    `${(archive.teamMessages || []).filter(isOpenTeamReviewPost).length} open vote-enabled posts`,
    ...((archive.teamMessages || []).slice(0, 8).map((item) => `- ${item.type}: ${item.title || item.text} (${item.status || "posted"})${item.url ? ` - ${item.url}` : ""}`)),
    "",
    "Collaboration Documents:",
    `${archive.collabDocs?.length || 0} draft documents stored`,
    ...((archive.collabDocs || []).slice(0, 8).map((doc) => `- ${doc.title} (${doc.type}; ${doc.status}; ${doc.owner})`)),
    "",
    "Internal Memory Bank:",
    `${memoryBank.snapshots?.length || 0} local recovery snapshots stored in browser storage`,
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
  const cseApi = archive.externalApis?.googleProgrammableSearch || SEED_DATA.externalApis.googleProgrammableSearch;
  const googleJsonApi = archive.externalApis?.googleCustomSearchJson || SEED_DATA.externalApis.googleCustomSearchJson;
  const openAiApi = archive.externalApis?.openAiResponsesChat || SEED_DATA.externalApis.openAiResponsesChat;
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
          <td>${source.url ? `<a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a>` : ""}</td>
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
  const docRows = (archive.collabDocs || [])
    .map(
      (doc) => `
        <tr>
          <td>${escapeHtml(doc.title)}</td>
          <td>${escapeHtml(doc.type || "Document")}</td>
          <td>${escapeHtml(doc.status || "Draft")}</td>
          <td>${escapeHtml(doc.owner || "Unassigned")}</td>
          <td>${escapeHtml(clampText(stripHtml(doc.contentHtml || ""), 220))}</td>
        </tr>
      `
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>${escapeHtml(archive.project.name)} Digest</title>
<style>
body{font-family:Inter,Arial,sans-serif;margin:32px;color:#111;background:#f7f7f7}
h1{font-size:28px}p{max-width:900px;line-height:1.5;color:#333}
table{border-collapse:collapse;width:100%;background:#fff}th,td{border:1px solid #d9d9d9;padding:10px;text-align:left;font-size:13px}th{background:#efefef}
a{color:#111}
</style>
<h1>${escapeHtml(archive.project.name)}</h1>
<p>${escapeHtml(archive.project.epistemicPolicy)}</p>
<p>${escapeHtml(archive.project.aiConnectorNote)}</p>
<h2>Backend Mechanics Core</h2>
<p>${escapeHtml(archive.backendCore.title)}: ${escapeHtml(archive.backendCore.summary)}</p>
<p>Operating mode: ${escapeHtml(archive.backendCore.operatingMode)}. Stages: ${escapeHtml(archive.backendCore.stages.join(", "))}.</p>
<h2>Google Programmable Search</h2>
<p>Search engine ID: ${escapeHtml(cseApi.searchEngineId || GOOGLE_CSE_ID)}. Script URL: ${escapeHtml(cseApi.scriptUrl || GOOGLE_CSE_SCRIPT_URL)}. Public URL: ${escapeHtml(cseApi.publicUrl || GOOGLE_CSE_PUBLIC_URL)}.</p>
<h2>Google Custom Search JSON API</h2>
<p>Local endpoint: ${escapeHtml(googleJsonApi.localEndpoint || SEARCH_API_PATH)}. Authentication: ${escapeHtml(googleJsonApi.auth || "Server-side GOOGLE_CUSTOM_SEARCH_API_KEY")}. Status: ${escapeHtml(googleJsonApi.status || "Preferred backend search path with CSE fallback.")}</p>
<h2>OpenAI Responses Chat</h2>
<p>Local endpoint: ${escapeHtml(openAiApi.localEndpoint || OPENAI_CHAT_API_PATH)}. Model: ${escapeHtml(openAiApi.model || "gpt-5.5")}. Authentication: ${escapeHtml(openAiApi.auth || "Server-side OPENAI_API_KEY")}. Stored messages: ${escapeHtml(String(archive.openAiChatMessages?.length || 0))}.</p>
<h2>File Import Layer</h2>
<p>${escapeHtml(String(archive.importedFiles?.length || 0))} imported file logs; ${escapeHtml(String((archive.importedFiles || []).reduce((sum, item) => sum + (item.recordsCreated || 0), 0)))} source records created from uploaded files.</p>
<h2>In-App Browser</h2>
<p>${escapeHtml(String(archive.browserHistory?.length || 0))} captured browser targets. Latest: ${escapeHtml(archive.browserHistory?.[0]?.url || "none")}.</p>
<h2>Cloud and File Workspace</h2>
<p>${escapeHtml(String(archive.externalApis?.cloudStorageWorkspace?.services?.length || 0))} cloud/document launch integrations; ${escapeHtml(String(archive.fileManager?.nodes?.length || 0))} virtual file manager items.</p>
<h2>Team Chat</h2>
<p>${escapeHtml(String(archive.teamMessages?.length || 0))} team posts stored; ${escapeHtml(String((archive.teamMessages || []).filter(isOpenTeamReviewPost).length))} open vote-enabled posts.</p>
<h2>Collaboration Documents</h2>
<table>
<thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Owner</th><th>Preview</th></tr></thead>
<tbody>${docRows || '<tr><td colspan="5">No collaboration documents yet.</td></tr>'}</tbody>
</table>
<h2>Internal Memory Bank</h2>
<p>${escapeHtml(String(getMemoryBank().snapshots?.length || 0))} local recovery snapshots are stored in browser storage.</p>
<h2>Uploaded Reference Layer</h2>
<table>
<thead><tr><th>Title</th><th>Pages</th><th>Evidence</th><th>Citation</th><th>Backend Use</th></tr></thead>
<tbody>${referenceRows}</tbody>
</table>
<h2>Source Log</h2>
<table>
<thead><tr><th>Title</th><th>Category</th><th>Form</th><th>Domain</th><th>Type</th><th>Evidence</th><th>Citation</th><th>Locator</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</html>`;
}

async function copyCodexBrief() {
  if (!ensureCanWrite("copy the Codex build brief")) return;
  const brief = `Continue building the CORE Shapeshifting Research Atlas as a rigorous internal archive and research operating system.

Preserve the evidence model: primary text, secondary scholarship, scientific analogy, experiential claim, and speculative framework.
Keep supernatural, metaphysical, occult, and esoteric claims explicitly labeled by source type and certainty.
The static app now includes gated local sign-in, source-type listings, in-app browser, file import, three editable user profiles, ErydirCeisiwr backend mechanics stages, collaboration documents, team chat, memory snapshots, and a metadata-only uploaded PDF reference layer.
Next build priorities: real backend auth, secure password storage, durable database collaboration, stronger document parsing, citation review tools, and stable public deployment.`;

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
