const fs = require('fs');
const path = 'src/components/shell/ChatBot.tsx';

let text = fs.readFileSync(path, 'utf8');

// Replace the header section with quotaBadgeText with the new static pill version
const oldPattern = /<div>\s*<p className="text-sm font-semibold text-\[var\(--foreground\)\]">\s*Aaroophan['']s Assistant\s*<\/p>\s*<p className="text-\[10px\] text-emerald-500">\s*\{isStreaming \? "Typing\.\.\." : "Online"\}\s*\{quotaBadgeText && \(\s*<p className=\{`text-\[9px\] \$\{quotaBadgeColor\} leading-tight`\}>\s*\{quotaBadgeText\}\s*<\/p>\s*\)\}\s*<\/p>\s*<\/div>/;

const newHtml = `<div className="flex flex-col justify-center">
								<p className="text-sm font-semibold text-[var(--foreground)] leading-tight">
									Aaroophan's Assistant
								</p>
								<div className="flex items-center gap-2 mt-1">
									<p className="text-[10px] text-emerald-500">
										{isStreaming ? "Typing..." : "Online"}
									</p>
									<span className="text-[10px] px-1.5 py-[1px] rounded bg-[var(--mono-4)]/5 text-[var(--mono-4)]/60 border border-[var(--mono-4)]/20 whitespace-nowrap">
										20 questions every 1 hr · Max 150 chars
									</span>
								</div>
							</div>`;

text = text.replace(oldPattern, newHtml);

fs.writeFileSync(path, text, 'utf8');
console.log('Header updated successfully');
