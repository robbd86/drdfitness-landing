(function () {
  const STORAGE_KEY = 'drd_cookie_prefs';
  const defaultPrefs = { essential: true, functional: false, analytics: false, ts: null };

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function savePrefs(prefs) {
    const payload = { ...defaultPrefs, ...prefs, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  }

  function ensureBanner() {
    if (document.getElementById('cookieBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'fixed inset-x-0 bottom-0 z-[100] bg-white border-t border-gray-200 shadow-lg';
    banner.innerHTML = `
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-900">We use cookies to improve your experience.</p>
            <p class="text-xs text-gray-600 mt-1">Essential cookies keep the site working. Functional cookies enable tools like the Cut Controller. Analytics help us improve.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="cookieAcceptAll" class="px-3 py-2 rounded-md bg-[#004E89] text-white text-xs font-semibold">Accept all</button>
            <button id="cookieEssential" class="px-3 py-2 rounded-md border border-gray-300 text-xs font-semibold">Essential only</button>
            <button id="cookieSave" class="px-3 py-2 rounded-md border border-gray-300 text-xs font-semibold">Save preferences</button>
          </div>
        </div>
        <div class="mt-3 grid gap-2 sm:grid-cols-3 text-xs text-gray-700">
          <label class="flex items-center gap-2">
            <input type="checkbox" checked disabled class="accent-[#004E89]" />
            Essential (always on)
          </label>
          <label class="flex items-center gap-2">
            <input id="cookieFunctional" type="checkbox" class="accent-[#004E89]" />
            Functional
          </label>
          <label class="flex items-center gap-2">
            <input id="cookieAnalytics" type="checkbox" class="accent-[#004E89]" />
            Analytics
          </label>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    const functionalEl = banner.querySelector('#cookieFunctional');
    const analyticsEl = banner.querySelector('#cookieAnalytics');

    banner.querySelector('#cookieAcceptAll').addEventListener('click', () => {
      const prefs = savePrefs({ functional: true, analytics: true });
      updateSettingsButton();
      hideBanner();
      dispatchPrefs(prefs);
    });

    banner.querySelector('#cookieEssential').addEventListener('click', () => {
      const prefs = savePrefs({ functional: false, analytics: false });
      updateSettingsButton();
      hideBanner();
      dispatchPrefs(prefs);
    });

    banner.querySelector('#cookieSave').addEventListener('click', () => {
      const prefs = savePrefs({ functional: functionalEl.checked, analytics: analyticsEl.checked });
      updateSettingsButton();
      hideBanner();
      dispatchPrefs(prefs);
    });
  }

  function showBanner() {
    ensureBanner();
    document.getElementById('cookieBanner').classList.remove('hidden');
  }

  function hideBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.classList.add('hidden');
  }

  function updateSettingsButton() {
    let button = document.getElementById('cookieSettingsButton');
    if (!button) {
      button = document.createElement('button');
      button.id = 'cookieSettingsButton';
      button.type = 'button';
      button.className = 'fixed bottom-4 right-4 z-[90] bg-white border border-gray-200 text-xs font-semibold px-3 py-2 rounded-md shadow';
      button.textContent = 'Cookie settings';
      button.addEventListener('click', showBanner);
      document.body.appendChild(button);
    }
  }

  function dispatchPrefs(prefs) {
    window.dispatchEvent(new CustomEvent('cookiePrefsSaved', { detail: prefs }));
  }

  window.getCookiePrefs = function () {
    return loadPrefs() || defaultPrefs;
  };

  window.hasConsent = function (category) {
    const prefs = loadPrefs();
    if (!prefs) return false;
    if (category === 'essential') return true;
    return Boolean(prefs[category]);
  };

  window.openCookieBanner = function () {
    showBanner();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const prefs = loadPrefs();
    if (!prefs) {
      showBanner();
    } else {
      updateSettingsButton();
    }
  });
})();
