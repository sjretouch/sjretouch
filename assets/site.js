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
    if (!href || href === '#' || link.classList.contains('service-quote-btn')) return;
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

  const servicesTrack = document.getElementById('servicesTrack');
  const servicesPrev = document.querySelector('.services-prev');
  const servicesNext = document.querySelector('.services-next');
  const serviceCards = servicesTrack ? Array.from(servicesTrack.querySelectorAll('.service-card[data-service]')) : [];
  const quoteTypeSelect = form ? form.querySelector('select[name="photo_type"]') : null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollToContact = () => {
    const contact = document.getElementById('contact');
    if (!contact) return;
    const top = contact.getBoundingClientRect().top + window.pageYOffset - 92;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const pickServiceType = (serviceName) => {
    if (!quoteTypeSelect || !serviceName) return;
    const option = Array.from(quoteTypeSelect.options).find((item) => item.value === serviceName || item.text.trim() === serviceName);
    if (!option) return;
    quoteTypeSelect.value = option.value || option.text.trim();
    quoteTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const openQuoteForm = (serviceName) => {
    pickServiceType(serviceName);
    scrollToContact();
    window.setTimeout(() => {
      if (quoteTypeSelect) quoteTypeSelect.focus({ preventScroll: true });
    }, prefersReducedMotion ? 0 : 450);
  };

  serviceCards.forEach((card) => {
    const serviceName = card.getAttribute('data-service');
    const serviceHref = card.getAttribute('data-href');
    if (!serviceName) return;

    const openServicePage = () => {
      if (!serviceHref) return;
      window.location.href = serviceHref;
    };

    card.addEventListener('click', (e) => {
      const target = e.target instanceof Element ? e.target : null;
      const quoteBtn = target ? target.closest('.service-quote-btn') : null;
      if (quoteBtn) {
        e.preventDefault();
        openQuoteForm(serviceName);
        return;
      }

      const interactive = target ? target.closest('button,input,select,textarea,label') : null;
      if (interactive) return;
      openServicePage();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openServicePage();
    });
  });

  if (servicesTrack && servicesPrev && servicesNext) {
    let servicesIndex = 0;

    const getColumns = () => {
      if (window.matchMedia('(max-width: 768px)').matches) return 1;
      if (window.matchMedia('(max-width: 1100px)').matches) return 2;
      return 3;
    };

    const getStepSize = () => {
      const firstCard = servicesTrack.querySelector('.service-card');
      if (!firstCard) return 0;
      const styles = getComputedStyle(servicesTrack);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const getMaxIndex = () => {
      return Math.max(0, serviceCards.length - getColumns());
    };

    const updateServicesCarousel = () => {
      const maxIndex = getMaxIndex();
      if (servicesIndex > maxIndex) servicesIndex = maxIndex;

      const offset = getStepSize() * servicesIndex;
      servicesTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;

      servicesPrev.disabled = servicesIndex <= 0;
      servicesNext.disabled = servicesIndex >= maxIndex;
    };

    const moveServices = (direction) => {
      const maxIndex = getMaxIndex();
      servicesIndex = Math.max(0, Math.min(maxIndex, servicesIndex + direction));
      updateServicesCarousel();
    };

    servicesPrev.addEventListener('click', () => moveServices(-1));
    servicesNext.addEventListener('click', () => moveServices(1));

    window.addEventListener('resize', () => {
      window.requestAnimationFrame(updateServicesCarousel);
    });

    updateServicesCarousel();
  }
  const slides = document.getElementById('slides');
  const dotsContainer = document.getElementById('dots');
  const slider = document.getElementById('slider');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  const sliderConfig = window.SLIDER_IMAGES || null;
  if (slides && dotsContainer && slider && sliderConfig && Array.isArray(sliderConfig.desktop) && sliderConfig.desktop.length) {
    const desktopSlides = sliderConfig.desktop;
    const mobileSlides = Array.isArray(sliderConfig.mobile) && sliderConfig.mobile.length ? sliderConfig.mobile : [];
    const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    const isMobileDevice = window.matchMedia('(max-width: 1024px)').matches || window.matchMedia('(pointer: coarse)').matches || uaMobile;
    const slideList = isMobileDevice && mobileSlides.length ? mobileSlides : desktopSlides;

    slides.innerHTML = '';
    slideList.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Retouch sample ${i + 1}`;
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      slides.appendChild(img);
    });

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
















