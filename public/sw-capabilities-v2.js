self.addEventListener('message', event => {
  if (event.data?.type === 'HOME_SAFE_OFFLINE_CACHE_V2' && event.ports?.[0]) {
    event.ports[0].postMessage({ version: '20261013-v2' });
  }
});
