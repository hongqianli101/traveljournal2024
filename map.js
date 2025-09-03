/* ---------- Screen size detection ---------- */
let smallMedia = window.matchMedia("(max-width: 600px)").matches;

/* ---------- Deck.gl layers ---------- */
const { MapboxLayer } = deck;
let scatterplotLayer = null;
let arcLayer = null;

/* ---------- Alignments for story ---------- */
const alignments = { left: "lefty", center: "centered", right: "righty", full: "fully" };

/* ---------- Utility: hex -> rgb ---------- */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
}

/* ---------- Arc color combos ---------- */
const colorCombos = [
  { source: hexToRgb("#EAEAFF"), target: hexToRgb("#484FFB") },
  { source: hexToRgb("#F7684E"), target: hexToRgb("#FFD9D3") },
];
function getRandomColorCombo() {
  return colorCombos[Math.floor(Math.random() * colorCombos.length)];
}

/* ---------- Route definitions ---------- */
const routeDefinitions = {
  "brooklynView": {
    startPoint: [-74.009, 40.73929], // Little Island
    endPoint: [-74.00265729788222, 40.75359288448384], // High Line/Vessel area 40.753979288448384, -74.00265729788222
    startZoom: 16,
    endZoom: 18,
    startPitch: 60,
    endPitch: 80,
    startBearing: 80,
    endBearing: 120
  },
  "walliamsburg": {
    startPoint: [-73.95091299420689, 40.72392275101301], // Williamsburg start 40.72392275101301, -73.95091299420689
    endPoint: [-73.9670272720601, 40.716778370973536], // Domino Park
    startZoom: 15,
    endZoom: 16.5,
    startPitch: 50,
    endPitch: 70,
    startBearing: 80,
    endBearing: 120
  },
  "brooklynbrg": {
    startPoint: [-73.98956310137292, 40.70317490115295], // DUMBO
    endPoint: [-73.99927238020165, 40.70386660489816], // Brooklyn Bridge Park 40.70386660489816, -73.99927238020165
    startZoom: 16.5,
    endZoom: 17.6,
    startPitch: 80,
    endPitch: 95,
    startBearing: 180,
    endBearing: -50
  }
};

/* ---------- Current state tracking ---------- */
let currentChapter = null;
let isAnimatingRoute = false;

/* ---------- Interpolation utility ---------- */
function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function lerpArray(startArray, endArray, progress) {
  return startArray.map((start, i) => lerp(start, endArray[i], progress));
}

/* ---------- Smooth route animation ---------- */
function animateToRouteProgress(chapterId, progress) {
  const route = routeDefinitions[chapterId];
  if (!route || isAnimatingRoute) return;

  // Clamp progress between 0 and 1
  progress = Math.max(0, Math.min(1, progress));

  // Apply easing function for smoother movement
  const easedProgress = progress < 0.5 
    ? 2 * progress * progress 
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const currentCenter = lerpArray(route.startPoint, route.endPoint, easedProgress);
  const currentZoom = lerp(route.startZoom, route.endZoom, easedProgress);
  const currentPitch = lerp(route.startPitch, route.endPitch, easedProgress);
  const currentBearing = lerp(route.startBearing, route.endBearing, easedProgress);

  const location = {
    center: currentCenter,
    zoom: smallMedia ? Math.max(currentZoom - 1, 9) : currentZoom,
    pitch: currentPitch,
    bearing: currentBearing
  };

  map.jumpTo(location);
}

/* ---------- Build story DOM ---------- */
const story = document.getElementById("story");
const features = document.createElement("div");
const header = document.createElement("div");
features.setAttribute("id", "features");

function addHeaderBlock(html) {
  const el = document.createElement("div");
  el.innerHTML = html;
  header.appendChild(el);
}

if (config.topTitle) addHeaderBlock(config.topTitle);
if (config.title) addHeaderBlock(config.title);
if (config.subtitle) addHeaderBlock(config.subtitle);
if (config.byline) addHeaderBlock(config.byline);
if (config.description) addHeaderBlock(config.description);

if (header.innerText.length > 0) {
  header.classList.add(config.theme);
  header.setAttribute("id", "header");
  story.appendChild(header);
}

config.chapters.forEach((record, idx) => {
  const container = document.createElement("div");
  const chapter = document.createElement("div");

  chapter.classList.add("br3");
  chapter.innerHTML = record.chapterDiv;

  container.setAttribute("id", record.id);
  container.classList.add("step");
  if (idx === 0) container.classList.add("active");

  chapter.classList.add(config.theme);
  container.appendChild(chapter);

  container.classList.add(alignments[record.alignment] || "centered");
  if (record.hidden) container.classList.add("hidden");

  features.appendChild(container);
});
story.appendChild(features);

const footer = document.createElement("div");
if (config.footer) {
  const footerText = document.createElement("p");
  footerText.innerHTML = config.footer;
  footer.appendChild(footerText);
}
if (footer.innerText.length > 0) {
  footer.classList.add(config.theme);
  footer.setAttribute("id", "footer");
  story.appendChild(footer);
}

/* ---------- Mapbox init ---------- */
mapboxgl.accessToken = config.accessToken;
const transformRequest = (url) => {
  const hasQuery = url.indexOf("?") !== -1;
  const suffix = hasQuery ? "&pluginName=scrollytellingV2" : "?pluginName=scrollytellingV2";
  return { url: url + suffix };
};

const startingZoom = smallMedia
  ? config.chapters[0].location.zoomSmall
  : config.chapters[0].location.zoom;

const map = new mapboxgl.Map({
  container: "map",
  style: config.style,
  center: config.chapters[0].location.center,
  zoom: startingZoom,
  bearing: config.chapters[0].location.bearing,
  pitch: config.chapters[0].location.pitch,
  interactive: false,
  transformRequest
});

/* ---------- Chapter callbacks to toggle layers ---------- */
window.showScatterOnly = function () {
  if (scatterplotLayer) scatterplotLayer.setProps({ visible: true });
  if (arcLayer) arcLayer.setProps({ visible: false });
};
window.showBothLayers = function () {
  if (scatterplotLayer) scatterplotLayer.setProps({ visible: true });
  if (arcLayer) arcLayer.setProps({ visible: true });
};
window.hideAllLayers = function () {
  if (scatterplotLayer) scatterplotLayer.setProps({ visible: false });
  if (arcLayer) arcLayer.setProps({ visible: false });
};

/* ---------- Scrollama ---------- */
const scroller = scrollama();

/* ---------- Optional: strip symbol layers ---------- */
map.on("style.load", () => {
  const layers = map.getStyle().layers || [];
  layers.forEach((layer) => {
    if (layer.type === "symbol") {
      map.removeLayer(layer.id);
    }
  });
});

/* ========== DOM 覆盖层：白色高亮圈 + 圈外文字（永远在最上层） ========== */
let htmlOverlay, circleEls, labelEls;
const htmlCirclesData = [
  { lngLat: [-73.96329216815886, 40.77961293761851], title: 'The MET' },
  { lngLat: [-73.9845400193556, 40.754223553591686], title: 'Midtown' },
  { lngLat: [-73.99714137769051, 40.715764507671516], title: 'Lower Manhattan' }
];

function ensureHtmlOverlay() {
  if (document.getElementById('html-circles-overlay')) return;
  htmlOverlay = document.createElement('div');
  htmlOverlay.id = 'html-circles-overlay';
  htmlOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999; /* 高于地图与 deck.gl */
    opacity: 0;    /* 初始隐藏，由章节控制 */
  `;
  document.body.appendChild(htmlOverlay);

  circleEls = [];
  labelEls  = [];

  htmlCirclesData.forEach((d, i) => {
    // 圆圈
    const circle = document.createElement('div');
    circle.id = `html-circle-${i}`;
    circle.style.cssText = `
      position: absolute;
      width: 150px; height: 150px; 
      border: 1.5px solid #fff;
      border-radius: 50%;
      background: transparent;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 8px rgba(255,255,255,0.6);
    `;
    htmlOverlay.appendChild(circle);
    circleEls.push(circle);

    // 圈外文字（在圆圈上方）
    const label = document.createElement('div');
    label.id = `html-label-${i}`;
    label.textContent = d.title;
    label.style.cssText = `
      position: absolute;
      transform: translate(-50%, -100%);   /* 水平居中 & 顶部对齐 */
      white-space: nowrap;
      color: #fff;
      font-weight: 600;
      font-family: "Space Mono", monospace;
      text-shadow: 0 1px 1px rgba(0,0,0,.6);
      pointer-events: none;
      padding: 0;  
    `;
    htmlOverlay.appendChild(label);
    labelEls.push(label);
  });
}

// 固定圈大小（想更大/更小改这里）
function circleSizeForZoom(z) {
  return 150; // px
}

function updateHtmlCircles() {
  if (!circleEls || !labelEls) return;
  const z = map.getZoom();
  const size = circleSizeForZoom(z);

  // 文字字号与圆圈距离（圈外）
  const fontSize    = Math.max(10, Math.min(16, Math.round(size / 7)));
  const verticalGap = Math.round(size / 2 + 8); // 文字在圆圈上方再留 10px 缓冲

  htmlCirclesData.forEach((d, i) => {
    const p = map.project(d.lngLat);

    // 圆圈
    const circle = circleEls[i];
    circle.style.left   = `${p.x}px`;
    circle.style.top    = `${p.y}px`;
    circle.style.width  = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.borderWidth = `2px`; // 描边粗细

    // 文字（圈外上方）
    const label = labelEls[i];
    label.style.left     = `${p.x}px`;
    label.style.top      = `${p.y - verticalGap}px`;
    label.style.fontSize = `${fontSize}px`;
    label.style.letterSpacing = '0.3px';
  });
}

// 对外暴露：显示/隐藏（圈+文字一起）
window.__showHtmlCircles = (opacity = 1) => {
  if (!htmlOverlay) return;
  htmlOverlay.style.opacity = String(Math.max(0, Math.min(1, Number(opacity))));
};

/* ---------- Main load ---------- */
map.on("load", function () {
  console.log("Map style loaded successfully.");
  map.setFog(null);

  // 初始化 DOM 覆盖层（替代 Mapbox circle 图层）
  ensureHtmlOverlay();
  updateHtmlCircles();
  map.on('move', updateHtmlCircles);
  map.on('zoom', updateHtmlCircles);
  map.on('resize', updateHtmlCircles);

  /* 载入 deck.gl 图层（不会影响 DOM 覆盖层） */
  const scatterPromise = axios.get("image_data.json")
    .then(({ data }) => {
      scatterplotLayer = new MapboxLayer({
        id: "scatterplot-layer",
        type: deck.ScatterplotLayer,
        data,
        getPosition: d => d.coordinates,
        getRadius: 0,
        radiusUnits: 'pixels',
        radiusMinPixels: 0,
        getFillColor: hexToRgb("#ffffff").concat(200),
        pickable: true,
        visible: true
      });
      map.addLayer(scatterplotLayer);
      console.log("Scatterplot layer added successfully.");
    })
    .catch((err) => console.error("Error fetching scatterplot data:", err));

  const arcPromise = axios.get("filtered_columbia_jersey_dist20km.json")
    .then(({ data }) => {
      arcLayer = new MapboxLayer({
        id: "arc-layer",
        type: deck.ArcLayer,
        data,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.destination,
        getWidth: 1.0,
        widthUnits: 'pixels',
        getSourceColor: d => { const c = getRandomColorCombo(); return [...c.source, 190]; },
        getTargetColor: d => { const c = getRandomColorCombo(); return [...c.target, 190]; },
        visible: false
      });
      map.addLayer(arcLayer);
      console.log("Arc layer added successfully.");

      if (config.chapters[0].callback && typeof window[config.chapters[0].callback] === 'function') {
        window[config.chapters[0].callback]();
      }
    })
    .catch((err) => console.error("Error fetching arc data:", err));

  // Scrollama setup with progress tracking
  scroller
    .setup({ step: ".step", offset: 0.75, progress: true })
    .onStepEnter((response) => {
      const chapter = config.chapters.find(chap => chap.id === response.element.id);
      response.element.classList.add("active");
      currentChapter = response.element.id;

      // 对于路线章节，移动到起点
      if (routeDefinitions[currentChapter]) {
        const route = routeDefinitions[currentChapter];
        const thisZoom = smallMedia ? route.startZoom - 1 : route.startZoom;
        
        isAnimatingRoute = true;
        map.flyTo({
          center: route.startPoint,
          zoom: thisZoom,
          pitch: route.startPitch,
          bearing: route.startBearing,
          duration: 1000
        });
        
        setTimeout(() => {
          isAnimatingRoute = false;
        }, 1000);
      } else {
        // 非路线章节，使用原有逻辑
        const thisZoom = smallMedia ? chapter.location.zoomSmall : chapter.location.zoom;
        const thisLocation = {
          bearing: chapter.location.bearing,
          center: chapter.location.center,
          pitch: chapter.location.pitch,
          zoom: thisZoom
        };
        map[chapter.mapAnimation || "flyTo"](thisLocation);
      }

      if (chapter.callback && typeof window[chapter.callback] === 'function') {
        window[chapter.callback]();
      }

      // DOM 覆盖层控制显示/隐藏
      if (Array.isArray(chapter.onChapterEnter) && chapter.onChapterEnter.length > 0) {
        chapter.onChapterEnter.forEach(layerConfig => {
          if (layerConfig.layer === 'highlight-circles') {
            window.__showHtmlCircles(layerConfig.opacity ?? 1);
            updateHtmlCircles();
          }
        });
      }

      // 非路线章节才执行旋转动画
      if (chapter.rotateAnimation && !routeDefinitions[currentChapter]) {
        map.once("moveend", function () {
          map.stop();
          const rotateNumber = map.getBearing();
          map.rotateTo(rotateNumber + 90, { duration: 24000, easing: t => t });
        });
      }
    })
    .onStepExit((response) => {
      const chapter = config.chapters.find(chap => chap.id === response.element.id);
      response.element.classList.remove("active");

      if (Array.isArray(chapter.onChapterExit) && chapter.onChapterExit.length > 0) {
        chapter.onChapterExit.forEach(layerConfig => {
          if (layerConfig.layer === 'highlight-circles') {
            window.__showHtmlCircles(layerConfig.opacity ?? 0);
          }
        });
      }
    })
    .onStepProgress((response) => {
      // 只在路线章节中处理进度事件
      if (currentChapter && routeDefinitions[currentChapter] && !isAnimatingRoute) {
        animateToRouteProgress(currentChapter, response.progress);
      }
    });
});

/* ---------- Resize ---------- */
window.addEventListener("resize", () => {
  scroller.resize?.();
  updateHtmlCircles();
  smallMedia = window.matchMedia("(max-width: 600px)").matches;
});