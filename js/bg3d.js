// bg3d.js — fundo 3D das telas de entrada (verificação + login)
// Three.js via CDN: halter em wireframe violeta + partículas.
// Se o CDN falhar, o site continua normal (fundo em gradiente do CSS).

(function () {
  var canvas = document.getElementById('bg3d');
  if (!canvas || typeof THREE === 'undefined') return; // sem WebGL/CDN: sai em silêncio

  // 1) Cena, câmera e renderizador (fundo transparente)
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 9;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  var violeta = new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 1 });

  // 2) Halter montado com formas básicas: 1 barra + 4 pesos + 2 presilhas
  var halter = new THREE.Group();
  function cilindro(raio, altura, x) {
    var malha = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, altura, 20), violeta);
    malha.rotation.z = Math.PI / 2; // deita o cilindro (vira a barra/peso)
    malha.position.x = x;
    return malha;
  }
  halter.add(cilindro(0.1, 4.6, 0));        // barra
  halter.add(cilindro(0.85, 0.28, -1.7));   // peso maior esq.
  halter.add(cilindro(0.6, 0.24, -2.15));   // peso menor esq.
  halter.add(cilindro(0.85, 0.28, 1.7));    // peso maior dir.
  halter.add(cilindro(0.6, 0.24, 2.15));    // peso menor dir.
  halter.rotation.z = -0.35;                // inclinação de vitrine
  halter.scale.setScalar(1.35);
  scene.add(halter);

  // 2b) Posição responsiva: o halter ancora no meio da faixa livre à
  // esquerda do cartão (calculado pela largura real da tela), então sempre
  // aparece de verdade — parte fora do cartão, parte através do vidro.
  // No mobile o cartão ocupa quase tudo: ancora no topo.
  function layout() {
    var aspect = innerWidth / innerHeight;
    if (aspect > 1.1) {
      var halfW = Math.tan(camera.fov * Math.PI / 360) * camera.position.z * aspect;
      var cardPx = Math.min(1020, innerWidth - 64);
      var cardHalf = (cardPx / 2) / ((innerWidth / 2) / halfW);
      halter.position.x = -(cardHalf + halfW) / 2;
      halter.userData.baseY = 0;
    }
    else { halter.position.x = 0; halter.userData.baseY = 3.1; }
    halter.position.y = halter.userData.baseY;
  }
  layout();

  // 3) Partículas subindo em loop
  var N = 250, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  var geoPart = new THREE.BufferGeometry();
  geoPart.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var particulas = new THREE.Points(geoPart, new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.06, transparent: true, opacity: 0.7 }));
  scene.add(particulas);

  // 4) Mouse move a câmera (parallax) — sem re-render do React, direto no WebGL
  var mouseX = 0, mouseY = 0;
  addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / innerWidth - 0.5) * 2;
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  });
  addEventListener('resize', function () {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    layout();
  });

  // 5) Loop de animação: halter gira e flutua, partículas sobem
  var rodando = true, t = 0;
  (function animar() {
    if (!rodando) return;
    requestAnimationFrame(animar);
    t += 0.008;
    halter.rotation.y += 0.005;
    halter.position.y = halter.userData.baseY + Math.sin(t) * 0.3;
    var p = geoPart.attributes.position.array;
    for (var i = 0; i < N; i++) {
      p[i * 3 + 1] += 0.012;
      if (p[i * 3 + 1] > 7) p[i * 3 + 1] = -7;
    }
    geoPart.attributes.position.needsUpdate = true;
    camera.position.x += (mouseX * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 1.1 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  })();

  // 6) App chama isso ao entrar no painel (economiza GPU lá dentro)
  window.NOCTIS_BG = { parar: function () { rodando = false; canvas.style.display = 'none'; } };
})();
