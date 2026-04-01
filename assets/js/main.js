/**
 * Eleva Brasil Treinamentos - Main JavaScript
 * Handles: Navigation, Scroll Reveal, Counter, Course Filters, Modal, Form/WhatsApp, Back-to-top
 */

(function () {
  'use strict';

  // ===== MOBILE MENU =====
  var menuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    var openIcon = menuBtn.querySelector('.menu-open');
    var closeIcon = menuBtn.querySelector('.menu-close');

    menuBtn.addEventListener('click', function () {
      var isOpen = !mobileMenu.classList.contains('hidden');

      mobileMenu.classList.toggle('hidden');
      openIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        openIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== ACTIVE NAV ON SCROLL =====
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link[data-section]');
  var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function updateActiveNav() {
    var scrollY = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('data-section') === id);
        });

        mobileNavLinks.forEach(function (link) {
          var href = link.getAttribute('href');
          link.classList.toggle('active', href === '#' + id);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ===== HEADER BACKGROUND ON SCROLL =====
  var header = document.getElementById('header');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('shadow-lg');
    } else {
      header.classList.remove('shadow-lg');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });

  // ===== SCROLL REVEAL =====
  var revealElements = document.querySelectorAll('.scroll-reveal');

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.style.animationDelay;
          if (delay) {
            var ms = parseFloat(delay) * 1000;
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, ms);
          } else {
            entry.target.classList.add('visible');
          }
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ===== COUNTER ANIMATION =====
  var counters = document.querySelectorAll('.counter');

  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var target = parseInt(entry.target.getAttribute('data-target'), 10);
          animateCounter(entry.target, target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });

  function animateCounter(element, target) {
    var current = 0;
    var duration = 2000;
    var stepTime = Math.max(Math.floor(duration / target), 20);

    var timer = setInterval(function () {
      current += Math.ceil(target / (duration / stepTime));
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = current;
    }, stepTime);
  }

  // ===== COURSE FILTER TABS =====
  var tabs = document.querySelectorAll('.course-tab');
  var courseCards = document.querySelectorAll('.course-card');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var category = this.getAttribute('data-category');

      // Update active tab
      tabs.forEach(function (t) {
        t.classList.remove('active');
      });
      this.classList.add('active');

      // Filter cards
      courseCards.forEach(function (card) {
        var cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.classList.remove('hidden-card');
          card.style.display = '';
        } else {
          card.classList.add('hidden-card');
          card.style.display = 'none';
        }
      });
    });
  });

  // ===== APOIO MODAL =====
  var apoioModal = document.getElementById('apoio-modal');

  window.openApoioModal = function () {
    if (!apoioModal) return;
    apoioModal.classList.remove('hidden');
    apoioModal.classList.add('flex');
    requestAnimationFrame(function () {
      apoioModal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  };

  window.closeApoioModal = function () {
    if (!apoioModal) return;
    apoioModal.classList.remove('active');
    setTimeout(function () {
      apoioModal.classList.add('hidden');
      apoioModal.classList.remove('flex');
      document.body.style.overflow = '';
    }, 250);
  };

  if (apoioModal) {
    apoioModal.addEventListener('click', function (e) {
      if (e.target === apoioModal) closeApoioModal();
    });
  }

  // ===== COURSE MODAL =====
  var modal = document.getElementById('course-modal');

  window.openCourseModal = function (cardEl) {
    if (!modal) return;

    var title = cardEl.getAttribute('data-title');
    var hours = cardEl.getAttribute('data-hours');
    var description = cardEl.getAttribute('data-description');
    var norms = cardEl.getAttribute('data-norms');
    var image = cardEl.getAttribute('data-image');

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-hours').textContent = hours;
    document.getElementById('modal-description').textContent = description;
    document.getElementById('modal-image').src = image;
    document.getElementById('modal-image').alt = title;

    var normsEl = document.getElementById('modal-norms');
    if (norms && norms !== '-') {
      normsEl.textContent = norms;
      normsEl.style.display = '';
    } else {
      normsEl.style.display = 'none';
    }

    // Build WhatsApp link
    var msg = 'Olá! Tenho interesse no curso *' + title + '* e gostaria de mais informações sobre matrícula.';
    var waUrl = 'https://api.whatsapp.com/send?phone=5522998588802&text=' + encodeURIComponent(msg);
    document.getElementById('modal-whatsapp').href = waUrl;

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(function () {
      modal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  };

  window.closeCourseModal = function () {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(function () {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }, 250);
  };

  // Close modal on backdrop click
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeCourseModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeCourseModal();
    }
  });

  // ===== CONTACT FORM → WHATSAPP =====
  var form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameField = form.querySelector('#name');
      var emailField = form.querySelector('#email');
      var phoneField = form.querySelector('#phone');
      var courseField = form.querySelector('#course');
      var messageField = form.querySelector('#message');

      // Validate required fields
      var isValid = true;

      [nameField, emailField, phoneField, courseField].forEach(function (field) {
        if (!field.value.trim()) {
          field.classList.add('border-red-500');
          isValid = false;
        } else {
          field.classList.remove('border-red-500');
        }
      });

      // Basic email validation
      if (emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('border-red-500');
        isValid = false;
      }

      if (!isValid) return;

      // Build WhatsApp message
      var parts = [
        '*Nova Matrícula - Eleva Brasil*',
        '',
        '*Nome:* ' + nameField.value.trim(),
        '*E-mail:* ' + emailField.value.trim(),
        '*Telefone:* ' + phoneField.value.trim(),
        '*Curso:* ' + courseField.value
      ];

      if (messageField && messageField.value.trim()) {
        parts.push('*Mensagem:* ' + messageField.value.trim());
      }

      var waMsg = parts.join('\n');
      var waUrl = 'https://api.whatsapp.com/send?phone=5522998588802&text=' + encodeURIComponent(waMsg);

      // Show success feedback before redirecting
      var successMsg = document.getElementById('form-success');
      if (successMsg) {
        successMsg.classList.remove('hidden');
        setTimeout(function () {
          successMsg.classList.add('hidden');
        }, 5000);
      }

      // Open WhatsApp
      window.open(waUrl, '_blank');

      // Reset form
      form.reset();
    });

    // Remove error styling on input
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        this.classList.remove('border-red-500');
      });
    });
  }

  // ===== BACK TO TOP =====
  var backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    window.addEventListener(
      'scroll',
      function () {
        if (window.scrollY > 500) {
          backToTop.classList.remove('opacity-0', 'invisible', 'translate-y-4');
          backToTop.classList.add('opacity-100', 'visible', 'translate-y-0');
        } else {
          backToTop.classList.add('opacity-0', 'invisible', 'translate-y-4');
          backToTop.classList.remove('opacity-100', 'visible', 'translate-y-0');
        }
      },
      { passive: true }
    );

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== PHONE MASK =====
  var phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var value = this.value.replace(/\D/g, '');
      if (value.length <= 2) {
        this.value = '(' + value;
      } else if (value.length <= 7) {
        this.value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
      } else {
        this.value =
          '(' +
          value.substring(0, 2) +
          ') ' +
          value.substring(2, 7) +
          '-' +
          value.substring(7, 11);
      }
    });
  }

  // ========== APOIO MODAL ==========
function openApoioModal() {
  const modal = document.getElementById('apoio-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeApoioModal() {
  const modal = document.getElementById('apoio-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

// Fechar modal ao clicar no backdrop
document.addEventListener('click', function(event) {
  const modal = document.getElementById('apoio-modal');
  if (modal && !modal.classList.contains('hidden') && event.target === modal) {
    closeApoioModal();
  }
});

// Fechar modal com tecla ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.getElementById('apoio-modal');
    if (modal && !modal.classList.contains('hidden')) {
      closeApoioModal();
    }
  }
});
})();
