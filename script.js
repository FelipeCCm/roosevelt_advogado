/* ============================================================
   Roosevelt Advogado — interações da landing page
   ============================================================ */

/* >>> TROCAR ANTES DE PUBLICAR <<<
   Número de WhatsApp que recebe as mensagens do formulário.
   Formato: código do país + DDD + número, somente dígitos.
   Ex.: Brasil (11) 91234-5678  ->  '5511912345678'              */
const WHATSAPP_NUMERO = '5534988641998';

/* ------------------------------------------------------------
   1. Hero — o nome "Roosevelt Advogado" some suavemente ao
      rolar; a balança permanece e recentra-se sozinha
   ------------------------------------------------------------ */
(function heroLockup () {
  const hero       = document.getElementById('topo');
  const lockup     = document.getElementById('heroLockup');
  const mark       = document.getElementById('heroMark');
  const tail       = document.getElementById('heroTail');
  const caption    = document.getElementById('heroCaption');
  const scrollHint = document.getElementById('heroScroll');
  if (!hero || !mark || !tail) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const range = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
  // suavização (ease-in-out) para um movimento mais orgânico
  const ease  = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let tailWidth = 0;
  let ticking   = false;

  function measure () {
    tail.style.maxWidth = 'none';
    tailWidth = tail.scrollWidth;
  }

  function update () {
    ticking = false;

    if (reduceMotion) {
      tail.style.maxWidth = 'none';
      tail.style.opacity  = 1;
      if (caption) caption.style.opacity = 1;
      return;
    }

    // progresso da rolagem dentro do trilho do hero (0 -> 1)
    const scrollable = hero.offsetHeight - window.innerHeight;
    const progress   = clamp(-hero.getBoundingClientRect().top / scrollable, 0, 1);

    // o nome encolhe e desliza para a esquerda (0 -> 0.62 do trilho)
    const collapse = ease(range(progress, 0, 0.62));
    tail.style.maxWidth  = (tailWidth * (1 - collapse)).toFixed(1) + 'px';
    tail.style.transform = `translateX(${(-collapse * 70).toFixed(1)}px)`;

    // a opacidade do nome desaparece um pouco antes, suavemente
    tail.style.opacity = (1 - ease(range(progress, 0, 0.48))).toFixed(3);

    // a balança cresce de leve enquanto se torna o elemento único
    const grow = ease(range(progress, 0.05, 0.72));
    mark.style.transform = `scale(${(1 + grow * 0.22).toFixed(4)})`;

    // a balança sobe um pouco para abrir espaço ao texto final
    if (lockup) {
      const lift = ease(range(progress, 0.45, 0.9));
      lockup.style.transform = `translateY(${(-lift * 58).toFixed(1)}px)`;
    }

    // o texto reaparece suavemente abaixo da balança
    if (caption) {
      const captionIn = ease(range(progress, 0.58, 0.94));
      caption.style.opacity   = captionIn.toFixed(3);
      caption.style.transform = `translateY(${((1 - captionIn) * 26).toFixed(1)}px)`;
    }

    // a dica de rolagem some logo no início
    if (scrollHint) {
      scrollHint.style.opacity = (1 - range(progress, 0, 0.22)).toFixed(3);
    }
  }

  function onScroll () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  function onResize () {
    measure();
    onScroll();
  }

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);
  // remede a largura quando as fontes terminam de carregar
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(onResize);
  }
})();

/* ------------------------------------------------------------
   2. Header sólido após sair do hero
   ------------------------------------------------------------ */
(function stickyHeader () {
  const header = document.getElementById('siteHeader');
  const hero   = document.getElementById('topo');
  if (!header) return;

  function check () {
    // sólido somente depois que o hero (navy) sai da tela
    const solid = hero
      ? hero.getBoundingClientRect().bottom <= 90
      : window.scrollY > window.innerHeight * 0.85;
    header.classList.toggle('is-solid', solid);
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ------------------------------------------------------------
   3. Menu mobile
   ------------------------------------------------------------ */
(function mobileNav () {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('nav');
  if (!toggle || !nav) return;

  function close () {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

/* ------------------------------------------------------------
   4. Revelar seções ao rolar
   ------------------------------------------------------------ */
(function revealOnScroll () {
  const targets = document.querySelectorAll(
    '.sobre__copy, .sobre__media, .section-head, .area-card, ' +
    '.metodo__steps li, .contato__intro, .form'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.09}s`;
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => io.observe(el));
})();

/* ------------------------------------------------------------
   5. Botão flutuante do WhatsApp
   ------------------------------------------------------------ */
(function whatsappFloat () {
  const btn = document.getElementById('whatsappFloat');
  if (!btn) return;

  function check () {
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.4);
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ------------------------------------------------------------
   6. Formulário -> WhatsApp
   ------------------------------------------------------------ */
(function leadForm () {
  const form  = document.getElementById('leadForm');
  const error = document.getElementById('formError');
  if (!form) return;

  const fields = ['nome', 'telefone', 'area', 'mensagem']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // limpa o estado de erro ao digitar
  fields.forEach(field => {
    const evt = field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(evt, () => {
      field.closest('.field').classList.remove('is-invalid');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valido = true;
    fields.forEach(field => {
      const wrap = field.closest('.field');
      if (!field.value.trim()) {
        wrap.classList.add('is-invalid');
        valido = false;
      } else {
        wrap.classList.remove('is-invalid');
      }
    });

    if (!valido) {
      error.hidden = false;
      return;
    }
    error.hidden = true;

    const nome      = document.getElementById('nome').value.trim();
    const telefone  = document.getElementById('telefone').value.trim();
    const area      = document.getElementById('area').value;
    const mensagem  = document.getElementById('mensagem').value.trim();

    const texto =
      `Olá, gostaria de falar com o advogado.\n\n` +
      `*Nome:* ${nome}\n` +
      `*Telefone:* ${telefone}\n` +
      `*Área de interesse:* ${area}\n` +
      `*Caso:* ${mensagem}`;

    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank', 'noopener');
  });
})();
