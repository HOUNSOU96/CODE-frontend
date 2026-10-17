/**
 * Détection indicative du type d'appareil pour l'interface CODE.
 * Le backend reste responsable de l'autorisation réelle.
 */
export function isMobileOrTabletDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || "";
  const isIPadOS =
    platform === "macintel" &&
    navigator.maxTouchPoints > 1;

  if (isIPadOS) {
    return true;
  }

  if (/ipad|tablet|playbook|silk/.test(ua)) {
    return true;
  }

  // Android sans "mobile" correspond généralement à une tablette.
  if (/android/.test(ua) && !/mobile/.test(ua)) {
    return true;
  }

  return /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua);
}
