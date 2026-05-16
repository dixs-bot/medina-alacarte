const loadingState = {
  global: false,
};

const listeners = [];

export function setLoading(value) {
  loadingState.global = value;

  listeners.forEach((listener) => {
    listener(loadingState);
  });
}

export function subscribeLoading(listener) {
  listeners.push(listener);
}

export function getLoadingState() {
  return loadingState;
}