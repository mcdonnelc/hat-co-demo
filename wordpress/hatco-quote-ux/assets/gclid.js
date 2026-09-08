(function initializeHatCoGclidCapture() {
  "use strict";

  if (window.HatCoGclid?.initialized) {
    window.HatCoGclid.populate();
    return;
  }

  const COOKIE_NAME = "hatco_gclid";
  const FIELD_SELECTOR = "#input_2_94, input[name='input_94']";
  const MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
  const MAX_LENGTH = 255;

  function sanitize(value) {
    const candidate = String(value || "").trim();
    return candidate.length > 0 &&
      candidate.length <= MAX_LENGTH &&
      /^[A-Za-z0-9._~-]+$/.test(candidate)
      ? candidate
      : "";
  }

  function readCookie() {
    const prefix = `${COOKIE_NAME}=`;
    const cookie = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));

    if (!cookie) {
      return "";
    }

    try {
      return sanitize(decodeURIComponent(cookie.slice(prefix.length)));
    } catch {
      return "";
    }
  }

  function readStorage() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(COOKIE_NAME));
      if (!stored || Date.now() >= stored.expires) {
        window.localStorage.removeItem(COOKIE_NAME);
        return "";
      }
      return sanitize(stored.value);
    } catch {
      return "";
    }
  }

  function store(value) {
    const domain = /(^|\.)hat\.co$/i.test(window.location.hostname)
      ? "; Domain=.hat.co"
      : "";
    document.cookie =
      `${COOKIE_NAME}=${encodeURIComponent(value)}` +
      `; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax; Secure${domain}`;

    try {
      window.localStorage.setItem(
        COOKIE_NAME,
        JSON.stringify({
          value,
          expires: Date.now() + MAX_AGE_SECONDS * 1000
        })
      );
    } catch {
      // The first-party cookie remains the fallback when storage is blocked.
    }
  }

  const queryValue = sanitize(
    new URLSearchParams(window.location.search).get("gclid")
  );
  if (queryValue) {
    store(queryValue);
  }

  function currentValue() {
    return queryValue || readCookie() || readStorage();
  }

  function populate(root = document) {
    const value = currentValue();
    if (!value) {
      return false;
    }

    const field =
      root.matches?.(FIELD_SELECTOR)
        ? root
        : root.querySelector?.(FIELD_SELECTOR);
    if (!field) {
      return false;
    }

    field.value = value;
    field.dataset.hatcoGclidCaptured = "true";
    return true;
  }

  window.HatCoGclid = {
    initialized: true,
    populate,
    sanitize,
    value: currentValue
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => populate());
  } else {
    populate();
  }

  document.addEventListener("gform_page_loaded", () => populate());
  document.addEventListener("gform/postRender", () => populate());
  document.addEventListener("submit", () => populate(), true);

  if (window.jQuery) {
    window.jQuery(document).on(
      "gform_page_loaded gform_post_render",
      () => populate()
    );
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          populate(node);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
