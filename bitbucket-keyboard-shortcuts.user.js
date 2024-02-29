// ==UserScript==
// @name      Bitbucket Cloud Keyboard Shortcuts
// @namespace http://jvdl.dev/
// @version   1
// @grant     none
// @match     https://bitbucket.org/*
// @author    John van der Loo <john@jvdl.dev>
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

  const rules = [
    // hide the whole comment
    `.comments-toggled-hidden .bitkit-diff-inline-content-container {
      display: none;
    }`,
    // hide the main comment content
    `.comments-toggled-collapsed .bitkit-diff-inline-content-container .ak-renderer-document {
      display: none;
    }`,
    // fade out the main comment
		`.comments-toggled-collapsed .bitkit-diff-inline-content-container div[id^="comment-"] {
			opacity: 0.5;
      row-gap: 0;
		}`,
    // a little heavy-handed, but hides the BB provided collapse button
		`.comments-toggled-collapsed .bitkit-diff-inline-content-container button {
      display: none;
		}`,
    // vertically center the name
		`.comments-toggled-collapsed .bitkit-diff-inline-content-container div[id^="comment-"] > div:nth-child(2) {
			padding-top: 6px;
		}`,
    // hide the actions row at the bottom of the comment
		`.comments-toggled-collapsed .bitkit-diff-inline-content-container div[id^="comment-"] > div:nth-child(2) > div > div:nth-child(3) {
			display: none;
		}`,
    // notification styles for the hidden comments
    `.comments-hidden-notification {
      position: fixed;
      bottom: 0px;
      padding: 10px;
      width: 100%;
      z-index: 9999;
      text-align: center;
    }`,
    `.comments-toggled-collapsed .comments-hidden-notification,
    .comments-toggled-hidden .comments-hidden-notification {
      display: block;
    }`,
    `.comments-hidden-notification span {
      display: none;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #ccc;
      background-color: white;
    `,
    `.comments-toggled-hidden .comments-hidden-notification__hidden,
    .comments-toggled-collapsed .comments-hidden-notification__collapsed {
      display: inline-block;
    }`,
    `.comments-hidden-notification kbd {
      border: 1px solid #ccc;
      background-color: #eee;
      padding: 1px 6px;
      border-radius: 3px;
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

    // ignore all of these if the metaKey (cmd/win/meta) is down
    if (e.metaKey) {
      return
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
    if (e.key === 'c') {
      console.debug('Toggling comment collapsing');
      e.preventDefault();
      document.body.classList.remove('comments-toggled-hidden')
      return document.body.classList.toggle('comments-toggled-collapsed');
    }
    if (e.key === 'C' && e.shiftKey === true) {
      console.debug('Toggling comment visibility');
      e.preventDefault();
      document.body.classList.remove('comments-toggled-collapsed')
      return document.body.classList.toggle('comments-toggled-hidden');
    }

  }

  const commentNotification = document.createElement('div');
  commentNotification.classList.add('comments-hidden-notification');
  commentNotification.innerHTML = `
  <span class="comments-hidden-notification__hidden">Comments are hidden. Press <kbd>Shift + C</kbd> to show them</span>
  <span class="comments-hidden-notification__collapsed">Comments are collapsed. Press <kbd>c</kbd> to show them</span>
  `;
  document.body.appendChild(commentNotification);

  document.addEventListener('keydown', keydownHandler);

}());
