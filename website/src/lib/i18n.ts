export type Locale = "ja" | "en";

export const repoUrl = "https://github.com/jammaru/launch-video-craft";

export const copy = {
  ja: {
    htmlLang: "ja",
    title: "Launch Video Craft — 本物の画面から、ローンチ動画を作る",
    description:
      "Cursor、Claude Code、Codex、GitHub Copilot 向けの Agent Skill。プロダクトの実画面を使い、Remotion で短いローンチ映像を作ります。",
    skip: "コンテンツへ",
    wordmark: "Launch Video Craft",
    kicker: "Agent Skill",
    heroTitle: "本物の画面から、ローンチ動画を作る",
    heroLead:
      "Cursor、Claude Code、Codex、GitHub Copilot に、プロダクトの実画面を使った Remotion の短い映像を作らせます。",
    installLabel: "導入",
    installNote: "Node.js があれば、クローンせずに入ります。",
    github: "GitHub",
    whatTitle: "できること",
    whatLead: "雑な見本で終わらせず、実画面の確認まで進めます。",
    features: [
      {
        title: "本物の UI",
        body: "映すのはプロダクトのページ、部品、またはコマンドの出力です。",
      },
      {
        title: "テンポとカメラ",
        body: "参考クリップから間の取り方とズームを借り、描く中身はプロダクトのものです。",
      },
      {
        title: "クリックの確認",
        body: "押した位置、寄ったあとの文字、枠に収まるかを実画面と照合します。",
      },
      {
        title: "出す順番",
        body: "verify、review、render。確認より先に書き出しません。",
      },
      {
        title: "直し方",
        body: "テンポ、ズームの位置、文言、画面の順を、見たまま指して直せます。",
      },
    ],
    filmsTitle: "作った映像",
    filmsLead: "1920×1080、30fps。尺はプロダクトに合わせます。",
    films: [
      {
        title: "EmDash Preflight",
        body: "公開を止める検査を、エディタの実画面で見せます。",
        src: "/films/emdash.mp4",
        poster: "/films/emdash.jpg",
        href: "https://x.com/jammaru_lab/status/2105501576437678510",
        hrefLabel: "X で見る",
      },
      {
        title: "エージェントが組む",
        body: "Skill を読み、参考クリップを測り、映像を組みます。",
        src: "/films/agent.mp4",
        poster: "/films/agent.jpg",
      },
    ],
    askTitle: "頼み方",
    askLead: "最初の依頼は短くて足ります。参考動画とロゴを添えてください。",
    askLabel: "依頼",
    askCommand: `このプロダクトのローンチ動画を Remotion で作って。参考はこの動画、ロゴはこのファイル。
実際の UI を使って。launch-video-craft に従って。`,
    moreTitle: "ほかの入れ方",
    moreLead: "すべてのプロジェクトで使うとき、GitHub CLI、Claude Code からも入れられます。",
    moreTabs: [
      {
        id: "global",
        label: "グローバル",
        command: "npx skills add jammaru/launch-video-craft -g",
      },
      {
        id: "gh",
        label: "GitHub CLI",
        command:
          "gh skill install jammaru/launch-video-craft launch-video-craft --scope user",
      },
      {
        id: "claude",
        label: "Claude Code",
        command: `/plugin marketplace add jammaru/launch-video-craft
/plugin install launch-video-craft@launch-video-craft`,
      },
      {
        id: "update",
        label: "更新",
        command: "npx skills update launch-video-craft",
      },
    ],
    starLine: "気に入ったら、Star してください！",
    starAction: "Star",
    copyright: "© 2026 jammaru",
    notFoundTitle: "ページがありません",
    notFoundBody: "アドレスを確認するか、最初のページに戻ってください。",
    notFoundHome: "最初のページへ",
  },
  en: {
    htmlLang: "en",
    title: "Launch Video Craft — a launch film from the real screen",
    description:
      "An Agent Skill for Cursor, Claude Code, Codex, and GitHub Copilot. It turns a product’s real UI into a short Remotion launch film.",
    skip: "Skip to content",
    wordmark: "Launch Video Craft",
    kicker: "Agent Skill",
    heroTitle: "A launch film from the real screen",
    heroLead:
      "An Agent Skill for Cursor, Claude Code, Codex, and GitHub Copilot. It builds a short Remotion film from the product’s real UI.",
    installLabel: "Install",
    installNote: "Node.js is enough. No clone.",
    github: "GitHub",
    whatTitle: "What it does",
    whatLead: "It keeps going until the film matches the real screen.",
    features: [
      {
        title: "The real UI",
        body: "The picture is the product’s page, its components, or the command it prints.",
      },
      {
        title: "Tempo and camera",
        body: "Timing and zooms come from a reference clip. The content is this product’s.",
      },
      {
        title: "Clicks, checked",
        body: "Press position, type after the zoom, and the frame are checked against the real screen.",
      },
      {
        title: "The order",
        body: "verify, review, render. It does not export before the checks.",
      },
      {
        title: "How you correct it",
        body: "Point at tempo, where the zoom lands, a line, or the order of screens.",
      },
    ],
    filmsTitle: "Films",
    filmsLead: "1920×1080, 30fps. Length follows the product.",
    films: [
      {
        title: "EmDash Preflight",
        body: "A publish check, shown on the editor’s real screen.",
        src: "/films/emdash.mp4",
        poster: "/films/emdash.jpg",
        href: "https://x.com/jammaru_lab/status/2105501576437678510",
        hrefLabel: "Watch on X",
      },
      {
        title: "An agent cuts it",
        body: "The agent reads the skill, measures a reference clip, and builds the film.",
        src: "/films/agent.mp4",
        poster: "/films/agent.jpg",
      },
    ],
    askTitle: "How to ask",
    askLead: "A short first ask is enough. Attach a reference clip and a logo.",
    askLabel: "Prompt",
    askCommand: `Make a launch film for this product in Remotion. Reference clip attached, logo attached.
Use the real UI. Follow launch-video-craft.`,
    moreTitle: "Other ways in",
    moreLead: "Install it for every project, or from the GitHub CLI and Claude Code.",
    moreTabs: [
      {
        id: "global",
        label: "Global",
        command: "npx skills add jammaru/launch-video-craft -g",
      },
      {
        id: "gh",
        label: "GitHub CLI",
        command:
          "gh skill install jammaru/launch-video-craft launch-video-craft --scope user",
      },
      {
        id: "claude",
        label: "Claude Code",
        command: `/plugin marketplace add jammaru/launch-video-craft
/plugin install launch-video-craft@launch-video-craft`,
      },
      {
        id: "update",
        label: "Update",
        command: "npx skills update launch-video-craft",
      },
    ],
    starLine: "If you like it, give it a star.",
    starAction: "Star",
    copyright: "© 2026 jammaru",
    notFoundTitle: "Page not found",
    notFoundBody: "Check the address, or go back to the start.",
    notFoundHome: "Back to the start",
  },
} as const;

export const installCommand = "npx skills add jammaru/launch-video-craft";
