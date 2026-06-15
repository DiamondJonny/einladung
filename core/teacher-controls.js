// Stub für die Geburtstagseinladung: keine Lehrer-Sperren – alle Spiele sind erlaubt.
// (In der echten Vokabel-App liegt hier die Cloud-gestützte Lehrer-Steuerung.)
export async function isPlayAllowedCloud() { return { allowed: true }; }
export async function isGameAllowedCloud() { return true; }
