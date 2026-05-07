// Curated palette of warm, sage-leaning gradients. Each project is mapped to
// one of these deterministically by its id, so it always gets the same color.

const GRADIENTS: Array<[string, string]> = [
  ["#8B9468", "#E8ECD7"], // olive sage
  ["#3F5755", "#C7D6D3"], // deep teal
  ["#A38876", "#EBDDD0"], // warm tan
  ["#6B7F5C", "#D9E2CB"], // forest sage
  ["#967185", "#E5D2DC"], // muted plum
  ["#7A8B95", "#D6DEE3"], // slate dusk
  ["#B19261", "#EDDDB7"], // gold sand
  ["#5A7B7A", "#CCDCDA"], // pine
];

export function projectGradient(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function projectGradientCss(id: string): string {
  const [a, b] = projectGradient(id);
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}
