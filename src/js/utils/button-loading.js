export function setButtonLoading(button, loading) {
  if (!button) return;

  button.disabled = loading;

  button.dataset.originalText ??= button.innerHTML;

  button.innerHTML = loading
    ? 'Loading...'
    : button.dataset.originalText;
}
