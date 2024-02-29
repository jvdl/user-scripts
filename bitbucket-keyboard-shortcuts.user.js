// ==UserScript==
// @name     Bitbucket Cloud Keyboard Shortcuts
// @version  1
// @grant    none
// @match  https://bitbucket.org/*
// @author   John van der Loo <john@jvdl.dev>
// ==/UserScript==
;(function() {

  /** @type Array<HTMLElement> */
  let fileList = [];

  function activateFilesTab() {
    /** @type HTMLElement */
    const filesTab = document.querySelector('#bb-sidebar [data-testid="sidebar-tab-files"]');
    if (filesTab.matches('[aria-selected="false"]')) {
      filesTab.click();
    }
  }

  /**
   * @returns Array<HTMLElement>
   */
  function getFileList() {

    /** @type NodeListOf<HTMLElement> */
    const files = document.querySelectorAll('#bb-sidebar ul a[href^="#chg"]')
    return Array.from(files);
  }

  function getCurrentFileUrl() {
    return window.location.hash;
  }

  function gotoNextFile() {
    activateFilesTab();
    fileList = getFileList();

    if (!getCurrentFileUrl()) {
      fileList[0].click();
      window.location.hash = fileList[0].getAttribute('href');
      return;
    }
    /** @type HTMLElement */
    let nextFile;

    fileList.find((a, index) => {

      const matches = a.getAttribute('href') === getCurrentFileUrl();
      if (matches) {
          nextFile = fileList[index >= fileList.length - 1 ? 0 : index + 1]
      }
      return matches;
    });

    if (nextFile) {
      nextFile.click();
      window.location.hash = nextFile.getAttribute('href');
    }
  }

  function gotoPreviousFile() {
    activateFilesTab();
    fileList = getFileList();

    if (!getCurrentFileUrl()) {
      fileList[0].click()
      window.location.hash = fileList[0].getAttribute('href');
      return;
    }
    /** @type HTMLElement */
    let prevFile;

    fileList.find((a, index) => {

      const matches = a.getAttribute('href') === getCurrentFileUrl();
      if (matches) {
        prevFile = fileList[index <= 0 ? fileList.length - 1 : index - 1]
      }
      return matches;
    });

    if (prevFile) {
      prevFile.click();
      window.location.hash = prevFile.getAttribute('href');
    }
  }

  const rules = [`
    .comments-toggled-hidden .bitkit-diff-inline-content-container .ak-renderer-document {
      display: none;
    }`,
    `.comments-toggled-hidden .bitkit-diff-inline-content-container div[id^="comment-"] {
      opacity: 0.5;
    }`,

  ];

  /**
   * Add some CSS rules to the document
   * @param {Array<string>} rules - an array of rules
   */
  function addStylesheetRules(rules) {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    rules.forEach(rule => styleEl.sheet.insertRule(rule, styleEl.sheet.cssRules.length));
  }
  addStylesheetRules(rules);

  function keydownHandler(e) {
    // don't execute the handler if the target is in a place where normal keyboard input is required
    if (e.target.matches('input, textarea, button, [contenteditable="true"]')) {
      return;
    }
    if (e.key === 'j') {
      console.debug('Going to next file');
      e.preventDefault();
      gotoNextFile();
      return;
    }
    if (e.key === 'k') {
      console.debug('Going to previous file');
      e.preventDefault();
      return gotoPreviousFile();
    }
    if (e.key === 'C' && e.shiftKey === true) {
      console.log(e);
      console.debug('Toggling comment visibility');
      e.preventDefault();
      return document.body.classList.toggle('comments-toggled-hidden');
    }

  }

  document.addEventListener('keydown', keydownHandler);

}());
