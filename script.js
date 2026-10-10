(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const screen = $('#terminal-screen');
  const log = $('#terminal-log');
  const form = $('#command-form');
  const input = $('#command-input');
  const skipButton = $('#skip-animation');
  const motionButton = $('#motion-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 760px)');
  if (!screen || !log || !form || !input) return;

  const storageKey = 'fabio-terminal-typing';
  let typingWanted = !reducedMotion.matches;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'on' || saved === 'off') typingWanted = saved === 'on';
  } catch { /* The terminal also works without storage access. */ }

  let activeSession = null;
  let noticeTimer = null;
  let historyIndex = 0;
  let historyDraft = '';
  const commandHistory = [];
  const viewCommands = {
    about: 'whoami',
    stack: 'tree ./tech-stack',
    projects: 'kubectl get projects',
    contact: 'cat contact.yaml',
    personal: 'cat personal.yaml',
  };
  const completions = [
    'help', 'whoami', 'about', 'cat whoami.md', 'stack', 'tree ./tech-stack',
    'cat stack.yaml', 'projects', 'kubectl get projects -n my-projects',
    'contact', 'cat contact.yaml', 'personal', 'cat personal.yaml',
    'ls', 'pwd', 'date', 'echo', 'clear', 'coffee', 'sudo',
  ];

  function announce(message) {
    const announcer = $('#announcer');
    if (announcer) announcer.textContent = message;
  }

  function notify(message) {
    const notice = $('#notice');
    if (notice) {
      clearTimeout(noticeTimer);
      notice.textContent = message;
      notice.hidden = false;
      notice.classList.add('is-visible');
      noticeTimer = setTimeout(() => {
        notice.classList.remove('is-visible');
        notice.hidden = true;
      }, 3500);
    }
    announce(message);
  }

  const pager = $('#pager');
  const pagerNext = $('#pager-next');
  const pageSpacer = document.createElement('div');
  pageSpacer.className = 'terminal-page-space';
  pageSpacer.setAttribute('aria-hidden', 'true');
  pageSpacer.hidden = true;
  form.after(pageSpacer);
  screen.style.overflowAnchor = 'none';
  const heldPagingKeys = new Set();

  function setState(mode) {
    log.dataset.paging = mode;
    log.setAttribute('aria-busy', String(mode === 'typing'));
    form.hidden = mode !== 'idle';
    if (pager) pager.hidden = mode !== 'paused';
    if ($('#session-state')) $('#session-state').textContent = mode === 'paused' ? 'more' : mode === 'typing' ? 'typing…' : 'ready';
    if (skipButton) skipButton.hidden = mode !== 'typing';
  }

  function hasSelection() {
    return Boolean(window.getSelection()?.toString()) || (document.activeElement === input && input.selectionStart !== input.selectionEnd);
  }

  function mayRestoreFocus() {
    const focused = document.activeElement;
    return !hasSelection() && !(focused instanceof Element && focused.closest('a, [data-copy]'));
  }

  function showPrompt({ focus = true, scroll = true } = {}) {
    setState('idle');
    pageSpacer.hidden = true;
    pageSpacer.style.height = '0px';
    if (scroll && !mobile.matches) {
      const bottom = form.getBoundingClientRect().bottom - screen.getBoundingClientRect().bottom + 12;
      if (bottom > 0) screen.scrollTop += bottom;
    }
    if (focus && !mobile.matches && mayRestoreFocus()) input.focus({ preventScroll: true });
  }

  function releasePageAnchor() {
    if (activeSession) activeSession.followPage = false;
  }
  ['wheel', 'touchstart', 'pointerdown'].forEach((eventName) => {
    screen.addEventListener(eventName, releasePageAnchor, { passive: true });
  });

  function absoluteTop(element) {
    return screen.scrollTop + element.getBoundingClientRect().top - screen.getBoundingClientRect().top;
  }

  function contentBottom(session) {
    const rectangle = session.output.getBoundingClientRect();
    const echoBottom = session.echo.parentElement.getBoundingClientRect().bottom;
    return screen.scrollTop + Math.max(rectangle.bottom, echoBottom) - screen.getBoundingClientRect().top;
  }

  function controlHeight(element) {
    if (!element) return 0;
    const oldHidden = element.hidden;
    const oldStyle = element.getAttribute('style');
    const parentStyle = getComputedStyle(form.parentElement);
    const width = mobile.matches ? screen.clientWidth : Math.min(1220, screen.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight));
    element.hidden = false;
    element.style.cssText += `;position:fixed;visibility:hidden;pointer-events:none;left:-10000px;right:auto;top:0;bottom:auto;width:${Math.max(200, width)}px;`;
    const style = getComputedStyle(element);
    const height = element.getBoundingClientRect().height + (parseFloat(style.marginTop) || 0);
    element.hidden = oldHidden;
    if (oldStyle === null) element.removeAttribute('style');
    else element.setAttribute('style', oldStyle);
    return height;
  }

  function pageReserve(session) {
    const controls = Math.max(controlHeight(form), controlHeight(pager));
    const margin = mobile.matches ? 12 : (parseFloat(getComputedStyle(session.entry).marginBottom) || 0) + 12;
    return Math.min(controls + margin, Math.max(0, screen.clientHeight - 60));
  }

  function keepPagePosition(session) {
    const oldTop = screen.scrollTop;
    // The first page grows in place; its full-page limit is not a scroll destination.
    const targetTop = session.firstPage
      ? Math.min(session.pageTop, Math.max(session.viewportTop, contentBottom(session) + session.reserve - screen.clientHeight))
      : session.pageTop;
    pageSpacer.hidden = false;
    pageSpacer.style.height = `${screen.clientHeight}px`;
    const baseHeight = screen.scrollHeight - pageSpacer.offsetHeight;
    pageSpacer.style.height = `${Math.max(0, targetTop + screen.clientHeight - baseHeight)}px`;
    screen.scrollTop = session.followPage ? targetTop : oldTop;
  }

  function renderPrefix(session, count) {
    session.output.hidden = false;
    session.blocks.forEach(({ element, start, empty, wasHidden }) => {
      element.hidden = wasHidden || !(count > start || (empty && count >= start));
    });
    session.nodes.forEach(({ node, value, start }) => {
      const next = value.slice(0, Math.max(0, Math.min(value.length, count - start)));
      if (node.textContent !== next) node.textContent = next;
    });
  }

  function findPageEnd(session) {
    session.reserve = pageReserve(session);
    const fits = (count) => {
      renderPrefix(session, count);
      return contentBottom(session) <= session.pageTop + screen.clientHeight - session.reserve + 0.5;
    };
    let low = session.visible;
    let high = session.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (fits(middle)) low = middle;
      else high = middle - 1;
    }
    if (low === session.visible && low < session.length) {
      // A short viewport or a tall layout row must still allow forward progress.
      renderPrefix(session, low + 1);
      const neededTop = contentBottom(session) - (screen.clientHeight - session.reserve);
      session.pageTop = Math.max(session.pageTop, neededTop + 1);
      high = session.length;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (fits(middle)) low = middle;
        else high = middle - 1;
      }
    }
    renderPrefix(session, session.visible);
    return low;
  }

  function endSession(session, { canceled = false, marker = false, focus = true, speak = true } = {}) {
    if (activeSession !== session) return;
    cancelAnimationFrame(session.frame);
    activeSession = null;
    session.echo.textContent = session.command;
    session.output.hidden = false;
    session.output.inert = false;
    session.output.classList.remove('is-revealing');
    if (marker) {
      const interrupted = document.createElement('div');
      interrupted.className = 'command-interrupt';
      interrupted.textContent = '^C';
      session.entry.append(interrupted);
    }
    if (canceled && $('#last-exit')) $('#last-exit').textContent = '130';
    showPrompt({ focus, scroll: session.followPage && !hasSelection() });
    if (speak) announce(canceled ? 'Output stopped.' : `${session.command}: output complete.`);
  }

  function cancelSession({ marker = false, focus = false, speak = false } = {}) {
    if (!activeSession) return;
    endSession(activeSession, { canceled: true, marker, focus, speak });
  }

  function pauseSession(session) {
    if (activeSession !== session) return;
    cancelAnimationFrame(session.frame);
    session.frame = 0;
    session.paused = true;
    session.output.inert = false;
    session.output.classList.remove('is-revealing');
    setState('paused');
    if ($('#pager-progress')) $('#pager-progress').textContent = `${Math.floor(session.visible / Math.max(1, session.length) * 100)}%`;
    keepPagePosition(session);
    if (!mobile.matches && mayRestoreFocus()) pagerNext?.focus({ preventScroll: true });
    announce('More output available. Press Space or Enter to continue, or q to stop.');
  }

  function finishPage() {
    const session = activeSession;
    if (!session || session.paused) return;
    cancelAnimationFrame(session.frame);
    session.echo.textContent = session.command;
    renderPrefix(session, session.pageEnd);
    session.visible = session.pageEnd;
    keepPagePosition(session);
    if (session.visible >= session.length) endSession(session);
    else pauseSession(session);
  }

  function startPage(session, firstPage = false) {
    if (activeSession !== session) return;
    session.firstPage = firstPage;
    session.paused = false;
    session.followPage = true;
    session.output.inert = true;
    session.output.classList.add('is-revealing');
    setState('typing');
    session.echo.textContent = session.command;
    session.pageEnd = findPageEnd(session);
    keepPagePosition(session);
    const animate = typingWanted && !reducedMotion.matches;
    if (!animate) {
      finishPage();
      return;
    }
    const echoDuration = firstPage && session.animateEcho ? Math.min(600, session.command.length * 25) : 0;
    const from = session.visible;
    const amount = session.pageEnd - from;
    const duration = Math.min(2500, Math.max(160, amount / 600 * 1000));
    const started = performance.now();
    if (echoDuration) session.echo.textContent = '';
    function tick(now) {
      if (activeSession !== session || session.paused) return;
      const elapsed = now - started;
      if (elapsed < echoDuration) {
        session.echo.textContent = session.command.slice(0, Math.floor(session.command.length * elapsed / echoDuration));
      } else {
        session.echo.textContent = session.command;
        const count = from + Math.floor(amount * Math.min(1, (elapsed - echoDuration) / duration));
        renderPrefix(session, count);
        session.visible = count;
      }
      keepPagePosition(session);
      if (elapsed >= echoDuration + duration) finishPage();
      else session.frame = requestAnimationFrame(tick);
    }
    session.frame = requestAnimationFrame(tick);
  }

  function nextPage() {
    const session = activeSession;
    if (!session?.paused) return;
    const lineHeight = parseFloat(getComputedStyle(session.output).lineHeight) || 24;
    session.pageTop = Math.max(0, contentBottom(session) - Math.max(24, lineHeight * 1.5));
    startPage(session);
  }

  function appendPrompt(entry, command) {
    const prompt = document.createElement('div');
    prompt.className = 'command-prompt';
    [['prompt-user', 'guest@fabio'], ['prompt-path', '~'], ['prompt-sign', '❯'], ['command-echo', command]].forEach(([className, text]) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      prompt.append(span);
    });
    entry.append(prompt);
    return $('.command-echo', prompt);
  }

  function makeEntry(command, response) {
    const entry = document.createElement('article');
    entry.className = 'command-entry';
    const echo = appendPrompt(entry, command);
    const output = document.createElement('div');
    output.className = `command-output${response.error ? ' is-error' : ''}`;
    const template = response.template && $(`#output-${response.template}`);
    if (template instanceof HTMLTemplateElement) output.append(template.content.cloneNode(true));
    else {
      const text = document.createElement('pre');
      text.className = 'terminal-response';
      text.textContent = response.text || ' ';
      output.append(text);
    }
    entry.append(output);
    log.append(entry);
    while (log.childElementCount > 30) log.firstElementChild.remove();
    return { entry, echo, output };
  }

  function reveal(command, response, animateEcho) {
    // Append at the current viewport; only an explicit pager advance starts a new page.
    const viewportTop = screen.scrollTop;
    const { entry, echo, output } = makeEntry(command, response);
    const nodes = [];
    const walker = document.createTreeWalker(output, NodeFilter.SHOW_TEXT);
    let length = 0;
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (/\S/.test(node.textContent)) {
        const value = node.textContent;
        nodes.push({ node, value, start: length });
        length += value.length;
      }
    }
    const blockSelector = 'div, section, article, p, pre, h1, h2, h3, h4, dl, dt, dd, ol, ul, li, a, button, [data-label], .project-endpoint';
    const blocks = $$(blockSelector, output).map((element) => {
      const first = nodes.find((part) => element.contains(part.node));
      const preceding = first ? null : nodes.filter((part) => part.node.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).at(-1);
      return { element, start: first ? first.start : (preceding ? preceding.start + preceding.value.length : 0), empty: !first, wasHidden: element.hidden };
    });
    const session = { entry, echo, output, nodes, blocks, command, length, animateEcho, viewportTop, visible: 0, pageEnd: 0, frame: 0, paused: false, followPage: true, pageTop: Math.max(0, absoluteTop(entry) - 16) };
    activeSession = session;
    renderPrefix(session, 0);
    startPage(session, true);
  }

  pagerNext?.addEventListener('click', nextPage);
  $('#pager-stop')?.addEventListener('click', () => cancelSession({ focus: true, speak: true }));
  window.addEventListener('resize', () => {
    const session = activeSession;
    if (!session) return;
    // Reflow can make previously rendered pages shorter than their old scroll offset.
    session.pageTop = Math.max(0, Math.min(session.pageTop, contentBottom(session) - 24));
    if (!session.paused) pauseSession(session);
    else keepPagePosition(session);
  });

  function rememberCommand(command) {
    if (commandHistory.at(-1) !== command) commandHistory.push(command);
    if (commandHistory.length > 50) commandHistory.shift();
    historyIndex = commandHistory.length;
    historyDraft = '';
  }

  function resetInput() {
    input.value = '';
    if ($('#input-mirror')) $('#input-mirror').textContent = '';
    if ($('#input-suggestion')) $('#input-suggestion').textContent = '';
  }

  function clearTerminal({ focus = false } = {}) {
    cancelSession();
    clearTimeout(noticeTimer);
    if ($('#notice')) { $('#notice').hidden = true; $('#notice').classList.remove('is-visible'); }
    log.replaceChildren();
    resetInput();
    historyIndex = commandHistory.length;
    historyDraft = '';
    if ($('#last-exit')) $('#last-exit').textContent = '0';
    showPrompt({ focus, scroll: false });
    screen.scrollTop = 0;
    announce('Terminal cleared.');
  }

  function resolveCommand(raw) {
    const normalized = raw.trim().replace(/\s+/g, ' ').toLowerCase();
    const firstWord = normalized.split(' ')[0];
    if (['whoami', 'about', 'cat whoami.md'].includes(normalized)) return { template: 'about', view: 'about' };
    if (['stack', 'tree', 'tree ./tech-stack', 'tree tech-stack', 'cat stack.yaml'].includes(normalized)) return { template: 'stack', view: 'stack' };
    if (normalized === 'projects' || /^kubectl get projects(?: -n my-projects)?$/.test(normalized)) return { template: 'projects', view: 'projects' };
    if (['contact', 'cat contact.yaml'].includes(normalized)) return { template: 'contact', view: 'contact' };
    if (['personal', 'cat personal.yaml'].includes(normalized)) return { template: 'personal', view: 'personal' };
    if (normalized === 'help') return { template: 'help' };
    if (['ls', 'ls -l', 'ls -a', 'ls -la', 'ls -al', 'ls ./', 'ls ~'].includes(normalized)) {
      return { text: 'whoami.md    stack.yaml    projects/    personal.yaml    contact.yaml\n\nRead a file with cat, or type help for all commands.' };
    }
    if (normalized === 'pwd') return { text: '/home/guest/fabio-portfolio' };
    if (normalized === 'date') return { text: new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', dateStyle: 'full', timeStyle: 'long' }).format(new Date()) };
    if (firstWord === 'echo') {
      let text = raw.slice(4).trimStart();
      if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) text = text.slice(1, -1);
      return { text: text || ' ' };
    }
    if (normalized === 'coffee') return { text: '☕ Coffee meetings: always accepted.\nSend an invite to fcosentino.dev@gmail.com.' };
    if (firstWord === 'sudo') return { text: 'Guest privileges are enough to explore this terminal.\nFor everything else, there is coffee. ☕' };
    if (firstWord === 'cat') return { text: 'cat: file not found.\nTry ls to list the available files, or help for all commands.', error: true };
    if (firstWord === 'kubectl') return { text: 'Usage: kubectl get projects -n my-projects', error: true };
    return { text: `Command not found: ${raw.split(/\s+/)[0]}\nType help to see the available commands.`, error: true };
  }

  function execute(raw, { animateEcho = true, updateHash = true } = {}) {
    const command = raw.trim().slice(0, 300);
    if (!command) return;
    if (command.toLowerCase() === 'clear') {
      rememberCommand(command);
      clearTerminal({ focus: true });
      return;
    }
    cancelSession();
    rememberCommand(command);
    const response = resolveCommand(command);
    if (response.template) {
      const shortcuts = { whoami: 'about', projects: 'projects', contact: 'contact', stack: 'stack', personal: 'personal', help: 'help' };
      $$('.command-shortcuts [data-command]').forEach((button) => button.classList.toggle('is-active', shortcuts[button.dataset.command] === response.template));
    }
    if ($('#last-exit')) $('#last-exit').textContent = response.error ? '127' : '0';
    if (response.view && updateHash && window.location.hash !== `#${response.view}`) {
      window.history.pushState({ view: response.view }, '', `#${response.view}`);
    }
    if (response.view) document.title = `Fabio Cosentino | ${response.view === 'about' ? 'Terminal' : response.view.charAt(0).toUpperCase() + response.view.slice(1)}`;
    reveal(command, response, animateEcho);
  }

  function interrupt() {
    if (activeSession) cancelSession({ marker: true, focus: true, speak: true });
    else {
      const { entry } = makeEntry(input.value, { text: ' ' });
      const marker = document.createElement('div');
      marker.className = 'command-interrupt';
      marker.textContent = '^C';
      entry.append(marker);
      showPrompt();
    }
    resetInput();
    historyIndex = commandHistory.length;
    historyDraft = '';
    if ($('#last-exit')) $('#last-exit').textContent = '130';
    announce('Command interrupted.');
  }

  function syncMotion() {
    const enabled = typingWanted && !reducedMotion.matches;
    if (motionButton) {
      motionButton.textContent = `typing: ${enabled ? 'on' : 'off'}`;
      motionButton.setAttribute('aria-pressed', String(enabled));
      motionButton.setAttribute('aria-label', reducedMotion.matches ? 'Typing animation disabled by reduced motion preference' : `Turn typing animation ${enabled ? 'off' : 'on'}`);
    }
    if (!enabled) finishPage();
  }

  motionButton?.addEventListener('click', () => {
    if (reducedMotion.matches) {
      notify('Typing animation is off to respect your reduced motion preference.');
      return;
    }
    typingWanted = !typingWanted;
    try { window.localStorage.setItem(storageKey, typingWanted ? 'on' : 'off'); } catch { /* Optional preference. */ }
    syncMotion();
    announce(`Typing animation ${typingWanted ? 'on' : 'off'}.`);
  });
  reducedMotion.addEventListener('change', syncMotion);
  skipButton?.addEventListener('click', finishPage);
  $('#clear-terminal')?.addEventListener('click', () => clearTerminal({ focus: true }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (activeSession) return;
    const command = input.value;
    resetInput();
    execute(command, { animateEcho: false });
  });

  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!commandHistory.length) return;
      if (historyIndex === commandHistory.length) historyDraft = input.value;
      historyIndex = Math.max(0, Math.min(commandHistory.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      input.value = historyIndex === commandHistory.length ? historyDraft : commandHistory[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      const value = input.value.trimStart().toLowerCase();
      const matches = completions.filter((candidate) => candidate.startsWith(value));
      if (!matches.length) return;
      event.preventDefault();
      let shared = matches[0];
      while (!matches.every((candidate) => candidate.startsWith(shared))) shared = shared.slice(0, -1);
      input.value = shared;
      input.setSelectionRange(input.value.length, input.value.length);
      if (matches.length > 1) notify(matches.join(' · '));
    } else if (event.ctrlKey && event.key.toLowerCase() === 'u') {
      event.preventDefault();
      resetInput();
    }
  });

  async function copyValue(value) {
    if (!value) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(value);
          notify('Copied to clipboard.');
          return;
        } catch { /* Fall back if clipboard permission is unavailable. */ }
      }
      const previousFocus = document.activeElement;
      const field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.append(field);
      let copied = false;
      try {
        field.select();
        copied = document.execCommand('copy');
      } finally {
        field.remove();
        previousFocus?.focus({ preventScroll: true });
      }
      if (!copied) throw new Error('Copy unavailable');
      notify('Copied to clipboard.');
    } catch {
      notify(`Select this text to copy: ${value}`);
    }
  }

  document.addEventListener('click', (event) => {
    const skipLink = event.target.closest('.skip-link[href="#command-input"]');
    if (skipLink) {
      event.preventDefault();
      if (activeSession) {
        if (!activeSession.paused) finishPage();
        if (activeSession?.paused) pagerNext?.focus({ preventScroll: true });
      } else showPrompt();
      return;
    }
    const copy = event.target.closest('[data-copy]');
    if (copy) {
      copyValue(copy.dataset.copy);
      return;
    }
    const trigger = event.target.closest('[data-command]');
    if (!trigger) {
      if (!activeSession && !mobile.matches && !window.getSelection()?.toString() && event.target.matches('#terminal-screen, .terminal-session, #terminal-log')) input.focus({ preventScroll: true });
      return;
    }
    event.preventDefault();
    execute(trigger.dataset.command);
    // Touch navigation never summons the software keyboard.
    if (!activeSession && !mobile.matches) input.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    const key = event.key.toLowerCase();
    const modified = event.ctrlKey || event.metaKey || event.altKey;
    if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) releasePageAnchor();
    if ((event.ctrlKey || event.metaKey) && key === 'l') {
      event.preventDefault();
      clearTerminal({ focus: true });
      return;
    }
    if (event.ctrlKey && key === 'c') {
      if (hasSelection()) return;
      event.preventDefault();
      interrupt();
      return;
    }
    if (!modified && (event.key === 'Enter' || event.key === ' ')) {
      if (activeSession || heldPagingKeys.has(event.key)) {
        const alreadyHeld = heldPagingKeys.has(event.key);
        const focusedAction = event.target instanceof Element ? event.target.closest('a[href], button') : null;
        if (!alreadyHeld && focusedAction && focusedAction !== pagerNext) return;
        heldPagingKeys.add(event.key);
        event.preventDefault();
        event.stopPropagation();
        if (!alreadyHeld && !event.repeat && activeSession?.paused) nextPage();
        return;
      }
      // The Enter that submits a command is held until keyup as well.
      if (event.key === 'Enter' && event.target === input && input.value.trim()) heldPagingKeys.add(event.key);
    }
    if (activeSession && !modified && key === 'q') {
      event.preventDefault();
      event.stopPropagation();
      cancelSession({ focus: true, speak: true });
      return;
    }
    if (event.key === 'Escape' && activeSession) {
      event.preventDefault();
      finishPage();
      return;
    }
    const editing = event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]');
    if (!activeSession && !editing && !modified && !event.shiftKey && event.key === '/') {
      event.preventDefault();
      showPrompt();
    }
  }, true);
  document.addEventListener('keyup', (event) => {
    if (!heldPagingKeys.has(event.key)) return;
    heldPagingKeys.delete(event.key);
    event.preventDefault();
    event.stopPropagation();
  }, true);
  window.addEventListener('blur', () => heldPagingKeys.clear());

  const fullscreenButton = $('#fullscreen-toggle');
  fullscreenButton?.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else notify('Fullscreen is unavailable in this browser.');
    } catch {
      notify('The browser could not enter fullscreen.');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const full = Boolean(document.fullscreenElement);
    fullscreenButton?.setAttribute('aria-label', full ? 'Exit fullscreen' : 'Enter fullscreen');
    fullscreenButton?.setAttribute('aria-pressed', String(full));
  });

  const clock = $('#clock');
  const clockFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false });
  function updateClock() {
    if (clock) clock.textContent = clockFormatter.format(new Date());
  }

  function commandFromHash() {
    const hash = window.location.hash.slice(1).toLowerCase();
    return Object.hasOwn(viewCommands, hash) ? viewCommands[hash] : null;
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#command-input') return;
    const command = commandFromHash();
    if (command) execute(command, { updateHash: false });
    else clearTerminal({ focus: false });
  });

  input.maxLength = 300;
  if (!input.placeholder) input.placeholder = 'type help to explore';
  if ($('#input-mirror')) $('#input-mirror').hidden = true;
  if ($('#input-suggestion')) $('#input-suggestion').hidden = true;
  log.setAttribute('aria-live', 'off');
  syncMotion();
  updateClock();
  setInterval(updateClock, 1000);
  setState('idle');
  const initialCommand = commandFromHash();
  if (initialCommand) execute(initialCommand, { updateHash: false });
  else showPrompt({ scroll: false });
})();
