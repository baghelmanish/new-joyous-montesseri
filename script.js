/**
 * Joyous Montessori - Unified Interactions & Navigation
 */

window.toggleSiteNav = function (e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }

  var header = document.getElementById('header');
  var nav = document.getElementById('siteNav');
  var menuButton = document.getElementById('mobileMenuBtn');
  var closeButton = document.getElementById('mobileMenuCloseBtn');
  var backdrop = document.getElementById('mobileMenuBackdrop');
  if (!header || !nav) return;

  var isOpen = header.getAttribute('data-menu-open') === 'true' || header.classList.contains('is-menu-open') || nav.classList.contains('is-active');
  var next = !isOpen;

  header.setAttribute('data-menu-open', String(next));
  header.classList.toggle('is-menu-open', next);
  nav.classList.toggle('is-active', next);
  if (backdrop) backdrop.classList.toggle('is-active', next);

  if (menuButton) {
    menuButton.setAttribute('aria-expanded', String(next));
    menuButton.setAttribute('aria-label', next ? 'Close navigation menu' : 'Open navigation menu');
  }

  if (next) {
    document.body.style.overflow = 'hidden';
    nav.inert = false;
    nav.removeAttribute('aria-hidden');
    if (closeButton) {
      try { closeButton.focus(); } catch (err) {}
    }
  } else {
    document.body.style.overflow = '';
    if (window.innerWidth < 1024) {
      nav.inert = true;
      nav.setAttribute('aria-hidden', 'true');
    }
    var programs = header.querySelector('.jm-programs');
    if (programs) programs.classList.remove('is-expanded');
    var programsToggle = document.getElementById('programsDropdownTrigger');
    if (programsToggle) programsToggle.setAttribute('aria-expanded', 'false');
    if (menuButton) {
      try { menuButton.focus(); } catch (err) {}
    }
  }
};

var _lastSubmenuToggleTime = 0;
window.toggleProgramsSubmenu = function (e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  var now = Date.now();
  if (now - _lastSubmenuToggleTime < 280) return;
  _lastSubmenuToggleTime = now;

  var programs = document.querySelector('#header .jm-programs');
  var programsToggle = document.getElementById('programsDropdownTrigger');
  if (!programs) return;
  var isExp = programs.classList.toggle('is-expanded');
  if (programsToggle) programsToggle.setAttribute('aria-expanded', String(isExp));
};

function initJoyousApp() {
  // Unified Site Header Navigation & Mobile Drawer
  const header = document.getElementById('header');
  if (header) {
    const nav = document.getElementById('siteNav');
    const menuButton = document.getElementById('mobileMenuBtn');
    const closeButton = document.getElementById('mobileMenuCloseBtn');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const programs = header.querySelector('.jm-programs');
    const programsToggle = document.getElementById('programsDropdownTrigger');

    function isCompact() {
      return window.innerWidth < 1024;
    }

    function setProgramsOpen(open) {
      if (!programs) return;
      programs.classList.toggle('is-expanded', open);
      if (programsToggle) programsToggle.setAttribute('aria-expanded', String(open));
    }

    function updateNavigationAccess() {
      if (!nav) return;
      const compact = isCompact();
      const menuOpen = header.getAttribute('data-menu-open') === 'true' || header.classList.contains('is-menu-open');
      nav.inert = compact && !menuOpen;
      if (compact) nav.setAttribute('aria-hidden', String(!menuOpen));
      else {
        nav.inert = false;
        nav.removeAttribute('aria-hidden');
      }
    }

    if (menuButton) {
      menuButton.onclick = window.toggleSiteNav;
    }

    if (closeButton) {
      closeButton.onclick = window.toggleSiteNav;
    }

    if (backdrop) {
      backdrop.onclick = window.toggleSiteNav;
    }

    if (programsToggle) {
      programsToggle.onclick = window.toggleProgramsSubmenu;
    }

    // On mobile, tapping "Our Programs" toggles the submenu accordion
    const programsMainLink = programs ? programs.querySelector(':scope > .jm-nav-link') : null;
    if (programsMainLink) {
      programsMainLink.onclick = function (e) {
        if (isCompact()) {
          window.toggleProgramsSubmenu(e);
        }
      };
    }

    let programsCloseTimer = null;
    if (programs) {
      programs.addEventListener('mouseenter', function () {
        if (!isCompact()) {
          if (programsCloseTimer) {
            clearTimeout(programsCloseTimer);
            programsCloseTimer = null;
          }
          setProgramsOpen(true);
        }
      });
      programs.addEventListener('mouseleave', function () {
        if (!isCompact()) {
          if (programsCloseTimer) clearTimeout(programsCloseTimer);
          programsCloseTimer = setTimeout(function () {
            if (!programs.matches(':hover') && !programs.contains(document.activeElement)) {
              setProgramsOpen(false);
            }
          }, 280);
        }
      });
      programs.addEventListener('focusout', function () {
        if (!isCompact()) {
          queueMicrotask(function () {
            if (!programs.contains(document.activeElement)) {
              if (programsCloseTimer) clearTimeout(programsCloseTimer);
              programsCloseTimer = setTimeout(function () {
                if (!programs.matches(':hover') && !programs.contains(document.activeElement)) {
                  setProgramsOpen(false);
                }
              }, 200);
            }
          });
        }
      });
    }

    if (nav) {
      nav.addEventListener('click', function (event) {
        const link = event.target.closest('a');
        if (!link || !isCompact()) return;

        // If user tapped "Our Programs" main link, it is handled above by programsMainLink listener
        if (link === programsMainLink) return;

        const href = (link.getAttribute('href') || '').trim();
        if (!href || href === '#' || href.startsWith('javascript:')) return;

        const rawPath = window.location.pathname.toLowerCase();
        const pathSegments = rawPath.split('/').filter(Boolean);
        const lastSegment = pathSegments.pop() || '';
        const currentFile = lastSegment.endsWith('.html') ? lastSegment : (lastSegment ? lastSegment + '.html' : 'index.html');
        const isCurrentOurPrograms = currentFile === 'our-programs.html' || rawPath.includes('our-programs');

        const isAnchorOnly = href.startsWith('#');
        const hrefFile = href.split('#')[0].toLowerCase();
        const targetAnchor = href.includes('#') ? '#' + href.split('#')[1] : '';

        const isTargetingCurrentPage = isAnchorOnly || hrefFile === currentFile || (isCurrentOurPrograms && (hrefFile === 'our-programs.html' || hrefFile === 'our-programs' || hrefFile === ''));

        if (isTargetingCurrentPage) {
          event.preventDefault();
          event.stopPropagation();
          window.toggleSiteNav();

          if (targetAnchor && targetAnchor !== '#') {
            setTimeout(function () {
              const targetEl = document.querySelector(targetAnchor);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
              try {
                history.pushState(null, '', targetAnchor);
              } catch (err) {
                window.location.hash = targetAnchor;
              }
            }, 100);
          } else {
            setTimeout(function () {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              try {
                history.pushState(null, '', window.location.pathname);
              } catch (err) {}
            }, 100);
          }
          return;
        }

        // For regular navigation to other pages:
        // Close the drawer if navigating internally so back/forward or next page is clean
        if (!link.getAttribute('target') || link.getAttribute('target') === '_self') {
          window.toggleSiteNav();
        }
      });
    }

    document.addEventListener('click', function (event) {
      if (!isCompact() && programs && !programs.contains(event.target)) {
        setProgramsOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        const isOpen = header.getAttribute('data-menu-open') === 'true' || header.classList.contains('is-menu-open');
        if (isOpen) window.toggleSiteNav();
        else if (programsToggle && programsToggle.getAttribute('aria-expanded') === 'true') {
          setProgramsOpen(false);
          programsToggle.focus();
        }
      }
    });

    window.addEventListener('resize', function () {
      const isOpen = header.getAttribute('data-menu-open') === 'true' || header.classList.contains('is-menu-open');
      if (!isCompact() && isOpen) {
        window.toggleSiteNav();
      }
      updateNavigationAccess();
    });

    updateNavigationAccess();
  }

  // Sticky Header elevation effect on scroll
  const siteHeader = document.getElementById('header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        siteHeader.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
      } else {
        siteHeader.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
      }
    });
  }

  // Intersection Observer for subtle fade-in reveals
  const revealElements = document.querySelectorAll('.feature-card, .program-card, .award-card, .gallery-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  }

  // Let's Talk Floating Widget Toggle & Multi-Step Conversational Engine
  const letsTalkWidget = document.getElementById('letsTalkWidget');
  const letsTalkBtn = document.getElementById('letsTalkBtn');
  const chatCloseBtn = document.getElementById('chatDrawerClose') || document.getElementById('chatCloseBtn');
  const chatBackBtn = document.getElementById('chatBackBtn');
  const chatMessagesBody = document.getElementById('chatMessagesBody');

  let currentChatStep = 1;
  let chatData = { name: '', email: '', phone: '' };

  if (letsTalkWidget && letsTalkBtn) {
    letsTalkBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      // Check if Zoho SalesIQ is ready and open its native chat window directly
      if (window.$zoho && window.$zoho.salesiq) {
        try {
          if (typeof window.$zoho.salesiq.floatwindow !== 'undefined' && typeof window.$zoho.salesiq.floatwindow.visible === 'function') {
            window.$zoho.salesiq.floatwindow.visible('show');
            return;
          } else if (typeof window.$zoho.salesiq.chat !== 'undefined' && typeof window.$zoho.salesiq.chat.start === 'function') {
            window.$zoho.salesiq.chat.start();
            return;
          }
        } catch (salesiqErr) {
          console.warn('Zoho SalesIQ float window error, falling back to modal:', salesiqErr);
        }
      }

      // Fallback to interactive drawer if SalesIQ is still loading
      letsTalkWidget.classList.toggle('is-open');
      if (letsTalkWidget.classList.contains('is-open') && currentChatStep === 1) {
        setTimeout(() => {
          const nameField = document.getElementById('inputChatName');
          if (nameField) nameField.focus();
        }, 300);
      }
    });

    // Close button inside chat drawer
    document.querySelectorAll('#chatDrawerClose, .chat-drawer-close, .chat-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        letsTalkWidget.classList.remove('is-open');
      });
    });

    if (chatBackBtn) {
      chatBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentChatStep === 2) {
          document.getElementById('stepEmailBox').style.display = 'none';
          document.getElementById('stepNameBox').style.display = 'block';
          currentChatStep = 1;
        } else if (currentChatStep === 3) {
          document.getElementById('stepPhoneBox').style.display = 'none';
          document.getElementById('stepEmailBox').style.display = 'block';
          currentChatStep = 2;
        }
      });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!letsTalkWidget.contains(e.target)) {
        letsTalkWidget.classList.remove('is-open');
      }
    });
  }

  // Multi-step handler function
  window.handleChatStep = (step) => {
    if (step === 'name') {
      const nameVal = document.getElementById('inputChatName').value.trim();
      if (!nameVal) return;
      chatData.name = nameVal;
      
      document.getElementById('stepNameBox').style.display = 'none';
      const emailBox = document.getElementById('stepEmailBox');
      document.getElementById('userNameBubble').innerText = nameVal;
      emailBox.style.display = 'block';
      currentChatStep = 2;
      
      setTimeout(() => {
        document.getElementById('inputChatEmail').focus();
        chatMessagesBody.scrollTop = chatMessagesBody.scrollHeight;
      }, 100);
    } else if (step === 'email') {
      const emailVal = document.getElementById('inputChatEmail').value.trim();
      if (!emailVal) return;
      chatData.email = emailVal;

      document.getElementById('stepEmailBox').style.display = 'none';
      const phoneBox = document.getElementById('stepPhoneBox');
      document.getElementById('userEmailBubble').innerText = emailVal;
      phoneBox.style.display = 'block';
      currentChatStep = 3;

      setTimeout(() => {
        document.getElementById('inputChatPhone').focus();
        chatMessagesBody.scrollTop = chatMessagesBody.scrollHeight;
      }, 100);
    } else if (step === 'phone') {
      const countryVal = document.getElementById('inputChatCountry').value;
      const phoneVal = document.getElementById('inputChatPhone').value.trim();
      if (!phoneVal) return;
      chatData.phone = `${countryVal} ${phoneVal}`;

      document.getElementById('stepPhoneBox').style.display = 'none';
      const finalBox = document.getElementById('stepFinalBox');
      document.getElementById('userPhoneBubble').innerText = `${countryVal} ${phoneVal}`;
      
      document.getElementById('finalConfirmationText').innerText = 
        `${chatData.name}, Thank you for your patience in filling out the details. We will contact you as soon as possible. Meanwhile, if you would like to know more about us, feel free to ask.`;
      
      // Send lead details to Zoho SalesIQ if available
      if (window.$zoho && window.$zoho.salesiq && window.$zoho.salesiq.visitor) {
        try {
          if (chatData.name) window.$zoho.salesiq.visitor.name(chatData.name);
          if (chatData.email) window.$zoho.salesiq.visitor.email(chatData.email);
          if (chatData.phone) window.$zoho.salesiq.visitor.contactnumber(chatData.phone);
          if (typeof window.$zoho.salesiq.visitor.info === 'function') {
            window.$zoho.salesiq.visitor.info({ "Source": "Website Let's Talk Widget" });
          }
        } catch (zErr) {
          console.warn('Zoho SalesIQ visitor update:', zErr);
        }
      }

      finalBox.style.display = 'block';
      currentChatStep = 4;

      setTimeout(() => {
        document.getElementById('liveMsgInput').focus();
        chatMessagesBody.scrollTop = chatMessagesBody.scrollHeight;
      }, 100);
    }
  };

  window.handleLiveMsg = () => {
    const liveInput = document.getElementById('liveMsgInput');
    if (!liveInput || !liveInput.value.trim()) return;
    const msgText = liveInput.value.trim();

    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-msg user-msg';
    userMsgDiv.style.marginTop = '0.5rem';
    userMsgDiv.innerText = msgText;
    
    document.getElementById('stepFinalBox').insertBefore(userMsgDiv, document.querySelector('.chat-live-input-bar'));
    liveInput.value = '';

    setTimeout(() => {
      const botReply = document.createElement('div');
      botReply.className = 'chat-msg bot-msg';
      botReply.style.marginTop = '0.5rem';
      botReply.innerHTML = `<div class="chat-bubble">Thank you, <strong>${chatData.name || 'there'}</strong>! An admissions specialist has been notified and will reply shortly. You can also call us directly at <strong>(817) 431-6661</strong>.</div>`;
      document.getElementById('stepFinalBox').insertBefore(botReply, document.querySelector('.chat-live-input-bar'));
      chatMessagesBody.scrollTop = chatMessagesBody.scrollHeight;
    }, 800);
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initJoyousApp);
} else {
  initJoyousApp();
}
