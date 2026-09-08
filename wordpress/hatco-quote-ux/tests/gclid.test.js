const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(
  new URL("../assets/gclid.js", `file://${__filename}`),
  "utf8"
);

function runCapture({ cookie = "", search = "", stored = null } = {}) {
  const field = { dataset: {}, value: "" };
  const storage = new Map();
  if (stored) {
    storage.set("hatco_gclid", JSON.stringify(stored));
  }

  const document = {
    body: {},
    readyState: "complete",
    addEventListener() {},
    querySelector(selector) {
      return selector.includes("input_94") ? field : null;
    }
  };

  let writtenCookie = "";
  Object.defineProperty(document, "cookie", {
    get: () => cookie,
    set: (value) => {
      writtenCookie = value;
      cookie = value;
    }
  });

  const window = {
    location: { hostname: "hat.co", search },
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      removeItem: (key) => storage.delete(key),
      setItem: (key, value) => storage.set(key, value)
    }
  };

  class MutationObserver {
    observe() {}
  }

  vm.runInNewContext(source, {
    console,
    document,
    MutationObserver,
    Node: { ELEMENT_NODE: 1 },
    URLSearchParams,
    window
  });

  return { field, storage, window, writtenCookie };
}

const captured = runCapture({
  search: "?gclid=EAIaIQobChMI_test-123"
});
assert.equal(captured.field.value, "EAIaIQobChMI_test-123");
assert.equal(captured.field.dataset.hatcoGclidCaptured, "true");
assert.match(captured.writtenCookie, /^hatco_gclid=EAIaIQobChMI_test-123;/);
assert.match(captured.writtenCookie, /Domain=\.hat\.co/);
assert.equal(
  JSON.parse(captured.storage.get("hatco_gclid")).value,
  "EAIaIQobChMI_test-123"
);

const fromCookie = runCapture({
  cookie: "other=1; hatco_gclid=COOKIE-CLICK-ID"
});
assert.equal(fromCookie.field.value, "COOKIE-CLICK-ID");

const fromStorage = runCapture({
  stored: {
    value: "STORED-CLICK-ID",
    expires: Date.now() + 60_000
  }
});
assert.equal(fromStorage.field.value, "STORED-CLICK-ID");

const absent = runCapture();
assert.equal(absent.field.value, "");
assert.equal(absent.window.HatCoGclid.sanitize("<script>"), "");
assert.equal(absent.window.HatCoGclid.sanitize("contains spaces"), "");
assert.equal(absent.window.HatCoGclid.sanitize("a".repeat(256)), "");

console.log("Hat.co GCLID capture tests passed.");
