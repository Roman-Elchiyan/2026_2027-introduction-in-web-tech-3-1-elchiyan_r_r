(() => {
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  // Символы и текст
  const asianSymbols =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノ" +
    "ハヒフヘホマミムメモヤユヨラリルレロワヲン" +
    "ァィゥェォッャュョヮヰヱヴヵヶ" +
    "ぁあぃいぅうぇえぉおかがきぎくぐけげこご" +
    "さざしじすずせぜそぞただちぢっつづてでとど" +
    "なにぬねのはばぱひびぴふぶぷへべぺほぼぽ" +
    "まみむめもやゃゆゅよょらりるれろわをん" +
    "零壱弐参四伍六七八九天地人月火水木金土" +
    "東京未来電脳情報機械夢現時空光闇雨風";

  const utilitySymbols =
    "0123456789" +
    "{}[]<>/\\|+-=*#@$%&?!" +
    "¦:;.,_^~" +
    "│┃┆┇┊┋┌┐└┘├┤┬┴┼";

  const techWords = [
    "Docker",
    "Git",
    "Excel",
    "1C",
    "CI/CD",
    "ITMO",
    "MkDocs",
    "Python"
  ];

  const kaomoji = [
    "ಠ_ಠ",
    "(•‿•)",
    "(¬‿¬)",
    "(^_^)",
    "(-_-)",
    "(>_<)",
    "(o_O)",
    "(T_T)",
    "(・_・)",
    "(ᵔᴥᵔ)"
  ];

  const sushiRecipes = [
    "рис промыть до прозрачной воды сварить остудить добавить рисовый уксус сахар и соль",
    "лист нори положить на макису распределить рис добавить лосось огурец и сливочный сыр",
    "тунец нарезать полосками добавить огурец авокадо рис кунжут и аккуратно свернуть",
    "рис распределить по нори выложить начинку свернуть макису и нарезать ролл острым ножом",
    "лосось авокадо огурец сливочный сыр завернуть в нори и посыпать кунжутом",
    "смочить нож водой нарезать ролл на восемь частей добавить имбирь васаби и соевый соус",
    "рисовый уксус смешать с сахаром и солью добавить в теплый рис и аккуратно перемешать",
    "лист нори положить на макису добавить рис начинку завернуть и слегка прижать",
    "для нигири сформировать овальный комочек риса сверху положить тонкий ломтик лосося или тунца",
    "для ролла филадельфия распределить рис по нори перевернуть лист добавить сыр лосось и огурец",
    "для калифорнии добавить крабовую начинку авокадо огурец свернуть ролл и обвалять в икре тобико",
    "для спайси ролла смешать тунец с острым соусом добавить огурец завернуть в нори и нарезать",
    "для урамаки накрыть макису пищевой пленкой распределить рис снаружи а начинку положить внутрь",
    "для овощного ролла использовать авокадо огурец сладкий перец и морковь завернуть в рис и нори",
    "для ролла с креветкой подготовить креветку добавить авокадо огурец и сливочный сыр",
    "для гунканов сформировать рис обернуть полоской нори сверху добавить начинку из тунца или лосося",
    "после варки оставить рис под крышкой затем добавить заправку и перемешать не раздавливая зерно",
    "макису накрыть пищевой пленкой выложить нори рис и начинку затем плотно свернуть ролл",
    "для темпура ролла подготовить начинку свернуть ролл обмакнуть в кляр быстро обжарить и нарезать",
    "перед нарезкой смочить острый нож водой и очищать лезвие чтобы кусочки оставались ровными"
  ];

  // Основные настройки
  const tuning = {
    // 0 = использовать DPR монитора без ограничения
    maxDpr: 1.5,

    // Готовая стартовая сцена создаётся offline и не проходит повторное
    // размещение через choosePrewarmPosition() при загрузке страницы.
    startupSceneUrl:
      new URL("../data/startup_scene.json", document.currentScript?.src || new URL("assets/javascripts/matrix.js", document.baseURI)).href,
    startupLogicDelay: 0.85,

    asianSymbolChance: 0.88,

    // Скорость потока. На появление и заполненность она не влияет.
    speedBase: 28,
    speedDepth: 26,
    speedRandom: 12,

    // Сколько потоков система старается держать.
    targetMatrixMin: 72,
    targetMatrixMax: 84,
    matrixMaxCount: 94,

    targetRecipeMin: 9,
    targetRecipeMax: 12,
    recipeMaxCount: 14,

    // Скорость печати рецептов: больше = медленнее.
    recipeDelayMin: 0.14,
    recipeDelayMax: 0.22,

    // Карта заполненности. Это только датчики, а не дорожки.
    coverageColumns: 8,
    coverageRows: 5,
    coverageCheckInterval: 0.25,
    coverageCellTarget: 1.60,
    coverageEmptyThreshold: 0.42,
    coverageTopRows: 3,
    coverageSpawnBoost: 0.30,

    // Разные стадии жизни потока.
    phaseBands: 6,
    phaseTargetRefreshMin: 4.5,
    phaseTargetRefreshMax: 8.0,
    phaseWeightMin: 0.72,
    phaseWeightMax: 1.28,
    phaseTolerance: 0.30,

    // Blue-noise-подобное распределение по экрану.
    spawnCandidateAttempts: 40,
    spawnTopChoices: 5,
    universalSpawnDistance: 34,
    crossSizeDistanceFactor: 1.60,
    largeCrossSizeDistance: 98,
    largeFontThreshold: 22,

    boundsPaddingX: 8,
    boundsPaddingY: 4,
    collisionSegmentRows: 3,

    futureCollisionSeconds: 1.6,
    futureCollisionSteps: 4,

    finalPlacementAttempts: 3,

    localAvoidanceOffsets: [
      -70,
      -40,
      -20,
      20,
      40,
      70
    ],

    localAvoidanceChecks: 3,
    topPlacementDelayRetries: 4,
    topPlacementDelayStepMin: 0.16,
    topPlacementDelayStepMax: 0.48,
    spawnRetryDelayMin: 0.10,
    spawnRetryDelayMax: 0.24,

    similarSizeFactor: 0.34,
    similarDepthDistance: 0.25,
    similarSpawnDistance: 66,
    recentSpawnHold: 2.8,

    // Не даём головам выстраиваться в заметные горизонтальные ряды.
    rowProtectionY: 58,
    rowProtectionCount: 2,
    rowDelayMin: 0.12,
    rowDelayMax: 0.52,
    rowDelayAttempts: 6,

    // Временной blue-noise: случайно, но без залпов и огромных пауз.
    matrixDelayMin: 0.13,
    matrixDelayMax: 0.82,
    recipeDelaySpawnMin: 0.75,
    recipeDelaySpawnMax: 2.35,
    temporalCandidateAttempts: 12,
    temporalHistory: 6,

    // Слова и каомодзи.
    longTokenCooldownMin: 4,
    longTokenCooldownMax: 7,
    globalLongTokenPauseMin: 360,
    globalLongTokenPauseMax: 680,

    // Возврат во вкладку.
    returnRegenerateRatio: 0.80,
    returnRecipeRegenerateRatio: 0.80,
    returnMinHiddenSeconds: 0.35,
    returnMinXShift: 80,
    returnMinYShift: 120,

    // Оптимизация.
    offscreenPadding: 28
  };

  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  let streams = [];
  let recipeStreams = [];

  let targetMatrixCount = 0;
  let targetRecipeCount = 0;

  let previousTime = 0;
  let animationId = null;
  let animationPaused = false;
  let pageHiddenAt = null;

  let matrixSpawnTimer = 0;
  let recipeSpawnTimer = 0;
  let coverageTimer = 0;
  let phaseRefreshTimer = 0;
  let coveragePressure = 0;
  let phasePressure = 0;

  let matrixPhaseTargets = [];
  let recipePhaseTargets = [];
  let occupancyGrid = [];

  let nextStreamId = 1;

  const recentSpawns = [];
  const recentGlobalLongTokens = [];
  const recentRecipes = [];
  const recentMatrixDelays = [];
  const recentRecipeDelays = [];

  let globalLongTokenBlockedUntil = 0;
  let normalLogicStartsAt = 0;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, maxInclusive) {
    return Math.floor(random(min, maxInclusive + 1));
  }

  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array;
  }

  function randomSymbol() {
    const source =
      Math.random() < tuning.asianSymbolChance
        ? asianSymbols
        : utilitySymbols;

    return source[Math.floor(Math.random() * source.length)];
  }

  function pickRecipeText() {
    let source = randomItem(sushiRecipes);

    for (
      let attempt = 0;
      attempt < 12 && recentRecipes.includes(source);
      attempt += 1
    ) {
      source = randomItem(sushiRecipes);
    }

    recentRecipes.unshift(source);

    if (recentRecipes.length > 5) {
      recentRecipes.pop();
    }

    return source.replaceAll(" ", "・");
  }

  function randomMatrixToken() {
    const roll = Math.random();

    if (roll < 0.90) return randomSymbol();
    if (roll < 0.95) return randomItem(techWords);
    return randomItem(kaomoji);
  }

  function warmMatrixToken(stream) {
    if (stream.wordCooldown > 0) {
      stream.wordCooldown -= 1;
      return randomSymbol();
    }

    let token = randomMatrixToken();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const isLong = String(token).length > 1;
      const repeated =
        token === stream.head ||
        token === stream.lastToken ||
        (isLong && stream.recentLongTokens.includes(token));

      if (!repeated) break;
      token = randomMatrixToken();
    }

    if (String(token).length > 1) {
      stream.recentLongTokens.unshift(token);

      if (stream.recentLongTokens.length > 4) {
        stream.recentLongTokens.pop();
      }

      stream.wordCooldown = randomInt(
        tuning.longTokenCooldownMin,
        tuning.longTokenCooldownMax
      );
    }

    stream.lastToken = token;
    return token;
  }

  function nextMatrixToken(stream) {
    function singleToken() {
      let token = randomSymbol();

      for (
        let attempt = 0;
        attempt < 8 &&
        (token === stream.head || token === stream.lastToken);
        attempt += 1
      ) {
        token = randomSymbol();
      }

      stream.lastToken = token;
      return token;
    }

    if (stream.wordCooldown > 0) {
      stream.wordCooldown -= 1;
      return singleToken();
    }

    const now = performance.now();
    let token = randomMatrixToken();

    for (let attempt = 0; attempt < 14; attempt += 1) {
      const isLong = String(token).length > 1;

      const repeated =
        token === stream.head ||
        token === stream.lastToken ||
        (isLong && stream.recentLongTokens.includes(token)) ||
        (isLong && recentGlobalLongTokens.includes(token));

      const blocked =
        isLong && now < globalLongTokenBlockedUntil;

      if (!repeated && !blocked) break;
      token = randomMatrixToken();
    }

    const isLong = String(token).length > 1;

    if (isLong && now < globalLongTokenBlockedUntil) {
      return singleToken();
    }

    if (isLong) {
      stream.recentLongTokens.unshift(token);

      if (stream.recentLongTokens.length > 4) {
        stream.recentLongTokens.pop();
      }

      recentGlobalLongTokens.unshift(token);

      if (recentGlobalLongTokens.length > 8) {
        recentGlobalLongTokens.pop();
      }

      stream.wordCooldown = randomInt(
        tuning.longTokenCooldownMin,
        tuning.longTokenCooldownMax
      );

      globalLongTokenBlockedUntil =
        now +
        random(
          tuning.globalLongTokenPauseMin,
          tuning.globalLongTokenPauseMax
        );
    }

    stream.lastToken = token;
    return token;
  }

  function rememberDelay(history, value) {
    history.unshift(value);

    if (history.length > tuning.temporalHistory) {
      history.pop();
    }
  }

  function blueNoiseDelay(kind) {
    const isRecipe = kind === "recipe";
    const history = isRecipe
      ? recentRecipeDelays
      : recentMatrixDelays;

    const minDelay = isRecipe
      ? tuning.recipeDelaySpawnMin
      : tuning.matrixDelayMin;

    const maxDelay = isRecipe
      ? tuning.recipeDelaySpawnMax
      : tuning.matrixDelayMax;

    const span = maxDelay - minDelay;
    const candidates = [];

    for (
      let attempt = 0;
      attempt < tuning.temporalCandidateAttempts;
      attempt += 1
    ) {
      const candidate = random(minDelay, maxDelay);

      let nearest = span;

      for (const previous of history) {
        nearest = Math.min(
          nearest,
          Math.abs(previous - candidate)
        );
      }

      const center =
        minDelay + span * random(0.38, 0.62);

      const centerPenalty =
        Math.abs(candidate - center) / span;

      const score =
        nearest / Math.max(0.001, span) +
        Math.random() * 0.42 -
        centerPenalty * 0.10;

      candidates.push({
        value: candidate,
        score
      });
    }

    candidates.sort((a, b) => b.score - a.score);

    const choiceCount =
      Math.min(4, candidates.length);

    const chosen =
      candidates[
        Math.floor(Math.random() * choiceCount)
      ].value;

    rememberDelay(history, chosen);

    return chosen;
  }

  function cleanupRecentSpawns(nowSeconds) {
    let write = 0;

    for (let read = 0; read < recentSpawns.length; read += 1) {
      const item = recentSpawns[read];

      if (item.until > nowSeconds) {
        recentSpawns[write] = item;
        write += 1;
      }
    }

    recentSpawns.length = write;
  }

  function streamVerticalRange(stream) {
    return {
      top:
        stream.y -
        stream.glyphs.length *
          stream.lineHeight,

      bottom:
        stream.y +
        stream.lineHeight
    };
  }

  function streamVelocity(stream) {
    if (stream.kind === "recipe") {
      return stream.lineHeight /
        Math.max(0.001, stream.typingDelay);
    }

    return stream.speed;
  }

  function safeDistanceBetween(a, b) {
    let safe = Math.max(
      tuning.universalSpawnDistance,
      Math.max(a.fontSize, b.fontSize) *
        tuning.crossSizeDistanceFactor
    );

    if (
      a.fontSize >= tuning.largeFontThreshold ||
      b.fontSize >= tuning.largeFontThreshold
    ) {
      safe = Math.max(
        safe,
        tuning.largeCrossSizeDistance
      );
    }

    const similarSize =
      Math.abs(a.fontSize - b.fontSize) <
      Math.max(
        6,
        Math.max(a.fontSize, b.fontSize) *
          tuning.similarSizeFactor
      );

    const similarDepth =
      Math.abs(a.depth - b.depth) <
      tuning.similarDepthDistance;

    if (similarSize && similarDepth) {
      safe = Math.max(
        safe,
        tuning.similarSpawnDistance
      );
    }

    return safe;
  }

  function createMatrixCore(traits = null) {
    const depth =
      traits?.depth ??
      Math.pow(Math.random(), 1.20);

    const fontSize =
      traits?.fontSize ??
      random(11.5, 30.5);

    const lineHeight =
      traits?.lineHeight ??
      fontSize * 1.08;

    const speed =
      traits?.speed ??
      (
        tuning.speedBase +
        depth * tuning.speedDepth +
        Math.random() * tuning.speedRandom
      );

    const tailLength =
      traits?.tailLength ??
      Math.floor(
        11 +
        depth * 19 +
        Math.random() * 9
      );

    const stream = {
      id: nextStreamId++,
      kind: "matrix",
      dead: false,

      x: 0,
      y: 0,

      depth,
      fontSize,
      lineHeight,
      speed,

      opacity:
        traits?.opacity ??
        (0.12 + depth * 0.5),

      tailLength,

      startDelay: 0,
      stepTimer: 0,

      head: randomSymbol(),
      glyphs: [],

      wordCooldown: 0,
      recentLongTokens: [],
      lastToken: null,

      font: `${fontSize}px Consolas, monospace`,
      tailGreen:
        Math.round(145 + depth * 100)
    };

    return stream;
  }

  function createRecipeCore(traits = null) {
    const depth =
      traits?.depth ??
      random(0.25, 0.82);

    const fontSize =
      traits?.fontSize ??
      random(14, 20.5);

    const lineHeight =
      traits?.lineHeight ??
      fontSize * 0.94;

    const tailLength =
      traits?.tailLength ??
      Math.floor(random(62, 88));

    const text =
      traits?.text ??
      pickRecipeText();

    return {
      id: nextStreamId++,
      kind: "recipe",
      dead: false,

      x: 0,
      y: 0,

      depth,
      fontSize,
      lineHeight,

      opacity:
        traits?.opacity ??
        random(0.32, 0.50),

      tailLength,

      startDelay: 0,
      stepTimer: 0,

      text,
      textIndex: 0,
      head: text[0],
      glyphs: [],

      typingDelay:
        random(
          tuning.recipeDelayMin,
          tuning.recipeDelayMax
        ),

      font:
        `${fontSize}px Consolas, monospace`
    };
  }

  function matrixTraitsFrom(stream) {
    return {
      depth: stream.depth,
      fontSize: stream.fontSize,
      lineHeight: stream.lineHeight,
      speed: stream.speed,
      opacity: stream.opacity,
      tailLength: stream.tailLength
    };
  }

  function recipeTraitsFrom(stream) {
    return {
      depth: stream.depth,
      fontSize: stream.fontSize,
      lineHeight: stream.lineHeight,
      opacity: stream.opacity,
      tailLength: stream.tailLength,
      text: stream.text
    };
  }

  function buildRandomPhaseTargets(count) {
    const bands = tuning.phaseBands;
    const minimum =
      Math.max(
        1,
        Math.floor(
          count /
          bands *
          (1 - tuning.phaseTolerance)
        )
      );

    const weights = [];
    let weightTotal = 0;

    for (let i = 0; i < bands; i += 1) {
      const weight = random(
        tuning.phaseWeightMin,
        tuning.phaseWeightMax
      );

      weights.push(weight);
      weightTotal += weight;
    }

    const targets =
      new Array(bands).fill(minimum);

    let remaining =
      Math.max(
        0,
        count - minimum * bands
      );

    while (remaining > 0) {
      let roll = Math.random() * weightTotal;
      let chosen = 0;

      for (let i = 0; i < bands; i += 1) {
        roll -= weights[i];

        if (roll <= 0) {
          chosen = i;
          break;
        }
      }

      targets[chosen] += 1;
      remaining -= 1;
    }

    return targets;
  }

  function phaseSequence(targets) {
    const result = [];

    for (let band = 0; band < targets.length; band += 1) {
      for (let i = 0; i < targets[band]; i += 1) {
        result.push(band);
      }
    }

    return shuffle(result);
  }

  function phaseValueForBand(band) {
    const bands = tuning.phaseBands;

    return clamp(
      (
        band +
        random(0.08, 0.92)
      ) /
      bands,
      0.01,
      0.99
    );
  }

  function matrixPhase(stream) {
    const start =
      -stream.lineHeight * 1.2;

    const end =
      height +
      stream.tailLength *
        stream.lineHeight;

    return clamp(
      (stream.y - start) /
        Math.max(1, end - start),
      0,
      0.999
    );
  }

  function recipePhase(stream) {
    const start =
      -stream.lineHeight * 1.2;

    const end =
      height +
      stream.tailLength *
        stream.lineHeight;

    return clamp(
      (stream.y - start) /
        Math.max(1, end - start),
      0,
      0.999
    );
  }

  function phaseBandFor(stream) {
    const phase =
      stream.kind === "recipe"
        ? recipePhase(stream)
        : matrixPhase(stream);

    return Math.min(
      tuning.phaseBands - 1,
      Math.floor(
        phase * tuning.phaseBands
      )
    );
  }

  function warmMatrixToPhase(stream, phase) {
    const start =
      -stream.lineHeight * 1.2;

    const end =
      height +
      stream.tailLength *
        stream.lineHeight;

    stream.y =
      start +
      phase * (end - start);

    const steps =
      clamp(
        Math.floor(
          (stream.y - start) /
          stream.lineHeight
        ),
        0,
        stream.tailLength
      );

    stream.glyphs.length = 0;
    stream.head = randomSymbol();
    stream.wordCooldown = 0;
    stream.recentLongTokens.length = 0;
    stream.lastToken = null;

    for (let i = 0; i < steps; i += 1) {
      stream.glyphs.unshift(stream.head);
      stream.head = warmMatrixToken(stream);
    }

    stream.stepTimer =
      random(
        0,
        stream.lineHeight /
          stream.speed
      );

    stream.startDelay = 0;
    stream.dead = false;

    refreshStreamVisualWidth(
      stream
    );
  }

  function warmRecipeToPhase(stream, phase) {
    const start =
      -stream.lineHeight * 1.2;

    const end =
      height +
      stream.tailLength *
        stream.lineHeight;

    stream.y =
      start +
      phase * (end - start);

    const steps =
      clamp(
        Math.floor(
          (stream.y - start) /
          stream.lineHeight
        ),
        0,
        stream.tailLength
      );

    stream.glyphs.length = 0;

    stream.textIndex =
      randomInt(
        0,
        Math.max(
          0,
          stream.text.length - 1
        )
      );

    stream.head =
      stream.text[stream.textIndex];

    for (let i = 0; i < steps; i += 1) {
      stream.glyphs.unshift(stream.head);

      stream.textIndex += 1;

      if (
        stream.textIndex >=
        stream.text.length
      ) {
        stream.textIndex = 0;
      }

      stream.head =
        stream.text[stream.textIndex];
    }

    stream.stepTimer =
      random(
        0,
        stream.typingDelay
      );

    stream.startDelay = 0;
    stream.dead = false;

    refreshStreamVisualWidth(
      stream
    );
  }

  function occupancyIndex(column, row) {
    return (
      row *
      tuning.coverageColumns +
      column
    );
  }

  function buildOccupancy(
    matrixCollection = streams,
    recipeCollection = recipeStreams
  ) {
    const size =
      tuning.coverageColumns *
      tuning.coverageRows;

    if (
      occupancyGrid.length !==
      size
    ) {
      occupancyGrid =
        new Array(
          size
        ).fill(0);
    } else {
      occupancyGrid.fill(0);
    }

    function addCollection(
      collection
    ) {
      for (
        const stream of
        collection
      ) {
        if (
          stream.dead ||
          stream.startDelay > 0
        ) {
          continue;
        }

        const cells =
          gridCellsForSegments(
            currentCollisionSegments(
              stream
            )
          );

        if (
          cells.size === 0
        ) {
          continue;
        }

        const weight =
          0.62 +
          Math.min(
            0.85,
            stream.fontSize / 34
          ) * 0.48;

        for (
          const index of cells
        ) {
          occupancyGrid[index] +=
            weight;
        }
      }
    }

    addCollection(
      matrixCollection
    );

    addCollection(
      recipeCollection
    );

    return occupancyGrid;
  }

  function cellValueForPoint(x, y) {
    const column =
      clamp(
        Math.floor(
          x /
          Math.max(1, width) *
          tuning.coverageColumns
        ),
        0,
        tuning.coverageColumns - 1
      );

    const row =
      clamp(
        Math.floor(
          y /
          Math.max(1, height) *
          tuning.coverageRows
        ),
        0,
        tuning.coverageRows - 1
      );

    return occupancyGrid[
      occupancyIndex(
        column,
        row
      )
    ] || 0;
  }

  const tokenWidthCache = new Map();

  function measureTokenWidth(
    stream,
    token
  ) {
    const text =
      String(token ?? "");

    const key =
      stream.font +
      "|" +
      text;

    const cached =
      tokenWidthCache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    ctx.font =
      stream.font;

    const width =
      ctx.measureText(text).width;

    tokenWidthCache.set(
      key,
      width
    );

    return width;
  }

  function refreshStreamVisualWidth(
    stream
  ) {
    let width =
      Math.max(
        stream.fontSize * 1.12,
        measureTokenWidth(
          stream,
          stream.head
        )
      );

    for (
      const glyph of
      stream.glyphs
    ) {
      width =
        Math.max(
          width,
          measureTokenWidth(
            stream,
            glyph
          )
        );
    }

    stream.visualWidth =
      width;

    return width;
  }

  function tokenWidthAtTailIndex(
    stream,
    index
  ) {
    if (
      index >= 0 &&
      index < stream.glyphs.length
    ) {
      return measureTokenWidth(
        stream,
        stream.glyphs[index]
      );
    }

    return stream.fontSize * 1.12;
  }

  function streamCollisionSegmentsAt(
    stream,
    x,
    y,
    glyphCount
  ) {
    const segments = [];

    const headWidth =
      Math.max(
        stream.fontSize * 1.12,
        measureTokenWidth(
          stream,
          stream.head
        )
      );

    segments.push({
      left:
        x -
        tuning.boundsPaddingX,

      right:
        x +
        headWidth +
        tuning.boundsPaddingX,

      top:
        y -
        tuning.boundsPaddingY,

      bottom:
        y +
        stream.lineHeight +
        tuning.boundsPaddingY
    });

    const count =
      Math.max(
        0,
        Math.min(
          stream.tailLength,
          glyphCount
        )
      );

    const rows =
      Math.max(
        1,
        tuning.collisionSegmentRows
      );

    for (
      let startIndex = 0;
      startIndex < count;
      startIndex += rows
    ) {
      const endIndex =
        Math.min(
          count,
          startIndex + rows
        );

      let widthPx =
        stream.fontSize * 1.12;

      for (
        let index = startIndex;
        index < endIndex;
        index += 1
      ) {
        widthPx =
          Math.max(
            widthPx,
            tokenWidthAtTailIndex(
              stream,
              index
            )
          );
      }

      segments.push({
        left:
          x -
          tuning.boundsPaddingX,

        right:
          x +
          widthPx +
          tuning.boundsPaddingX,

        top:
          y -
          endIndex *
            stream.lineHeight -
          tuning.boundsPaddingY,

        bottom:
          y -
          startIndex *
            stream.lineHeight +
          tuning.boundsPaddingY
      });
    }

    return segments;
  }

  function currentCollisionSegments(
    stream
  ) {
    return streamCollisionSegmentsAt(
      stream,
      stream.x,
      stream.y,
      stream.glyphs.length
    );
  }

  function segmentsEnvelope(
    segments
  ) {
    if (segments.length === 0) {
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
    }

    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;

    for (
      const segment of
      segments
    ) {
      left =
        Math.min(
          left,
          segment.left
        );

      right =
        Math.max(
          right,
          segment.right
        );

      top =
        Math.min(
          top,
          segment.top
        );

      bottom =
        Math.max(
          bottom,
          segment.bottom
        );
    }

    return {
      left,
      right,
      top,
      bottom
    };
  }

  function boxesOverlap(
    a,
    b
  ) {
    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  }

  function segmentSetsOverlap(
    first,
    second
  ) {
    for (
      const a of first
    ) {
      for (
        const b of second
      ) {
        if (
          boxesOverlap(
            a,
            b
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  function predictedCollisionSegments(
    stream,
    seconds
  ) {
    const activeSeconds =
      Math.max(
        0,
        seconds
      );

    const distance =
      streamVelocity(stream) *
      activeSeconds;

    const addedGlyphs =
      Math.floor(
        distance /
        Math.max(
          1,
          stream.lineHeight
        )
      );

    const glyphCount =
      Math.min(
        stream.tailLength,
        stream.glyphs.length +
          addedGlyphs
      );

    return streamCollisionSegmentsAt(
      stream,
      stream.x,
      stream.y + distance,
      glyphCount
    );
  }

  function overlapsAnyStream(
    stream,
    matrixCollection,
    recipeCollection
  ) {
    const candidate =
      currentCollisionSegments(
        stream
      );

    for (
      let group = 0;
      group < 2;
      group += 1
    ) {
      const collection =
        group === 0
          ? matrixCollection
          : recipeCollection;

      for (
        const other of
        collection
      ) {
        if (
          other === stream ||
          other.dead
        ) {
          continue;
        }

        if (
          segmentSetsOverlap(
            candidate,
            currentCollisionSegments(
              other
            )
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  function gridCellsForSegments(
    segments
  ) {
    const cells =
      new Set();

    for (
      const segment of
      segments
    ) {
      if (
        segment.bottom < 0 ||
        segment.top > height ||
        segment.right < 0 ||
        segment.left > width
      ) {
        continue;
      }

      const firstColumn =
        clamp(
          Math.floor(
            segment.left /
            Math.max(
              1,
              width
            ) *
            tuning.coverageColumns
          ),
          0,
          tuning.coverageColumns - 1
        );

      const lastColumn =
        clamp(
          Math.floor(
            segment.right /
            Math.max(
              1,
              width
            ) *
            tuning.coverageColumns
          ),
          0,
          tuning.coverageColumns - 1
        );

      const firstRow =
        clamp(
          Math.floor(
            segment.top /
            Math.max(
              1,
              height
            ) *
            tuning.coverageRows
          ),
          0,
          tuning.coverageRows - 1
        );

      const lastRow =
        clamp(
          Math.floor(
            segment.bottom /
            Math.max(
              1,
              height
            ) *
            tuning.coverageRows
          ),
          0,
          tuning.coverageRows - 1
        );

      for (
        let row = firstRow;
        row <= lastRow;
        row += 1
      ) {
        for (
          let column = firstColumn;
          column <= lastColumn;
          column += 1
        ) {
          cells.add(
            occupancyIndex(
              column,
              row
            )
          );
        }
      }
    }

    return cells;
  }

  function prewarmCoverageScore(
    stream,
    x,
    y,
    glyphCount
  ) {
    const segments =
      streamCollisionSegmentsAt(
        stream,
        x,
        y,
        glyphCount
      );

    const cells =
      gridCellsForSegments(
        segments
      );

    if (
      cells.size === 0
    ) {
      return 0;
    }

    let score = 0;

    for (
      const index of cells
    ) {
      const value =
        occupancyGrid[index] || 0;

      const deficit =
        Math.max(
          0,
          tuning.coverageCellTarget -
            value
        );

      score +=
        deficit * 18;

      if (
        value <=
        tuning.coverageEmptyThreshold
      ) {
        score += 7;
      }
    }

    return (
      score /
      cells.size
    );
  }

  function spatialCandidateScore(
    stream,
    x,
    y,
    glyphCount,
    placedMatrix,
    placedRecipes,
    oldPosition = null
  ) {
    if (oldPosition) {
      if (
        Math.abs(
          x - oldPosition.x
        ) <
          tuning.returnMinXShift ||
        Math.abs(
          y - oldPosition.y
        ) <
          tuning.returnMinYShift
      ) {
        return -Infinity;
      }
    }

    const candidateSegments =
      streamCollisionSegmentsAt(
        stream,
        x,
        y,
        glyphCount
      );

    const candidateBounds =
      segmentsEnvelope(
        candidateSegments
      );

    let score =
      prewarmCoverageScore(
        stream,
        x,
        y,
        glyphCount
      );

    let rowMatches = 0;

    for (
      let group = 0;
      group < 2;
      group += 1
    ) {
      const collection =
        group === 0
          ? placedMatrix
          : placedRecipes;

      for (
        const other of
        collection
      ) {
        if (
          other.dead
        ) {
          continue;
        }

        const otherSegments =
          currentCollisionSegments(
            other
          );

        if (
          segmentSetsOverlap(
            candidateSegments,
            otherSegments
          )
        ) {
          return -Infinity;
        }

        const otherBounds =
          segmentsEnvelope(
            otherSegments
          );

        const horizontalGap =
          Math.max(
            otherBounds.left -
              candidateBounds.right,
            candidateBounds.left -
              otherBounds.right
          );

        if (
          horizontalGap >= 0
        ) {
          score +=
            Math.min(
              20,
              horizontalGap * 0.06
            );
        }

        if (
          Math.abs(
            other.y - y
          ) <
          tuning.rowProtectionY
        ) {
          rowMatches += 1;
        }
      }
    }

    if (
      rowMatches >=
      tuning.rowProtectionCount
    ) {
      score -=
        36 +
        rowMatches * 12;
    }

    score +=
      Math.random() * 12;

    return score;
  }

  function choosePrewarmPosition(
    stream,
    band,
    placedMatrix,
    placedRecipes,
    oldPosition = null
  ) {
    buildOccupancy(
      placedMatrix,
      placedRecipes
    );

    const candidates = [];

    function collect(
      useRequestedBand,
      attempts
    ) {
      const edge =
        Math.max(
          8,
          stream.fontSize * 0.6
        );

      for (
        let attempt = 0;
        attempt < attempts;
        attempt += 1
      ) {
        const phase =
          useRequestedBand
            ? phaseValueForBand(
                band
              )
            : random(
                0.03,
                0.97
              );

        const start =
          -stream.lineHeight *
            1.2;

        const end =
          height +
          stream.tailLength *
            stream.lineHeight;

        const y =
          start +
          phase *
            (end - start);

        const glyphCount =
          clamp(
            Math.floor(
              (y - start) /
              stream.lineHeight
            ),
            0,
            stream.tailLength
          );

        const baseX =
          random(
            edge,
            Math.max(
              edge,
              width -
                edge -
                stream.fontSize *
                  1.2
            )
          );

        const offsets = [0];

        const shuffled =
          [...tuning.localAvoidanceOffsets]
            .sort(() => Math.random() - 0.5);

        for (
          let i = 0;
          i < tuning.localAvoidanceChecks;
          i += 1
        ) {
          offsets.push(shuffled[i]);
        }

        for (const offset of offsets) {
          const x = clamp(
            baseX + offset,
            edge,
            Math.max(
              edge,
              width -
                edge -
                stream.fontSize *
                  1.2
            )
          );

          const score =
            spatialCandidateScore(
              stream,
              x,
              y,
              glyphCount,
              placedMatrix,
              placedRecipes,
              oldPosition
            );

          if (
            Number.isFinite(score)
          ) {
            candidates.push({
              x,
              y,
              phase,
              score
            });
          }
        }
      }
    }

    collect(
      true,
      tuning.spawnCandidateAttempts
    );

    if (
      candidates.length === 0
    ) {
      collect(
        false,
        tuning.spawnCandidateAttempts *
          2
      );
    }

    if (
      candidates.length === 0
    ) {
      return null;
    }

    candidates.sort(
      (a, b) =>
        b.score - a.score
    );

    const usable =
      Math.min(
        3,
        candidates.length
      );

    return candidates[
      Math.floor(
        Math.random() *
        usable
      )
    ];
  }

  function rowConflictAtEntry(
    delay,
    candidateStream
  ) {
    const entryTime =
      delay +
      Math.max(
        0,
        -candidateStream.y
      ) /
      Math.max(
        1,
        streamVelocity(
          candidateStream
        )
      );

    let matches = 0;

    function count(
      collection
    ) {
      for (
        const other of
        collection
      ) {
        if (
          other.dead ||
          other.startDelay >
            entryTime
        ) {
          continue;
        }

        const movingTime =
          Math.max(
            0,
            entryTime -
              other.startDelay
          );

        const futureY =
          other.y +
          streamVelocity(
            other
          ) *
            movingTime;

        if (
          Math.abs(
            futureY
          ) <
          tuning.rowProtectionY
        ) {
          matches += 1;
        }
      }
    }

    count(streams);
    count(recipeStreams);

    return matches;
  }

  function adjustDelayAgainstRows(
    stream,
    initialDelay
  ) {
    let bestDelay =
      initialDelay;

    let bestMatches =
      rowConflictAtEntry(
        bestDelay,
        stream
      );

    for (
      let attempt = 0;
      attempt <
        tuning.rowDelayAttempts &&
      bestMatches >=
        tuning.rowProtectionCount;
      attempt += 1
    ) {
      const candidate =
        initialDelay +
        random(
          tuning.rowDelayMin,
          tuning.rowDelayMax
        );

      const matches =
        rowConflictAtEntry(
          candidate,
          stream
        );

      if (matches < bestMatches) {
        bestMatches = matches;
        bestDelay = candidate;
      }
    }

    return bestDelay;
  }

  function topCandidateScore(
    stream,
    x,
    spawnTime
  ) {
    const now =
      performance.now() / 1000;

    cleanupRecentSpawns(now);

    let score =
      -cellValueForPoint(
        x,
        Math.min(
          height - 1,
          height /
            tuning.coverageRows *
            0.5
        )
      ) * 34;

    for (
      const recent of
      recentSpawns
    ) {
      if (
        Math.abs(
          recent.spawnTime -
          spawnTime
        ) >
        tuning.recentSpawnHold
      ) {
        continue;
      }

      const safe =
        safeDistanceBetween(
          stream,
          recent
        );

      const free =
        Math.abs(
          recent.x - x
        ) - safe;

      if (
        free < 0
      ) {
        score +=
          free * 8;
      } else {
        score +=
          Math.min(
            20,
            free * 0.08
          );
      }
    }

    const initialDelay =
      Math.max(
        0,
        spawnTime - now
      );

    const velocity =
      streamVelocity(
        stream
      );

    const enterDelay =
      initialDelay +
      Math.max(
        0,
        -stream.y
      ) /
      Math.max(
        1,
        velocity
      );

    for (
      let step = 0;
      step <=
        tuning.futureCollisionSteps;
      step += 1
    ) {
      const extraTime =
        tuning.futureCollisionSeconds *
        (
          step /
          Math.max(
            1,
            tuning.futureCollisionSteps
          )
        );

      const seconds =
        enterDelay +
        extraTime;

      const candidateY =
        stream.y +
        velocity *
          seconds;

      const candidateGlyphCount =
        Math.min(
          stream.tailLength,
          Math.max(
            0,
            Math.floor(
              (
                velocity *
                Math.max(
                  0,
                  seconds -
                    initialDelay
                )
              ) /
              Math.max(
                1,
                stream.lineHeight
              )
            )
          )
        );

      const candidateSegments =
        streamCollisionSegmentsAt(
          stream,
          x,
          candidateY,
          candidateGlyphCount
        );

      for (
        let group = 0;
        group < 2;
        group += 1
      ) {
        const collection =
          group === 0
            ? streams
            : recipeStreams;

        for (
          const other of
          collection
        ) {
          if (
            other.dead ||
            other.startDelay >
              seconds
          ) {
            continue;
          }

          const otherSeconds =
            Math.max(
              0,
              seconds -
                other.startDelay
            );

          const otherSegments =
            predictedCollisionSegments(
              other,
              otherSeconds
            );

          if (
            segmentSetsOverlap(
              candidateSegments,
              otherSegments
            )
          ) {
            return -Infinity;
          }
        }
      }
    }

    score +=
      Math.random() * 18;

    return score;
  }

  function chooseTopX(
    stream,
    delay
  ) {
    buildOccupancy();

    const now =
      performance.now() / 1000;

    const edge =
      Math.max(
        8,
        stream.fontSize * 0.6
      );

    let candidateDelay =
      delay;

    for (
      let retry = 0;
      retry <=
        tuning.topPlacementDelayRetries;
      retry += 1
    ) {
      const spawnTime =
        now +
        candidateDelay;

      const candidates = [];

      for (
        let attempt = 0;
        attempt <
          tuning.spawnCandidateAttempts;
        attempt += 1
      ) {
        const x =
          random(
            edge,
            Math.max(
              edge,
              width -
                edge -
                stream.fontSize *
                  1.2
            )
          );

        const score =
          topCandidateScore(
            stream,
            x,
            spawnTime
          );

        if (
          Number.isFinite(
            score
          )
        ) {
          candidates.push({
            x,
            score
          });
        }
      }

      if (
        candidates.length > 0
      ) {
        candidates.sort(
          (a, b) =>
            b.score - a.score
        );

        const usable =
          Math.min(
            3,
            candidates.length
          );

        const chosen =
          candidates[
            Math.floor(
              Math.random() *
              usable
            )
          ];

        stream.startDelay =
          candidateDelay;

        recentSpawns.push({
          x: chosen.x,
          fontSize:
            stream.fontSize,
          depth:
            stream.depth,
          spawnTime,
          until:
            spawnTime +
            tuning.recentSpawnHold
        });

        return chosen.x;
      }

      candidateDelay +=
        random(
          tuning.topPlacementDelayStepMin,
          tuning.topPlacementDelayStepMax
        );
    }

    return null;
  }

  function makeMatrixStream() {
    const stream =
      createMatrixCore();

    stream.y =
      random(
        -stream.lineHeight * 3.2,
        -stream.lineHeight * 0.25
      );

    let delay =
      random(0, 0.10);

    delay =
      adjustDelayAgainstRows(
        stream,
        delay
      );

    stream.startDelay =
      delay;

    const x =
      chooseTopX(
        stream,
        stream.startDelay
      );

    if (
      x === null
    ) {
      return null;
    }

    stream.x = x;

    stream.stepTimer =
      random(
        0,
        stream.lineHeight /
          stream.speed
      );

    refreshStreamVisualWidth(
      stream
    );

    return stream;
  }

  function makeRecipeStream() {
    const stream =
      createRecipeCore();

    stream.y =
      random(
        -stream.lineHeight * 3.2,
        -stream.lineHeight * 0.25
      );

    let delay =
      random(
        0.02,
        0.16
      );

    delay =
      adjustDelayAgainstRows(
        stream,
        delay
      );

    stream.startDelay =
      delay;

    const x =
      chooseTopX(
        stream,
        stream.startDelay
      );

    if (
      x === null
    ) {
      return null;
    }

    stream.x = x;

    refreshStreamVisualWidth(
      stream
    );

    return stream;
  }

  function rebuildPhaseTargets() {
    matrixPhaseTargets =
      buildRandomPhaseTargets(
        targetMatrixCount
      );

    recipePhaseTargets =
      buildRandomPhaseTargets(
        targetRecipeCount
      );

    phaseRefreshTimer =
      random(
        tuning.phaseTargetRefreshMin,
        tuning.phaseTargetRefreshMax
      );
  }

  function resolvePrewarmAabb(
    matrixCollection,
    recipeCollection
  ) {
    // Полный поиск новых мест при старте создавал задержку.
    // Оставляем только быстрый проход без перестановки потоков.
    // Новые потоки проходят проверку в choosePrewarmPosition().
    return;
  }

  function validateStartupScene(scene) {
    if (
      !scene ||
      scene.version !== 3 ||
      !Array.isArray(scene.streams) ||
      scene.streams.length === 0
    ) {
      throw new Error(
        "Invalid startup_scene.json"
      );
    }

    for (const item of scene.streams) {
      const x = item.resolvedX;
      const phase = item.phase?.value;

      if (
        !Number.isFinite(x) ||
        x < 0 ||
        x > 1 ||
        !Number.isFinite(phase) ||
        phase <= 0 ||
        phase >= 1 ||
        !Number.isFinite(item.fontSize) ||
        !Number.isFinite(item.tailLength) ||
        !Number.isFinite(item.speed)
      ) {
        throw new Error(
          "Invalid stream in startup_scene.json"
        );
      }
    }

    return scene;
  }

  // Only a small index and one prevalidated scene are loaded at startup.
  // Record the choice immediately: quick reloads do not depend on idle work.
  async function loadStartupScene() {
    const indexUrl = new URL("startup_scene_index.json", new URL(tuning.startupSceneUrl, document.baseURI));
    try {
      const response = await fetch(indexUrl);
      if (!response.ok) throw new Error(`Startup index HTTP ${response.status}`);
      const index = await response.json();
      if (!Array.isArray(index.scenes) || !index.scenes.length) {
        throw new Error("Empty startup scene index");
      }
      let previousKey = null;
      try {
        previousKey = localStorage.getItem("matrix-startup-last-key-v4");
      } catch (error) { /* Storage may be unavailable in private browsers. */ }
      const alternatives = index.scenes.filter(scene => scene.key !== previousKey);
      const selected = randomItem(alternatives.length ? alternatives : index.scenes);
      const sceneResponse = await fetch(new URL(selected.file, indexUrl));
      if (!sceneResponse.ok) throw new Error(`Startup scene HTTP ${sceneResponse.status}`);
      const scene = validateStartupScene(await sceneResponse.json());
      try {
        localStorage.setItem("matrix-startup-last-key-v4", scene.key);
      } catch (error) { /* Random selection still works without persistence. */ }
      return scene;
    } catch (error) {
      console.warn("Startup rotation unavailable; loading default scene.", error);
      const response = await fetch(tuning.startupSceneUrl);
      if (!response.ok) throw new Error(`Startup scene HTTP ${response.status}`);
      return validateStartupScene(await response.json());
    }
  }

  function applyStartupScene(scene) {
    recentSpawns.length = 0;

    targetMatrixCount =
      scene.scaling?.targetStreams ??
      scene.streams.length;

    targetRecipeCount =
      randomInt(
        tuning.targetRecipeMin,
        tuning.targetRecipeMax
      );

    matrixPhaseTargets =
      buildRandomPhaseTargets(
        targetMatrixCount
      );

    recipePhaseTargets =
      buildRandomPhaseTargets(
        targetRecipeCount
      );

    streams = scene.streams.map(
      item => {
        const stream =
          createMatrixCore({
            fontSize: item.fontSize,
            lineHeight:
              item.fontSize * 1.08,
            speed: item.speed,
            tailLength:
              item.tailLength,
            depth: clamp(
              (
                item.fontSize -
                11.5
              ) / 19,
              0,
              1
            )
          });

        stream.x = clamp(
          item.resolvedX * width,
          2,
          Math.max(
            2,
            width -
              stream.fontSize * 1.2
          )
        );

        warmMatrixToPhase(
          stream,
          item.phase.value
        );

        return stream;
      }
    );

    recipeStreams = [];
    coverageTimer = 0;
    phasePressure = 0;
    coveragePressure = 0;
    phaseRefreshTimer =
      random(
        tuning.phaseTargetRefreshMin,
        tuning.phaseTargetRefreshMax
      );
    matrixSpawnTimer =
      blueNoiseDelay("matrix");
    recipeSpawnTimer =
      blueNoiseDelay("recipe");

    // Никаких buildOccupancy() и choosePrewarmPosition() здесь нет.
    // Обычная логика включится после уже показанного стартового кадра.
    normalLogicStartsAt =
      performance.now() +
      tuning.startupLogicDelay * 1000;
  }

  function drawCurrentScene() {
    ctx.fillStyle = "#010805";
    ctx.fillRect(0, 0, width, height);

    for (const stream of streams) {
      drawMatrixStream(stream);
    }

    for (const stream of recipeStreams) {
      drawRecipeStream(stream);
    }
  }

  function prewarmComposition(
    oldMatrix = null,
    oldRecipes = null,
    returnMode = false
  ) {
    recentSpawns.length = 0;

    targetMatrixCount =
      randomInt(
        tuning.targetMatrixMin,
        tuning.targetMatrixMax
      );

    targetRecipeCount =
      randomInt(
        tuning.targetRecipeMin,
        tuning.targetRecipeMax
      );

    rebuildPhaseTargets();

    const matrixBands =
      phaseSequence(
        matrixPhaseTargets
      );

    const recipeBands =
      phaseSequence(
        recipePhaseTargets
      );

    const placedMatrix = [];
    const placedRecipes = [];

    for (
      let i = 0;
      i < targetMatrixCount;
      i += 1
    ) {
      const old =
        oldMatrix &&
        oldMatrix.length > 0
          ? oldMatrix[
              i % oldMatrix.length
            ]
          : null;

      const keepTraits =
        returnMode &&
        old &&
        Math.random() >
          tuning.returnRegenerateRatio;

      const stream =
        keepTraits
          ? createMatrixCore(
              matrixTraitsFrom(old)
            )
          : createMatrixCore();

      const oldPosition =
        returnMode && old
          ? {
              x: old.x,
              y: old.y
            }
          : null;

      const position =
        choosePrewarmPosition(
          stream,
          matrixBands[i],
          placedMatrix,
          placedRecipes,
          oldPosition
        );

      if (!position) {
        continue;
      }

      stream.x = position.x;

      warmMatrixToPhase(
        stream,
        position.phase
      );

      placedMatrix.push(stream);
    }

    for (
      let i = 0;
      i < targetRecipeCount;
      i += 1
    ) {
      const old =
        oldRecipes &&
        oldRecipes.length > 0
          ? oldRecipes[
              i % oldRecipes.length
            ]
          : null;

      const keepTraits =
        returnMode &&
        old &&
        Math.random() >
          tuning.returnRecipeRegenerateRatio;

      const stream =
        keepTraits
          ? createRecipeCore(
              recipeTraitsFrom(old)
            )
          : createRecipeCore();

      const oldPosition =
        returnMode && old
          ? {
              x: old.x,
              y: old.y
            }
          : null;

      const position =
        choosePrewarmPosition(
          stream,
          recipeBands[i],
          placedMatrix,
          placedRecipes,
          oldPosition
        );

      if (!position) {
        continue;
      }

      stream.x = position.x;

      warmRecipeToPhase(
        stream,
        position.phase
      );

      placedRecipes.push(stream);
    }

    // После первичного размещения не запускаем тяжёлый полный пересчёт.
    // Быстрая проверка выполняется при выборе позиции каждого нового потока.
    streams = placedMatrix;
    recipeStreams = placedRecipes;

    buildOccupancy();

    coverageTimer = 0;
    phasePressure = 0;
    coveragePressure = 0;

    matrixSpawnTimer =
      blueNoiseDelay("matrix");

    recipeSpawnTimer =
      blueNoiseDelay("recipe");
  }

  function updateMatrixStream(
    stream,
    delta
  ) {
    if (stream.startDelay > 0) {
      stream.startDelay -= delta;
      return;
    }

    stream.stepTimer += delta;

    const stepInterval =
      stream.lineHeight /
      stream.speed;

    while (
      stream.stepTimer >=
      stepInterval
    ) {
      stream.glyphs.unshift(
        stream.head
      );

      if (
        stream.glyphs.length >
        stream.tailLength
      ) {
        stream.glyphs.pop();
      }

      stream.y +=
        stream.lineHeight;

      stream.head =
        nextMatrixToken(stream);

      refreshStreamVisualWidth(
        stream
      );

      stream.stepTimer -=
        stepInterval;
    }

    const top =
      stream.y -
      stream.glyphs.length *
        stream.lineHeight;

    if (
      top >
      height +
        tuning.offscreenPadding
    ) {
      stream.dead = true;
    }
  }

  function updateRecipeStream(
    stream,
    delta
  ) {
    if (stream.startDelay > 0) {
      stream.startDelay -= delta;
      return;
    }

    stream.stepTimer += delta;

    while (
      stream.stepTimer >=
      stream.typingDelay
    ) {
      stream.glyphs.unshift(
        stream.head
      );

      if (
        stream.glyphs.length >
        stream.tailLength
      ) {
        stream.glyphs.pop();
      }

      stream.y +=
        stream.lineHeight;

      stream.textIndex += 1;

      if (
        stream.textIndex >=
        stream.text.length
      ) {
        stream.text =
          pickRecipeText();

        stream.textIndex = 0;
      }

      stream.head =
        stream.text[
          stream.textIndex
        ];

      refreshStreamVisualWidth(
        stream
      );

      stream.stepTimer -=
        stream.typingDelay;

      stream.typingDelay =
        random(
          tuning.recipeDelayMin,
          tuning.recipeDelayMax
        );
    }

    const top =
      stream.y -
      stream.glyphs.length *
        stream.lineHeight;

    if (
      top >
      height +
        tuning.offscreenPadding
    ) {
      stream.dead = true;
    }
  }

  function compactAlive(collection) {
    let write = 0;

    for (
      let read = 0;
      read < collection.length;
      read += 1
    ) {
      const stream =
        collection[read];

      if (!stream.dead) {
        collection[write] =
          stream;

        write += 1;
      }
    }

    collection.length =
      write;
  }

  function phaseCounts(collection) {
    const counts =
      new Array(
        tuning.phaseBands
      ).fill(0);

    for (const stream of collection) {
      if (
        stream.dead ||
        stream.startDelay > 0
      ) {
        continue;
      }

      counts[
        phaseBandFor(stream)
      ] += 1;
    }

    return counts;
  }

  function calculateCoveragePressure() {
    buildOccupancy();

    let deficitTotal = 0;
    let cellCount = 0;

    for (
      let row = 0;
      row <
        Math.min(
          tuning.coverageTopRows,
          tuning.coverageRows
        );
      row += 1
    ) {
      for (
        let column = 0;
        column <
          tuning.coverageColumns;
        column += 1
      ) {
        const value =
          occupancyGrid[
            occupancyIndex(
              column,
              row
            )
          ];

        const deficit =
          Math.max(
            0,
            tuning.coverageCellTarget -
              value
          ) /
          tuning.coverageCellTarget;

        deficitTotal += deficit;
        cellCount += 1;
      }
    }

    coveragePressure =
      cellCount > 0
        ? deficitTotal /
          cellCount
        : 0;

    return coveragePressure;
  }

  function calculatePhasePressure() {
    const counts =
      phaseCounts(streams);

    let deficit = 0;
    let totalTarget = 0;

    for (
      let band = 0;
      band <
        tuning.phaseBands;
      band += 1
    ) {
      const target =
        matrixPhaseTargets[band] || 0;

      totalTarget += target;

      if (counts[band] < target) {
        const weight =
          band < 3
            ? 1
            : 0.55;

        deficit +=
          (target - counts[band]) *
          weight;
      }
    }

    phasePressure =
      totalTarget > 0
        ? clamp(
            deficit /
            totalTarget,
            0,
            1
          )
        : 0;

    return phasePressure;
  }

  function maintainDistribution(delta) {
    coverageTimer += delta;
    phaseRefreshTimer -= delta;

    if (phaseRefreshTimer <= 0) {
      rebuildPhaseTargets();
    }

    if (
      coverageTimer <
      tuning.coverageCheckInterval
    ) {
      return;
    }

    coverageTimer = 0;

    calculateCoveragePressure();
    calculatePhasePressure();

    const combined =
      clamp(
        coveragePressure * 0.72 +
        phasePressure * 0.28,
        0,
        1
      );

    if (combined > 0.18) {
      matrixSpawnTimer =
        Math.min(
          matrixSpawnTimer,
          blueNoiseDelay("matrix") *
            (
              1 -
              combined *
                tuning.coverageSpawnBoost
            )
        );
    }

    const topRecipeDeficit =
      recipePhaseTargets.length > 0 &&
      phaseCounts(
        recipeStreams
      )[0] <
      recipePhaseTargets[0];

    if (topRecipeDeficit) {
      recipeSpawnTimer =
        Math.min(
          recipeSpawnTimer,
          blueNoiseDelay("recipe") *
            0.72
        );
    }
  }

  function maintainSpawns(delta) {
    matrixSpawnTimer -= delta;
    recipeSpawnTimer -= delta;

    const matrixNeedsCount =
      streams.length <
      targetMatrixCount;

    const matrixMaySupplement =
      coveragePressure > 0.24 &&
      streams.length <
        tuning.matrixMaxCount;

    if (
      matrixSpawnTimer <= 0 &&
      (
        matrixNeedsCount ||
        matrixMaySupplement
      )
    ) {
      const stream =
        makeMatrixStream();

      if (stream) {
        streams.push(
          stream
        );

        matrixSpawnTimer =
          blueNoiseDelay("matrix");
      } else {
        matrixSpawnTimer =
          random(
            tuning.spawnRetryDelayMin,
            tuning.spawnRetryDelayMax
          );
      }
    }

    if (
      matrixSpawnTimer <= 0 &&
      !matrixNeedsCount &&
      !matrixMaySupplement
    ) {
      matrixSpawnTimer =
        blueNoiseDelay("matrix");
    }

    const recipeNeedsCount =
      recipeStreams.length <
      targetRecipeCount;

    if (
      recipeSpawnTimer <= 0 &&
      (
        recipeNeedsCount ||
        (
          coveragePressure > 0.38 &&
          recipeStreams.length <
            tuning.recipeMaxCount
        )
      )
    ) {
      const stream =
        makeRecipeStream();

      if (stream) {
        recipeStreams.push(
          stream
        );

        recipeSpawnTimer =
          blueNoiseDelay("recipe");
      } else {
        recipeSpawnTimer =
          random(
            tuning.spawnRetryDelayMin,
            tuning.spawnRetryDelayMax
          );
      }
    }

    if (
      recipeSpawnTimer <= 0 &&
      !recipeNeedsCount
    ) {
      recipeSpawnTimer =
        blueNoiseDelay("recipe");
    }
  }

  function drawMatrixStream(stream) {
    if (
      stream.dead ||
      stream.startDelay > 0
    ) {
      return;
    }

    ctx.font =
      stream.font;

    const padding =
      tuning.offscreenPadding;

    if (
      stream.y >=
        -stream.lineHeight -
          padding &&
      stream.y <=
        height +
        stream.lineHeight +
        padding
    ) {
      ctx.save();

      ctx.shadowBlur =
        16 +
        stream.depth * 18;

      ctx.shadowColor =
        "rgba(205,255,220,0.98)";

      ctx.fillStyle =
        "rgba(238,255,243,1)";

      ctx.fillText(
        stream.head,
        stream.x,
        stream.y
      );

      ctx.restore();
    }

    for (
      let i = 0;
      i <
        stream.glyphs.length;
      i += 1
    ) {
      const y =
        stream.y -
        (i + 1) *
          stream.lineHeight;

      if (
        y >
        height + padding
      ) {
        continue;
      }

      if (
        y <
        -stream.lineHeight -
          padding
      ) {
        break;
      }

      const fade =
        1 -
        i /
        Math.max(
          1,
          stream.tailLength
        );

      const alpha =
        Math.max(
         0.045,
        stream.opacity *
         Math.pow(fade, 1.45)
       );

      ctx.fillStyle =
        `rgba(50,${stream.tailGreen},95,${alpha})`;

      ctx.fillText(
        stream.glyphs[i],
        stream.x,
        y
      );
    }
  }

  function drawRecipeStream(stream) {
    if (
      stream.dead ||
      stream.startDelay > 0
    ) {
      return;
    }

    ctx.font =
      stream.font;

    const padding =
      tuning.offscreenPadding;

    if (
      stream.y >=
        -stream.lineHeight -
          padding &&
      stream.y <=
        height +
        stream.lineHeight +
          padding
    ) {
      ctx.save();

      ctx.shadowBlur = 11;

      ctx.shadowColor =
        "rgba(180,255,205,0.92)";

      ctx.fillStyle =
        "rgba(225,255,235,0.96)";

      ctx.fillText(
        stream.head,
        stream.x,
        stream.y
      );

      ctx.restore();
    }

    for (
      let i = 0;
      i <
        stream.glyphs.length;
      i += 1
    ) {
      const y =
        stream.y -
        (i + 1) *
          stream.lineHeight;

      if (
        y >
        height + padding
      ) {
        continue;
      }

      if (
        y <
        -stream.lineHeight -
          padding
      ) {
        break;
      }

      const fade =
        1 -
        i /
        Math.max(
          1,
          stream.tailLength
        );

      const alpha =
        Math.max(
          0.035,
          stream.opacity *
            fade
        );

      ctx.fillStyle =
        `rgba(110,245,150,${alpha})`;

      ctx.fillText(
        stream.glyphs[i],
        stream.x,
        y
      );
    }
  }

  function resizeCanvas() {
    const hero =
      canvas.parentElement;

    width =
      hero.clientWidth;

    height =
      hero.clientHeight;

    const deviceDpr =
      Math.max(
        1,
        window.devicePixelRatio || 1
      );

    pixelRatio =
      tuning.maxDpr > 0
        ? Math.min(
            deviceDpr,
            tuning.maxDpr
          )
        : deviceDpr;

    canvas.width =
      Math.floor(
        width *
        pixelRatio
      );

    canvas.height =
      Math.floor(
        height *
        pixelRatio
      );

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    ctx.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );

    ctx.textBaseline =
      "top";
  }

  function render(time) {
    if (!previousTime) {
      previousTime = time;
    }

    const delta =
      Math.min(
        0.05,
        (time - previousTime) /
          1000
      );

    previousTime = time;

    ctx.fillStyle =
      "#010805";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    if (performance.now() >= normalLogicStartsAt) {
      maintainDistribution(delta);
      maintainSpawns(delta);
    }

    for (const stream of streams) {
      updateMatrixStream(
        stream,
        delta
      );

      drawMatrixStream(
        stream
      );
    }

    for (
      const stream of
      recipeStreams
    ) {
      updateRecipeStream(
        stream,
        delta
      );

      drawRecipeStream(
        stream
      );
    }

    compactAlive(streams);
    compactAlive(recipeStreams);

    if (!animationPaused) {
      animationId =
        requestAnimationFrame(
          render
        );
    } else {
      animationId = null;
    }
  }

  async function start() {
    if (animationId) {
      cancelAnimationFrame(
        animationId
      );
    }

    animationPaused = false;

    resizeCanvas();

    try {
      const startupScene =
        await loadStartupScene();

      applyStartupScene(startupScene);
    } catch (error) {
      console.warn(
        "Startup scene unavailable; using runtime fallback.",
        error
      );
      normalLogicStartsAt = 0;
      prewarmComposition();
    }

    // Первый готовый кадр показывается до запуска обычного цикла.
    drawCurrentScene();

    previousTime = 0;

    animationId =
      requestAnimationFrame(
        render
      );
  }

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        pageHiddenAt =
          performance.now();

        animationPaused = true;

        if (animationId) {
          cancelAnimationFrame(
            animationId
          );

          animationId = null;
        }

        return;
      }

      // Потоки уже находятся в безопасных позициях. При возврате во вкладку
      // просто продолжаем отрисовку, не перестраивая всю сцену заново.
      pageHiddenAt = null;
      previousTime = 0;
      animationPaused = false;

      if (!animationId) {
        animationId =
          requestAnimationFrame(
            render
          );
      }
    }
  );

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(
        resizeTimer
      );

      resizeTimer =
        setTimeout(
          () => {
            const oldWidth =
              Math.max(1, width);
            const oldHeight =
              Math.max(1, height);

            resizeCanvas();

            for (const stream of [
              ...streams,
              ...recipeStreams
            ]) {
              stream.x = clamp(
                stream.x /
                  oldWidth *
                  width,
                2,
                Math.max(
                  2,
                  width -
                    stream.fontSize *
                      1.2
                )
              );

              stream.y =
                stream.y /
                oldHeight *
                Math.max(1, height);

              refreshStreamVisualWidth(
                stream
              );
            }

            drawCurrentScene();
          },
          120
        );
    }
  );

  void start();
})();
