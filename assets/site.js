document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.main-header');
  const navMenu = document.getElementById('navMenu');
  const hamburger = document.getElementById('hamburger');

  let ticking = false;
  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateHeader);
  }, { passive: true });
  updateHeader();

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    link.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - 92;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach((i) => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  const noticeModal = document.getElementById('noticeModal');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeMessage = document.getElementById('noticeMessage');
  const noticeClose = document.getElementById('noticeClose');

  const showNotice = (title, message) => {
    if (!noticeModal || !noticeTitle || !noticeMessage) {
      window.alert(message);
      return;
    }
    noticeTitle.textContent = title;
    noticeMessage.textContent = message;
    noticeModal.classList.add('show');
  };

  if (noticeClose && noticeModal) {
    noticeClose.addEventListener('click', () => noticeModal.classList.remove('show'));
    noticeModal.addEventListener('click', (e) => {
      if (e.target === noticeModal) noticeModal.classList.remove('show');
    });
  }

  const form = document.getElementById('quote-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(form.action || 'https://formspree.io/f/xbdagqon', {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          showNotice('Request Sent', 'Your request has been sent successfully. We will reply soon.');
          form.reset();
        } else {
          showNotice('Send Failed', 'Could not send now. Please try again.');
        }
      } catch (err) {
        showNotice('Network Error', 'Please check your connection and try again.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const slides = document.getElementById('slides');
  const dotsContainer = document.getElementById('dots');
  const slider = document.getElementById('slider');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  const sliderConfig = window.SLIDER_IMAGES || null;
  if (slides && dotsContainer && slider && sliderConfig && Array.isArray(sliderConfig.desktop) && sliderConfig.desktop.length) {
    const desktopSlides = sliderConfig.desktop;
    const mobileSlides = Array.isArray(sliderConfig.mobile) && sliderConfig.mobile.length ? sliderConfig.mobile : desktopSlides;

        const isMobileViewport = window.matchMedia('(max-width: 991px)').matches;
    const totalSlides = isMobileViewport ? mobileSlides.length : desktopSlides.length;

    slides.innerHTML = '';
    for (let i = 0; i < totalSlides; i += 1) {
      const desktopSrc = desktopSlides[i] || mobileSlides[i];
      const mobileSrc = mobileSlides[i] || desktopSlides[i];
      const picture = document.createElement('picture');
      const source = document.createElement('source');
      source.media = '(max-width: 991px)';
      source.srcset = mobileSrc;

      const img = document.createElement('img');
      img.src = isMobileViewport ? mobileSrc : desktopSrc;
      img.alt = `Retouch sample ${i + 1}`;
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';

      picture.appendChild(source);
      picture.appendChild(img);
      slides.appendChild(picture);
    }

    const total = slides.children.length;
    let index = 0;
    let timer = null;

    const updateSlider = () => {
      slides.style.transform = `translateX(-${index * 100}%)`;
      dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    };

    const next = () => {
      index = (index + 1) % total;
      updateSlider();
    };

    const prev = () => {
      index = (index - 1 + total) % total;
      updateSlider();
    };

    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(next, 3800);
    };

    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = i === 0 ? 'dot active' : 'dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => {
        index = i;
        updateSlider();
        stop();
        start();
      });
      dotsContainer.appendChild(dot);
    }

    nextBtn?.addEventListener('click', () => {
      next();
      stop();
      start();
    });

    prevBtn?.addEventListener('click', () => {
      prev();
      stop();
      start();
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    start();
  }
});





