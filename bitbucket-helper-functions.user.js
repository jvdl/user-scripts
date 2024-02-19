// ==UserScript==
// @name     Bitbucket Cloud Helper Functions
// @version  1
// @grant    none
// @match  	 https://bitbucket.org/*/*
// @author   John van der Loo <john@jvdl.dev>
// ==/UserScript==

(function() {

  function isPullRequestPage() {
    return window.location.pathname.match(/.*\/pull-requests/);
  }

  function isFilesTabActive() {
    const filesTab = document.querySelector('#bb-sidebar [data-testid="sidebar-tab-files"]');
    return filesTab.matches('[aria-selected="true"]');
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

}());
