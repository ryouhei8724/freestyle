// Minimal stand-in for the dashboard runtime the page was first written for:
// loads the CSV files in data/, runs registered calculations, and calls the
// page's draw function on load and on resize.
(function () {
  const SOURCES = { models: 'data/models.csv', forecast: 'data/forecast.csv' };
  const state = {};
  const calcs = {};
  const listeners = [];

  Object.keys(SOURCES).forEach((id) => { state[id] = { status: 'loading', data: [] }; });

  function computeCalcs() {
    Object.keys(calcs).forEach((id) => {
      const inputs = calcs[id].inputs.map((i) => state[i]);
      if (inputs.some((s) => !s || s.status === 'loading')) {
        state[id] = { status: 'loading', data: [] };
      } else if (inputs.some((s) => s.status !== 'ok')) {
        state[id] = { status: 'error', data: [], message: '入力データを読み込めませんでした' };
      } else {
        try {
          state[id] = { status: 'ok', data: calcs[id].fn.apply(null, inputs.map((s) => s.data)) };
        } catch (e) {
          state[id] = { status: 'error', data: [], message: String(e) };
        }
      }
    });
  }

  function emit() {
    listeners.forEach((fn) => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  window.dash = {
    data(id) {
      const s = state[id] || { status: 'missing', data: [] };
      return Object.assign({ refreshing: false, meta: [] }, s);
    },
    calc(id, spec) {
      calcs[id] = spec;
      computeCalcs();
    },
    onData(fn) {
      listeners.push(fn);
      fn();
    },
    colors: [],
    refresh() {},
    params() { return {}; },
    setParams() {},
    resetParams() {},
    setLink() {}
  };

  Object.keys(SOURCES).forEach((id) => {
    fetch(SOURCES[id], { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then((text) => { state[id] = { status: 'ok', data: d3.csvParse(text) }; })
      .catch((e) => { state[id] = { status: 'error', data: [], message: String(e) }; })
      .finally(() => {
        computeCalcs();
        emit();
      });
  });

  let width = document.documentElement.clientWidth;
  let frame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const w = document.documentElement.clientWidth;
      if (w !== width) {
        width = w;
        emit();
      }
    });
  });
})();
