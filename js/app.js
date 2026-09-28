(function(){
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var M = window.Motion || null;
  function spring(el, kf, opt){ if (M && !reduce){ try { return M.animate(el, kf, opt); } catch(e){} } return null; }

  /* ---------- videos: base64 -> blob url (reliable on iOS) ---------- */
  function loadVideo(v){
    var holder = document.getElementById(v.getAttribute("data-video"));
    if (!holder) return;
    var b64 = holder.textContent.trim();
    holder.textContent = "";
    var fellBack = false;
    function useDataUri(){ if (fellBack) return; fellBack = true; v.src = "data:video/mp4;base64," + b64; }
    v.addEventListener("error", useDataUri);
    try {
      var bin = atob(b64);
      var len = bin.length, bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
      v.src = URL.createObjectURL(new Blob([bytes], {type: "video/mp4"}));
    } catch (e) { useDataUri(); }
  }
  var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-video]"));
  videos.forEach(loadVideo);

  function setSound(btn, on){
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.querySelector("use").setAttribute("href", on ? "#i-sound-on" : "#i-sound-off");
    btn.querySelector("span").textContent = on ? "Desativar som" : "Ativar som";
  }
  videos.forEach(function(v){
    var btn = v.parentNode.querySelector(".sound");
    btn.addEventListener("click", function(){
      var turnOn = v.muted;
      videos.forEach(function(o){ if (o !== v){ o.muted = true; setSound(o.parentNode.querySelector(".sound"), false);} });
      v.muted = !turnOn;
      setSound(btn, turnOn);
      if (turnOn){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }
      if (M && !reduce){ try { M.animate(btn, {scale: [0.9, 1]}, {type: "spring", bounce: 0.45, duration: 0.4}); } catch(e){} }
    });
  });


  /* ---------- pain finder ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".pain"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".answer-panel"));
  function showPain(i, animate){
    var next = panels[i]; if (!next) return;
    chips.forEach(function(c, k){ c.setAttribute("aria-selected", k === i ? "true" : "false"); c.tabIndex = k === i ? 0 : -1; });
    if (animate && chips[i].scrollIntoView){ try { chips[i].scrollIntoView({inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth"}); } catch(e){} }
    panels.forEach(function(p, k){ p.hidden = k !== i; });
    if (!animate) return;
    var img = next.querySelector("img"), body = next.querySelector(".answer-body").children;
    spring(img, {opacity: [0, 1], transform: ["scale(1.08)", "scale(1)"]}, {duration: 0.7, ease: [0.2, 0.7, 0.2, 1]});
    spring(body, {opacity: [0, 1], transform: ["translateY(14px)", "translateY(0px)"]}, {type: "spring", bounce: 0.2, duration: 0.6, delay: M && M.stagger ? M.stagger(0.05) : 0});
  }
  chips.forEach(function(c, i){
    c.addEventListener("click", function(){ if (c.getAttribute("aria-selected") !== "true") showPain(i, true); });
    c.addEventListener("keydown", function(e){
      var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
      if (n === null) return; n = (n + chips.length) % chips.length; chips[n].focus(); showPain(n, true);
    });
  });

  /* ---------- FAQ accordion (Motion springs) ---------- */
  var faqs = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  var refreshTimer;
  function refreshLater(){ if (!hasGsap) return; clearTimeout(refreshTimer); refreshTimer = setTimeout(function(){ ScrollTrigger.refresh(); }, 120); }
  function setOpen(item, open){
    var btn = item.querySelector(".faq-btn"), panel = item.querySelector(".faq-panel"), inner = panel.firstElementChild, icon = item.querySelector(".faq-icon svg");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    item.classList.toggle("is-open", open);
    var token = (panel._t = (panel._t || 0) + 1);
    if (open){
      panel.hidden = false;
      var h = inner.offsetHeight;
      if (spring(panel, {height: [panel.offsetHeight + "px", h + "px"]}, {type: "spring", bounce: 0, duration: 0.5})){
        spring(inner, {opacity: [0, 1]}, {duration: 0.35, delay: 0.08});
        setTimeout(function(){ if (panel._t === token){ panel.style.height = "auto"; refreshLater(); } }, 560);
      } else { panel.style.height = "auto"; refreshLater(); }
    } else {
      var hh = panel.offsetHeight;
      if (spring(panel, {height: [hh + "px", "0px"]}, {type: "spring", bounce: 0, duration: 0.4})){
        setTimeout(function(){ if (panel._t === token){ panel.style.height = "0px"; panel.hidden = true; refreshLater(); } }, 440);
      } else { panel.style.height = "0px"; panel.hidden = true; refreshLater(); }
    }
    if (!spring(icon, {rotate: open ? 45 : 0}, {type: "spring", bounce: 0.4, duration: 0.5})) icon.style.transform = open ? "rotate(45deg)" : "";
  }
  faqs.forEach(function(item){
    item.querySelector(".faq-btn").addEventListener("click", function(){
      var isOpen = item.classList.contains("is-open");
      faqs.forEach(function(o){ if (o !== item && o.classList.contains("is-open")) setOpen(o, false); });
      setOpen(item, !isOpen);
    });
  });

  /* ---------- spine placement (mobile: between intro and steps) ---------- */
  var mqMobile = window.matchMedia("(max-width: 860px)");
  function placeSpine(){
    var stageEl = document.querySelector("[data-spine]");
    var slot = document.querySelector(mqMobile.matches ? ".spine-mobile-slot" : ".spine-desktop-slot");
    if (stageEl && slot && stageEl.parentNode !== slot) slot.appendChild(stageEl);
  }
  placeSpine();
  if (mqMobile.addEventListener) mqMobile.addEventListener("change", function(){ placeSpine(); if (window.ScrollTrigger) setTimeout(function(){ ScrollTrigger.refresh(); }, 50); });

  /* ---------- mobile menu (Motion) ---------- */
  var menu = document.getElementById("menu"), menuBtn = document.querySelector(".menu-btn");
  var menuOpen = false;
  function toggleMenu(open){
    menuOpen = open;
    root.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
    var links = menu.querySelectorAll("a");
    if (open){
      menu.style.visibility = "visible";
      if (M && !reduce){
        try {
          M.animate(menu, {opacity: [0, 1]}, {duration: 0.3, ease: "easeOut"});
          M.animate(links, {opacity: [0, 1], transform: ["translateY(28px)", "translateY(0px)"]}, {type: "spring", bounce: 0.15, duration: 0.6, delay: M.stagger ? M.stagger(0.05, {startDelay: 0.08}) : 0.08});
        } catch(e){ menu.style.opacity = 1; }
      } else menu.style.opacity = 1;
    } else {
      if (M && !reduce){
        try { M.animate(menu, {opacity: 0}, {duration: 0.25, ease: "easeIn"}); } catch(e){}
        setTimeout(function(){ if (!menuOpen) menu.style.visibility = "hidden"; }, 280);
      } else { menu.style.opacity = 0; menu.style.visibility = "hidden"; }
    }
  }
  menuBtn.addEventListener("click", function(){ toggleMenu(!menuOpen); });
  menu.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ toggleMenu(false); }); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && menuOpen) toggleMenu(false); });

  /* ---------- three.js spine ---------- */
  function initSpine(){
    var stage = document.querySelector("[data-spine]");
    var canvas = stage.querySelector("canvas");
    var tip = stage.querySelector("[data-tip]");
    var hint = stage.querySelector("[data-hint]");
    if (!fine) hint.textContent = "Toque nas vértebras";
    if (!window.THREE){ stage.classList.add("no-3d"); return null; }
    var T = window.THREE;
    var renderer;
    try { renderer = new T.WebGLRenderer({canvas: canvas, antialias: true, alpha: true}); }
    catch(e){ stage.classList.add("no-3d"); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1, 0.1, 100);
    scene.add(new T.HemisphereLight(0xffffff, 0x8fb0a6, 0.6));
    var key = new T.DirectionalLight(0xffffff, 1.05); key.position.set(5, 7, 6); scene.add(key);
    var rim = new T.DirectionalLight(0xe8c98a, 0.7); rim.position.set(-6, 3, -6); scene.add(rim);
    var fill = new T.DirectionalLight(0xd4e8e2, 0.4); fill.position.set(-5, -2, 6); scene.add(fill);

    var rootG = new T.Group(); scene.add(rootG);
    var spine = new T.Group(); rootG.add(spine);

    var b = 0.3, pts = [new T.Vector2(0, -0.5)], i, a;
    for (i = 0; i <= 6; i++){ a = -Math.PI/2 + i/6*Math.PI/2; pts.push(new T.Vector2(1 - b + Math.cos(a)*b, -0.5 + b + Math.sin(a)*b)); }
    for (i = 0; i <= 6; i++){ a = i/6*Math.PI/2; pts.push(new T.Vector2(1 - b + Math.cos(a)*b, 0.5 - b + Math.sin(a)*b)); }
    pts.push(new T.Vector2(0, 0.5));
    var bodyGeo = new T.LatheGeometry(pts, 30);
    var discGeo = new T.CylinderGeometry(1, 1, 1, 30);
    var archGeo = new T.TorusGeometry(1, 0.18, 10, 26, Math.PI);
    var boxGeo = new T.BoxGeometry(1, 1, 1);
    var boneMat = new T.MeshStandardMaterial({color: 0xd8cbb0, roughness: 0.5, metalness: 0.06});
    var discMat = new T.MeshStandardMaterial({color: 0xd9826a, roughness: 0.4, metalness: 0.1});
    var coral = new T.Color(0xd9826a), gold = new T.Color(0x2f8f74), glow = new T.Color(0xc9a45c);

    var regions = [
      {n: "cervical", p: "C", c: 7, r0: 0.27, r1: 0.32, h: 0.15, d: 0.06},
      {n: "torácica", p: "T", c: 12, r0: 0.34, r1: 0.44, h: 0.19, d: 0.065},
      {n: "lombar", p: "L", c: 5, r0: 0.48, r1: 0.55, h: 0.25, d: 0.085}
    ];
    var verts = [], discs = [], y = 0, pickables = [];
    regions.forEach(function(rg){
      for (var k = 0; k < rg.c; k++){
        var t = rg.c > 1 ? k/(rg.c - 1) : 0;
        var r = rg.r0 + (rg.r1 - rg.r0)*t, h = rg.h;
        var g = new T.Group();
        var mat = boneMat.clone();
        var body = new T.Mesh(bodyGeo, mat); body.scale.set(r, h, r*0.82); g.add(body);
        var arch = new T.Mesh(archGeo, mat); arch.rotation.x = -Math.PI/2; arch.position.z = -r*0.72; arch.scale.set(r*0.55, r*0.55, r*0.9); g.add(arch);
        var sp = new T.Mesh(boxGeo, mat); sp.scale.set(0.07, h*0.55, r*1.05); sp.position.set(0, -h*0.25, -r*0.72 - r*0.55 - r*0.45); sp.rotation.x = 0.5; g.add(sp);
        [-1, 1].forEach(function(s){
          var tr = new T.Mesh(boxGeo, mat); tr.scale.set(r*0.75, h*0.32, 0.08); tr.position.set(s*(r*0.55 + r*0.33), 0, -r*0.95); tr.rotation.y = s*-0.35; g.add(tr);
        });
        var idx = verts.length;
        g.children.forEach(function(m){ m.userData.i = idx; pickables.push(m); });
        spine.add(g);
        var label = rg.p + (k + 1);
        verts.push({g: g, mat: mat, h: h, r: r, y: y - h/2, hl: 0, label: label, region: rg.n});
        y -= h;
        if (!(rg.p === "L" && k === rg.c - 1)){
          var dm = new T.Mesh(discGeo, discMat); dm.scale.set(r*0.94, rg.d, r*0.78);
          spine.add(dm); discs.push({m: dm, y: y - rg.d/2});
          y -= rg.d;
        }
      }
    });
    var total = -y;
    var mid = total/2;
    function curve(s, dev, out){
      out.x = 0.9*dev*Math.sin(2*Math.PI*s)*(0.55 + 0.45*s);
      out.z = 0.42*Math.sin(3*Math.PI*s);
      out.tw = 0.55*dev*Math.sin(2*Math.PI*s);
      return out;
    }
    var P = {}, Q = {};
    function place(obj, yy, dev){
      var s = Math.min(Math.max(-yy/total, 0), 1);
      curve(s, dev, P); curve(Math.min(s + 0.01, 1), dev, Q);
      var dx = (Q.x - P.x)/(0.01*total), dz = (Q.z - P.z)/(0.01*total);
      obj.position.set(P.x, yy + mid, P.z);
      obj.rotation.set(Math.atan(dz), P.tw, Math.atan(dx));
    }
    var state = {align: 0, shownAlign: -1};
    function layout(){
      var dev = 1 - state.align;
      for (var n = 0; n < verts.length; n++) place(verts[n].g, verts[n].y, dev);
      for (var m = 0; m < discs.length; m++) place(discs[m].m, discs[m].y, dev);
      discMat.color.copy(coral).lerp(gold, state.align);
    }

    function resize(){
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w/h;
      var tan = Math.tan(camera.fov*Math.PI/360);
      var dh = (total*1.4)/(2*tan), dw = 3.4/(2*tan*camera.aspect);
      camera.position.set(0, 0, Math.max(dh, dw));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      render(true);
    }

    var ray = new T.Raycaster(), mouse = new T.Vector2(), hovered = -1;
    var ptr = {x: 0, y: 0, tx: 0, ty: 0}, lastRay = 0, tipX = 0, tipY = 0;
    function pick(clientX, clientY){
      var rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left)/rect.width)*2 - 1;
      mouse.y = -((clientY - rect.top)/rect.height)*2 + 1;
      ray.setFromCamera(mouse, camera);
      var hit = ray.intersectObjects(pickables, false);
      var idx = hit.length ? hit[0].object.userData.i : -1;
      tipX = clientX - rect.left; tipY = clientY - rect.top;
      if (idx !== hovered){
        hovered = idx;
        if (idx > -1){ tip.textContent = "Vértebra " + verts[idx].label + ", região " + verts[idx].region; tip.classList.add("is-on"); hint.style.opacity = 0; }
        else tip.classList.remove("is-on");
      }
      if (idx > -1) tip.style.transform = "translate(" + tipX + "px," + tipY + "px) translate(-50%,-140%)";
      canvas.style.cursor = idx > -1 ? "pointer" : "";
      kick();
    }
    canvas.addEventListener("pointermove", function(e){
      var rect = canvas.getBoundingClientRect();
      ptr.tx = ((e.clientX - rect.left)/rect.width - 0.5)*2;
      ptr.ty = ((e.clientY - rect.top)/rect.height - 0.5)*2;
      var now = performance.now();
      if (e.pointerType === "mouse" && now - lastRay > 40){ lastRay = now; pick(e.clientX, e.clientY); }
      kick();
    });
    canvas.addEventListener("pointerleave", function(){ ptr.tx = 0; ptr.ty = 0; hovered = -1; tip.classList.remove("is-on"); kick(); });
    canvas.addEventListener("pointerdown", function(e){ pick(e.clientX, e.clientY); });

    var active = false, raf = 0, clock = new T.Clock(), idle = 0;
    function render(force){
      if (state.shownAlign !== state.align || force){ layout(); state.shownAlign = state.align; }
      renderer.render(scene, camera);
    }
    function frame(){
      raf = 0;
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!reduce) idle += dt;
      ptr.x += (ptr.tx - ptr.x)*Math.min(dt*4, 1);
      ptr.y += (ptr.ty - ptr.y)*Math.min(dt*4, 1);
      rootG.rotation.y = Math.PI + 0.5 + ptr.x*0.5 + Math.sin(idle*0.35)*0.18;
      rootG.rotation.x = ptr.y*0.12;
      rootG.position.y = reduce ? 0 : Math.sin(idle*0.9)*0.04;
      for (var n = 0; n < verts.length; n++){
        var v = verts[n], target = n === hovered ? 1 : 0;
        v.hl += (target - v.hl)*Math.min(dt*10, 1);
        var s = 1 + 0.14*v.hl; v.g.scale.set(s, s, s);
        v.mat.emissive.copy(glow).multiplyScalar(0.45*v.hl);
      }
      render(false);
      if (active) raf = requestAnimationFrame(frame);
    }
    function kick(){ if (!raf && active) { clock.getDelta(); raf = requestAnimationFrame(frame); } }
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage); else window.addEventListener("resize", resize);
    resize();
    return {
      setAlign: function(v){ state.align = v; if (!active) render(false); },
      setActive: function(on){ active = on; if (on) kick(); }
    };
  }
  var spineApi = initSpine();

  if (!hasGsap){
    root.classList.add("ready");
    document.querySelectorAll(".step").forEach(function(s){ s.classList.add("is-active"); });
    if (spineApi){ spineApi.setAlign(1); spineApi.setActive(true); }
    videos.forEach(function(v){ var p = v.play(); if (p && p.catch) p.catch(function(){}); });
    return;
  }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  var header = document.querySelector(".site-header");
  ST.create({start: 60, end: "max",
    onUpdate: function(self){ header.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 400 && !menuOpen); },
    onToggle: function(self){ header.classList.toggle("is-solid", self.isActive); }});
  var fab = document.querySelector(".fab");
  ST.create({trigger: ".hero", start: "bottom 60%", end: "max", onToggle: function(self){ fab.classList.toggle("is-on", self.isActive); }});

  var goni = document.querySelector("[data-goni]");
  var mm = gsap.matchMedia();
  mm.add({motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)"}, function(ctx){
    root.classList.add("ready");
    if (ctx.conditions.still) return;
    var tl = gsap.timeline({defaults: {ease: "power4.out"}});
    tl.from("[data-sun]", {scale: 0.6, opacity: 0, duration: 1.6, ease: "power3.out"}, 0)
      .from("[data-hl]", {yPercent: 115, duration: 1.15, stagger: 0.09}, 0.1)
      .from("[data-hp]", {yPercent: 8, opacity: 0, duration: 1.3, ease: "power3.out"}, 0.3)
      .from(goni.querySelectorAll(".arc"), {strokeDashoffset: 1, duration: 1.6, ease: "power2.inOut"}, 0.35)
      .from(goni.querySelectorAll(".ticks line"), {opacity: 0, duration: 0.02, stagger: 0.03}, 0.5)
      .from(goni.querySelectorAll(".needle"), {rotation: -150, svgOrigin: "300 300", duration: 1.8, ease: "elastic.out(1,0.55)"}, 0.6)
      .from(goni.querySelectorAll("text"), {opacity: 0, duration: 0.6}, 1.2)
      .from("[data-hs]", {y: 18, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out"}, 0.35)
      .from("[data-fc]", {x: -30, opacity: 0, duration: 1, ease: "back.out(1.6)"}, 1.1);

    gsap.to("[data-blob]", {y: function(i){ return i ? 26 : -22; }, x: function(i){ return i ? -12 : 14; }, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.8});
    gsap.to("[data-fc]", {y: -10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.2});

    gsap.to(".hero-figure-inner", {yPercent: 10, ease: "none", scrollTrigger: {trigger: ".hero", start: "top top", end: "bottom top", scrub: true}});
    gsap.to(".hero-copy", {y: -60, ease: "none", scrollTrigger: {trigger: ".hero", start: "top top", end: "bottom top", scrub: true}});
    gsap.to(goni.querySelectorAll(".needle"), {rotation: 60, svgOrigin: "300 300", ease: "none", scrollTrigger: {trigger: ".hero", start: "top top", end: "bottom top", scrub: 1}});

    gsap.utils.toArray("[data-mask]").forEach(function(h){
      gsap.from(h.querySelectorAll(".mask > span"), {yPercent: 110, duration: 1, stagger: 0.08, ease: "power4.out", scrollTrigger: {trigger: h, start: "top 86%", once: true}});
    });
    ST.batch("[data-fade]", {start: "top 90%", once: true,
      onEnter: function(els){ gsap.from(els, {y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", overwrite: true}); }});

    /* marquee reacts to scroll speed */
    var mq = gsap.to("[data-marquee]", {xPercent: -50, duration: 45, ease: "none", repeat: -1});
    var slow;
    ST.create({start: 0, end: "max", onUpdate: function(self){
      var v = Math.min(Math.abs(self.getVelocity())/350, 5);
      mq.timeScale((self.direction === 1 ? 1 : -1)*(1 + v));
      clearTimeout(slow); slow = setTimeout(function(){ gsap.to(mq, {timeScale: 1, duration: 0.8}); }, 120);
    }});

    gsap.fromTo("[data-phone='a']", {yPercent: 6}, {yPercent: -6, ease: "none", scrollTrigger: {trigger: ".phones", start: "top bottom", end: "bottom top", scrub: true}});
    gsap.fromTo("[data-phone='b']", {yPercent: 12}, {yPercent: -12, ease: "none", scrollTrigger: {trigger: ".phones", start: "top bottom", end: "bottom top", scrub: true}});
    gsap.fromTo("[data-about-photo] img", {scale: 1.15}, {scale: 1, ease: "none", scrollTrigger: {trigger: "[data-about-photo]", start: "top bottom", end: "bottom top", scrub: true}});
    gsap.from("[data-cta]", {scale: 0.94, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: {trigger: "[data-cta]", start: "top 85%", once: true}});
    gsap.from(".card", {y: 40, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", scrollTrigger: {trigger: "[data-track]", start: "top 85%", once: true}});
  });

  /* treatments: horizontal scroll on desktop */
  var track = document.querySelector("[data-track]"), tprog = document.querySelector("[data-tprog]");
  var mmT = gsap.matchMedia();
  mmT.add("(min-width: 861px)", function(){
    function dist(){ return Math.max(0, track.scrollWidth - window.innerWidth); }
    gsap.to(track, {x: function(){ return -dist(); }, ease: "none",
      scrollTrigger: {trigger: ".treat", start: "top top", end: function(){ return "+=" + dist(); }, pin: true, scrub: reduce ? true : 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function(self){ gsap.set(tprog, {scaleX: self.progress}); }}});
  });

  /* spine */
  var steps = gsap.utils.toArray(".step");
  var alignState = {v: 0};
  var mmSpine = gsap.matchMedia();
  mmSpine.add({desk: "(min-width: 861px)", mob: "(max-width: 860px)"}, function(ctx){
    var st = ctx.conditions.desk
      ? {trigger: ".steps", start: "top 65%", end: "bottom 85%", scrub: reduce ? true : 1}
      : {trigger: "[data-spine]", start: "top 70%", end: "bottom 30%", scrub: reduce ? true : 0.6};
    gsap.fromTo(alignState, {v: 0}, {v: 1, ease: "none", scrollTrigger: st, onUpdate: function(){ if (spineApi) spineApi.setAlign(alignState.v); }});
    if (ctx.conditions.desk) steps.forEach(function(s){ ST.create({trigger: s, start: "top 62%", end: "bottom 62%", toggleClass: "is-active"}); });
  });
  ST.create({trigger: ".process", start: "top bottom", end: "bottom top", onToggle: function(self){ if (spineApi) spineApi.setActive(self.isActive); }});

  videos.forEach(function(v){
    ST.create({trigger: v, start: "top 95%", end: "bottom 5%", onToggle: function(self){
      if (self.isActive){ var p = v.play(); if (p && p.catch) p.catch(function(){}); } else v.pause(); }});
  });

  if (fine && !reduce){
    document.querySelectorAll(".magnetic").forEach(function(btn){
      var bx = gsap.quickTo(btn, "x", {duration: 0.5, ease: "power3"}), by = gsap.quickTo(btn, "y", {duration: 0.5, ease: "power3"});
      btn.addEventListener("mousemove", function(e){ var r = btn.getBoundingClientRect(); bx((e.clientX - r.left - r.width/2)*0.25); by((e.clientY - r.top - r.height/2)*0.35); });
      btn.addEventListener("mouseleave", function(){ bx(0); by(0); });
    });
  }
  window.addEventListener("load", function(){ ST.refresh(); });
})();
