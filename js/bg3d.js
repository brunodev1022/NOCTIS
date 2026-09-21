// bg3d.js — fundo 3D das telas de entrada (verificação + login)
// Three.js via CDN: campo de partículas violeta com parallax de mouse.
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

  // 2) Partículas subindo em loop
  var N = 280, pos = new Float32Array(N * 3);
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
  });

  // 4) Loop de animação: partículas sobem, câmera segue o mouse
  var rodando = true;
  (function animar() {
    if (!rodando) return;
    requestAnimationFrame(animar);
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
