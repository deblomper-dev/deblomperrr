import type { ReactNode } from "react";
import type { Project } from "@/lib/data/types";

const containers = [
  { label: "web", y: 55 },
  { label: "api", y: 123 },
  { label: "worker", y: 191 },
] as const;

const protocols = [
  { label: "SMTP", y: 51 },
  { label: "IMAP", y: 129 },
  { label: "POP3", y: 207 },
] as const;

const audioBars = [18, 30, 46, 31, 60, 88, 50, 34, 66, 43, 24, 36, 14];

const deploymentDiagram = (
  <>
    <path className="card-svg-route" d="M116 151H162" />
    {containers.map(({ label, y }) => (
      <path key={label} className="card-svg-route" d={`M354 151C377.9 151 383.1 ${y + 28} 407 ${y + 28}`} />
    ))}
    <rect className="card-svg-paper card-svg-outline" x="18" y="107" width="98" height="88" rx="14" />
    <g className="card-svg-icon">
      <path d="M59 126v22m16-22v8c0 9-16 6-16 15" />
      <circle cx="59" cy="125" r="4" />
      <circle cx="75" cy="125" r="4" />
      <circle cx="59" cy="153" r="4" />
    </g>
    <text className="card-svg-label" x="67" y="180" textAnchor="middle">GitHub</text>
    <rect className="card-svg-shade" x="169" y="48" width="192" height="212" rx="16" />
    <rect className="card-svg-paper card-svg-outline" x="162" y="40" width="192" height="212" rx="16" />
    <text className="card-svg-brand" x="181" y="71">halvo</text>
    <path className="card-svg-icon" d="m318 56 8 8-8 8m-11-16-8 8 8 8" />
    <path className="card-svg-rule" d="M162 88h192" />
    <rect className="card-svg-soft" x="181" y="109" width="153" height="41" rx="7" />
    <text className="card-svg-code" x="194" y="135">$ deploy</text>
    <rect className="card-svg-paper card-svg-outline" x="181" y="170" width="65" height="59" rx="8" />
    <rect className="card-svg-paper card-svg-outline" x="269" y="170" width="65" height="59" rx="8" />
    <path className="card-svg-route" d="M246 199h23m-7-5 7 5-7 5" />
    <text className="card-svg-small" x="213" y="204" textAnchor="middle">build</text>
    <text className="card-svg-small" x="301" y="204" textAnchor="middle">ship</text>
    <path d="M200 218h26m62 0h26" stroke="var(--card-accent)" strokeWidth="2.5" strokeLinecap="round" />
    {containers.map(({ label, y }) => (
      <g key={label}>
        <rect className="card-svg-paper card-svg-outline" x="407" y={y} width="95" height="56" rx="10" />
        <path className="card-svg-icon" d={`m421 ${y + 23} 8-5 8 5v10l-8 5-8-5Zm0 0 8 5 8-5m-8 5v10`} />
        <text className="card-svg-small" x="444" y={y + 32}>{label}</text>
        <circle className="card-svg-solid" cx="489" cy={y + 12} r="2.5" />
      </g>
    ))}
  </>
);

const mailDiagram = (
  <>
    <path className="card-svg-route" d="M143 158H190M261 57C279 57 243 82 261 82" />
    {protocols.map(({ label, y }) => (
      <path key={label} className="card-svg-route" d={`M332 158C359.9 158 366.1 ${y + 29} 394 ${y + 29}`} />
    ))}
    <rect className="card-svg-paper card-svg-outline" x="18" y="112" width="125" height="92" rx="14" />
    <g className="card-svg-icon">
      <circle cx="80" cy="143" r="14" />
      <path d="M66 143h28m-14-14c-10 9-10 19 0 28m0-28c10 9 10 19 0 28" />
    </g>
    <text className="card-svg-label" x="80" y="184" textAnchor="middle">Your domain</text>
    <rect className="card-svg-paper card-svg-outline" x="210" y="20" width="102" height="37" rx="8" />
    <text className="card-svg-small" x="261" y="44" textAnchor="middle">Send API</text>
    <rect className="card-svg-shade" x="197" y="89" width="142" height="160" rx="17" />
    <rect className="card-svg-solid" x="190" y="82" width="142" height="160" rx="17" />
    <g className="card-svg-inverse-icon">
      <rect x="214" y="110" width="94" height="63" rx="7" />
      <path d="m218 116 43 31 43-31m-86 50 27-24m59 24-27-24" />
    </g>
    <rect className="card-svg-paper" x="247" y="158" width="28" height="20" rx="2" />
    <path className="card-svg-icon" d="M252 164h18m-18 5h12" />
    <text className="card-svg-inverse-brand" x="261" y="213" textAnchor="middle">NubMail</text>
    {protocols.map(({ label, y }) => (
      <g key={label}>
        <rect className="card-svg-paper card-svg-outline" x="394" y={y} width="108" height="58" rx="10" />
        <path className="card-svg-icon" d={`M410 ${y + 19}h18v17h-18Zm0 2 9 7 9-7`} />
        <text className="card-svg-small" x="440" y={y + 34}>{label}</text>
      </g>
    ))}
  </>
);

const musicDiagram = (
  <>
    <path className="card-svg-route" d="M249 151H320" />
    <rect className="card-svg-shade" x="32" y="61" width="224" height="198" rx="16" />
    <rect className="card-svg-paper card-svg-outline" x="25" y="53" width="224" height="198" rx="16" />
    <text className="card-svg-brand" x="47" y="88">Queue</text>
    <path className="card-svg-icon" d="M207 73h19m-19 6h19m-19 6h12" />
    <path className="card-svg-rule" d="M25 104h224" />
    <rect className="card-svg-soft" x="43" y="119" width="188" height="45" rx="7" />
    <path className="card-svg-icon" d="M62 146v-16l11-3v16m-11-13 11-3" />
    <ellipse className="card-svg-solid" cx="59" cy="146" rx="4" ry="3" />
    <ellipse className="card-svg-solid" cx="70" cy="143" rx="4" ry="3" />
    <text className="card-svg-label" x="87" y="147">Audio source</text>
    <circle className="card-svg-outline card-svg-paper" cx="63" cy="187" r="7" />
    <circle className="card-svg-outline card-svg-paper" cx="63" cy="222" r="7" />
    <path className="card-svg-placeholder" d="M87 182h96m-96 10h65m-65 25h113m-113 10h78" />
    <circle className="card-svg-shade" cx="393" cy="151" r="91" />
    <circle cx="393" cy="151" r="82" stroke="var(--card-route)" strokeDasharray="26 10 4 10" />
    <circle className="card-svg-paper card-svg-outline" cx="393" cy="151" r="73" />
    <path className="card-svg-rule" d="M320 151h146" />
    {audioBars.map((height, index) => (
      <rect className="card-svg-solid" key={index} x={331 + index * 10} y={151 - height / 2} width="5" height={height} rx="2.5" />
    ))}
    <text className="card-svg-small card-svg-spaced" x="393" y="39" textAnchor="middle">TELEGRAM</text>
    <text className="card-svg-label" x="393" y="273" textAnchor="middle">Group voice chat</text>
  </>
);

const apiDiagram = (
  <>
    <path className="card-svg-route" d="M257 150H360" />
    <text className="card-svg-small" x="309" y="129" textAnchor="middle">extract</text>
    <rect className="card-svg-shade" x="27" y="56" width="237" height="203" rx="16" />
    <rect className="card-svg-paper card-svg-outline" x="20" y="48" width="237" height="203" rx="16" />
    <text className="card-svg-brand" x="42" y="83">API request</text>
    <path className="card-svg-icon" d="m217 67 8 8-8 8m-12-16-8 8 8 8" />
    <path className="card-svg-rule" d="M20 102h237" />
    <text className="card-svg-code" x="40" y="135">{"{"}</text>
    <rect className="card-svg-soft" x="54" y="145" width="169" height="31" rx="6" />
    <circle className="card-svg-icon" cx="70" cy="160" r="4" />
    <path className="card-svg-icon" d="M74 160h10m-4 0v4m4-4v3" />
    <text className="card-svg-code" x="97" y="166">token</text>
    <text className="card-svg-code" x="59" y="203">media URL</text>
    <text className="card-svg-code" x="40" y="231">{"}"}</text>
    <rect className="card-svg-shade" x="367" y="85" width="133" height="144" rx="15" />
    <rect className="card-svg-paper card-svg-outline" x="360" y="77" width="133" height="144" rx="15" />
    <path className="card-svg-soft card-svg-outline" d="M407 101h29l14 14v55h-43z" />
    <path className="card-svg-icon" d="M436 101v15h14m-35 24h6l8-7v26l-8-7h-6zm20 1c4 4 4 10 0 14" />
    <text className="card-svg-label" x="426" y="201" textAnchor="middle">Media output</text>
  </>
);

const concepts: Record<string, { caption: string; diagram: ReactNode }> = {
  halvo: { caption: "Repository → containers", diagram: deploymentDiagram },
  nubmail: { caption: "Your domain, your email", diagram: mailDiagram },
  "nub-music-bot": { caption: "Queue → group voice chat", diagram: musicDiagram },
  "ytube-api": { caption: "Request → media", diagram: apiDiagram },
};

function ToolDiagram({ language }: { language: string }) {
  return (
    <>
      <rect className="card-svg-shade" x="116" y="62" width="296" height="194" rx="16" />
      <rect className="card-svg-paper card-svg-outline" x="108" y="54" width="296" height="194" rx="16" />
      <path className="card-svg-rule" d="M108 98h296" />
      <circle className="card-svg-solid" cx="130" cy="76" r="3" />
      <circle className="card-svg-soft" cx="142" cy="76" r="3" />
      <circle className="card-svg-soft" cx="154" cy="76" r="3" />
      <path className="card-svg-icon" d="m192 134-25 23 25 23m128-46 25 23-25 23m-51-55-24 65" />
      <text className="card-svg-code" x="256" y="224" textAnchor="middle">{language}</text>
    </>
  );
}

export function ProjectCardPreview({ project }: { project: Project }) {
  const concept = concepts[project.slug];

  return (
    <div className={`project-card-preview project-card-preview--${project.slug}`}>
      <div className="project-card-preview-caption">
        <span>{concept?.caption ?? project.kind}</span>
        <span>Concept</span>
      </div>
      <svg className="project-card-diagram" viewBox="0 0 520 300" fill="none" aria-hidden="true" focusable="false">
        {concept?.diagram ?? <ToolDiagram language={project.lang} />}
      </svg>
    </div>
  );
}
