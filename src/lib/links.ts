// Sites that are mine. Links to these pass link equity; everything else is nofollow.
// Subdomains count too (guess.forestcity.uk matches forestcity.uk).
const OWN_DOMAINS = ["simmsreeve.com", "forestcity.uk"];

function isOwn(url: string): boolean {
  const host = new URL(url).hostname.toLowerCase();
  return OWN_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

/** rel for an external link opened in a new tab. */
export function externalRel(url: string): string {
  return isOwn(url) ? "noopener noreferrer" : "nofollow noopener noreferrer";
}
