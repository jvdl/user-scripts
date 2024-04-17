// ==UserScript==
// @name        Bitbucket Cloud Helper Functions
// @description Sets file hashes in the URL when they are clicked. Automatically checks the "Delete source branch" checkbox on the create PR page.
// @namespace   http://jvdl.dev/
// @version     1
// @grant       none
// @match  	    https://bitbucket.org/*/*
// @author      John van der Loo <john@jvdl.dev>
// @license     MIT
// ==/UserScript==
;(function() {

  function isPullRequestPage() {
    return window.location.pathname.match(/.*\/pull-requests/);
  }

  function isFilesTabActive() {
    const filesTab = document.querySelector('#bb-sidebar [data-testid="sidebar-tab-files"]');
    return filesTab?.matches('[aria-selected="true"]');
  }

  function isCreatePullRequestPage() {
    return window.location.pathname.match(/.*\/pull-requests\/new/)
  }

  /**
   * When a file is clicked on the PR page, update the window hash to point to that file.
   */
  function handleFileClicks(e) {
    if (!isPullRequestPage() || !isFilesTabActive()) {
      return;
    }

    if (e.target.matches('#bb-sidebar a[href], #bb-sidebar a[href] span')) {
      const el = e.target.closest('a');

      window.location.hash = el.getAttribute('href');
    }
  }
  document.addEventListener('click', handleFileClicks);

  async function waitFor(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        clearInterval(intervalTimer);
        reject(`'${el}' was not found in ${timeout}ms`)
      }, timeout);
      const intervalTimer = setInterval(() => {
        const el = document.querySelector(selector)
        if (el) {
          clearInterval(intervalTimer);
          clearTimeout(timeoutTimer);
          resolve(el);
        }
      })
    })
  }

  function setCheckedByLabel(label) {
    if (!label) {
      return;
    }
    console.log('[Bitbucket PR helper] Setting source branch to auto-delete')
    if (label?.querySelector('input').checked === false) {
      label.click();
    }
  }

  async function setupCreatePrHelper(e) {
    const el = await waitFor("section > form");
    if (!el) {
      console.log('[Bitbucket PR helper] Could not find the create pull request form')
    }
    let currentLabelId = "";
    let currentTargetBranch = ""
    const observer = new MutationObserver(() => {
      // ignore anything that's not on the create PR page
      if (!isCreatePullRequestPage()) {
        return;
      }
      const label = document.querySelector('[data-testid="delete-branch--checkbox-label"]')
      if (currentLabelId === label?.id) {
        // we've observed this label already but let's check if the target branch is the same
        const targetBranch = document.querySelector('[data-testid="create-pull-request-destination-branch-selector"] div[data-value]').textContent
        if (currentTargetBranch !== targetBranch) {
          // Ok we need to update the label's checked state
          setCheckedByLabel(label);
          currentTargetBranch = targetBranch;
        }
        // no changes to worry about, byeeee
        return;
      }
      setCheckedByLabel(label);
      currentLabelId = label?.id;

    });

    // we're pretty broad here in observing the body but we short-circuit if we're not on the create PR page
    observer.observe(document.querySelector("body"), {
      subtree: true,
      childList: true,
    });
  }

  window.addEventListener('popstate', (e) => {
    console.log(e.state);
  });

  setupCreatePrHelper();


}());
