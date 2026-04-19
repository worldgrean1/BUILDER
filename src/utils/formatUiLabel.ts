const SEPARATOR_PATTERN = /[_-]+/g;

const preserveToken = (token: string) => token.length <= 3 || /\d/.test(token);

const formatToken = (token: string) => {
  if (!/[A-Za-z]/.test(token) || preserveToken(token)) {
    return token.toUpperCase();
  }

  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
};

export const formatUiLabel = (value: string) =>
  value
    .replace(SEPARATOR_PATTERN, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(formatToken)
    .join(' ');
