export function initShaderBackground(canvasId = 'shader-bg-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  function syncSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  syncSize();
  window.addEventListener('resize', syncSize);

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fs = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    varying vec2 v_texCoord;

    void main() {
      vec2 uv = v_texCoord;
      vec2 m = u_mouse / u_resolution;
      
      float t = u_time * 0.15;
      vec2 p = uv * 3.2;
      
      for(int i=1; i<4; i++) {
        float fi = float(i);
        p.x += 0.4 / fi * sin(fi * p.y + t + m.x * 1.8);
        p.y += 0.4 / fi * cos(fi * p.x + t + m.y * 1.8);
      }
      
      // Color palette: deep dark slates with electric teal accents
      vec3 color1 = vec3(0.04, 0.05, 0.06); // Deep midnight
      vec3 color2 = vec3(0.06, 0.08, 0.10); // Dark slate
      vec3 accent = vec3(0.12, 0.88, 0.78);  // Electric teal
      
      float noise = 0.5 + 0.5 * sin(p.x + p.y);
      vec3 finalColor = mix(color1, color2, noise);
      finalColor += accent * pow(noise, 12.0) * 0.25; // Glow peaks
      
      // Vignette
      float dist = distance(uv, vec2(0.5));
      finalColor *= 1.0 - dist * 0.45;
      
      gl_FragColor = vec4(finalColor, 0.9);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = canvas.height - e.clientY;
  });

  let startTime = performance.now();
  let animId;

  function render() {
    animId = requestAnimationFrame(render);
    gl.viewport(0, 0, canvas.width, canvas.height);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const elapsed = (performance.now() - startTime) * 0.001;
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  render();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', syncSize);
  };
}
