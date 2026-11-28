/** Font roles are a static manifest. No font binaries, URLs or CSS strings come from owner JSON. */
export const FONT_ROLES={
  display:{preferred:'Oswald',fallback:'"Arial Narrow", "Franklin Gothic Medium", sans-serif',
    license:'Google Fonts OFL; verify pinned distribution artifact and license before bundling'},
  body:{preferred:'Roboto',fallback:'Arial, Helvetica, sans-serif',
    license:'Google Fonts OFL; verify pinned distribution artifact and license before bundling'},
  accent:{preferred:'Ink Free',fallback:'"Segoe Print", cursive',
    license:'Embedding rights NOT verified; use fallback only'},
  signature:{preferred:'Mistral',fallback:'"Segoe Script", cursive',
    license:'Embedding rights NOT verified; use fallback only'},
  code:{preferred:'ui-monospace',fallback:'SFMono-Regular, Consolas, monospace',
    license:'System/browser-provided monospace fallback'}
} as const;
export const FONT_LOADING_GATE={oswald:'font-binary-not-bundled',roboto:'font-binary-not-bundled',
  inkFree:'license-not-verified',mistral:'license-not-verified'} as const;
