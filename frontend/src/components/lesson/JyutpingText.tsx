interface Props {
  cantonese: string;
  jyutping: string;
  charSize?: number;
  className?: string;
}

function isCJK(char: string): boolean {
  const code = char.codePointAt(0) || 0;
  return (
    (code >= 0x4E00 && code <= 0x9FFF) ||
    (code >= 0x3400 && code <= 0x4DBF) ||
    (code >= 0x20000 && code <= 0x2A6DF) ||
    (code >= 0xF900 && code <= 0xFAFF)
  );
}

function parseRuby(cantonese: string, jyutping: string): Array<{ char: string; ruby: string | null }> {
  const chars = [...cantonese];
  const syllables = jyutping.match(/[a-zA-Z]+[0-9]*/g) || [];
  const result: Array<{ char: string; ruby: string | null }> = [];
  let sylIdx = 0;

  for (const char of chars) {
    if (isCJK(char)) {
      result.push({ char, ruby: sylIdx < syllables.length ? syllables[sylIdx] : null });
      sylIdx++;
    } else {
      result.push({ char, ruby: null });
    }
  }
  return result;
}

export default function JyutpingText({ cantonese, jyutping, charSize = 18, className = "" }: Props) {
  if (!jyutping) {
    return (
      <span className={className} style={{ fontFamily: "var(--font-serif)", fontSize: charSize }}>
        {cantonese}
      </span>
    );
  }

  const parsed = parseRuby(cantonese, jyutping);

  return (
    <span
      className={`jyutping-text ${className}`}
      style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "flex-end", gap: "2px 6px" }}
    >
      {parsed.map((item, i) =>
        item.ruby ? (
          <span
            key={i}
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: `${charSize}px`,
            }}
          >
            <span
              className="jyutping-ruby"
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-sans)",
                color: "var(--color-blue)",
                lineHeight: 1,
                marginBottom: "3px",
                whiteSpace: "nowrap",
              }}
            >
              {item.ruby}
            </span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: charSize, lineHeight: 1.2 }}>
              {item.char}
            </span>
          </span>
        ) : (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: charSize,
              lineHeight: 1.2,
              alignSelf: "flex-end",
            }}
          >
            {item.char}
          </span>
        )
      )}
    </span>
  );
}
