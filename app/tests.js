function testKanjiConversion() {
  const tests = [
    // Zero.
    { input: 0, expected: "零" },

    // Easy stuff.
    { input: 1, expected: "一" },
    { input: 5, expected: "五" },
    { input: 9, expected: "九" },
    { input: 10, expected: "十" },
    { input: 11, expected: "十一" },
    { input: 13, expected: "十三" },
    { input: 19, expected: "十九" },
    { input: 20, expected: "二十" },
    { input: 30, expected: "三十" },
    { input: 42, expected: "四十二" },
    { input: 52, expected: "五十二" },
    { input: 58, expected: "五十八" },
    { input: 50, expected: "五十" },
    { input: 73, expected: "七十三" },
    { input: 99, expected: "九十九" },

    // Hundreds.
    { input: 100, expected: "百" },
    { input: 101, expected: "百一" },
    { input: 110, expected: "百十" },
    { input: 111, expected: "百十一" },
    { input: 200, expected: "二百" },
    { input: 222, expected: "二百二十二" },
    { input: 999, expected: "九百九十九" },

    // Thousands.
    { input: 1000, expected: "千" },
    { input: 1001, expected: "千一" },
    { input: 1010, expected: "千十" },
    { input: 1100, expected: "千百" },
    { input: 1110, expected: "千百十" },
    { input: 1111, expected: "千百十一" },
    { input: 2000, expected: "二千" },
    { input: 2222, expected: "二千二百二十二" },
    { input: 9999, expected: "九千九百九十九" },

    // 万 (10k) basic.
    { input: 10000, expected: "一万" },
    { input: 20000, expected: "二万" },
    { input: 30000, expected: "三万" },
    { input: 99000, expected: "九万九千" },

    // 万 with various combinations.
    { input: 10001, expected: "一万一" },
    { input: 10010, expected: "一万十" },
    { input: 10100, expected: "一万百" },
    { input: 11000, expected: "一万千" },
    { input: 12345, expected: "一万二千三百四十五" },
    { input: 23456, expected: "二万三千四百五十六" },
    { input: 44289, expected: "四万四千二百八十九" },
    { input: 44389, expected: "四万四千三百八十九" },
    { input: 99999, expected: "九万九千九百九十九" },

    // Complex numbers under 億.
    { input: 234567, expected: "二十三万四千五百六十七" },
    { input: 345678, expected: "三十四万五千六百七十八" },
    { input: 456789, expected: "四十五万六千七百八十九" },
    { input: 9422488, expected: "九百四十二万二千四百八十八" },
    { input: 9836703, expected: "九百八十三万六千七百三" },
    { input: 9999999, expected: "九百九十九万九千九百九十九" },

    // 億 (100M) basic.
    { input: 100000000, expected: "一億" },
    { input: 200000000, expected: "二億" },
    { input: 900000000, expected: "九億" },

    // 億 with combinations.
    { input: 100000001, expected: "一億一" },
    { input: 100001000, expected: "一億千" },
    { input: 100010000, expected: "一億一万" },
    { input: 123456789, expected: "一億二千三百四十五万六千七百八十九" },
    { input: 987654321, expected: "九億八千七百六十五万四千三百二十一" },
    { input: 2036521801, expected: "二十億三千六百五十二万千八百一" },

    // Numbers with zeros in various positions.
    { input: 101010, expected: "十万千十" },
    { input: 1001001, expected: "百万千一" },
    { input: 10001000, expected: "千万千" },
    { input: 100010001, expected: "一億一万一" },

    // Edge cases around limits.
    { input: 999999999, expected: "九億九千九百九十九万九千九百九十九" },
    { input: 1000000000, expected: "十億" },
    { input: 9999999999, expected: "九十九億九千九百九十九万九千九百九十九" },
    { input: 1e4, expected: "一万" },
    { input: 1e6, expected: "百万" },
    { input: 1e8, expected: "一億" },
    { input: 1e9, expected: "十億" },
    { input: 1e12, expected: "一兆" },
    { input: 1e16, expected: "一京" },
    { input: 1e20, expected: "一垓" },
    { input: 1e24, expected: "一秭" },
    { input: 1e28, expected: "一穣" },
    { input: 1e32, expected: "一溝" },
    { input: 1e36, expected: "一澗" },
    { input: 1e40, expected: "一正" },
    { input: 1e44, expected: "一載" },
    { input: 1e48, expected: "一極" },
    { input: 1e52, expected: "一恒河沙" },
    { input: 1e56, expected: "一阿僧祇" },
    { input: 1e60, expected: "一那由他" },
    { input: 1e64, expected: "一不可思議" },
    { input: 1e68, expected: "一無量大数" },

    // Invalid input.
    { input: -1, expected: "-1" },
    { input: -1000, expected: "-1000" },
    { input: -1000000, expected: "-1000000" },
    { input: Infinity, expected: "Infinity" },
    { input: NaN, expected: "NaN" },
  ];

  let passed = 0;
  let failed = 0;

  console.group("running tests…");
  tests.forEach((test) => {
    const result = convertToKanji(test.input);
    if (result !== test.expected) {
      console.error(
        `❌ Failed: ${test.input} → got "${result}" but expected "${test.expected}"`
      );
      console.error(`   Number format: ${test.input.toLocaleString()}`);
      failed++;
    } else {
      console.log(`✅ Passed: ${test.input} → ${result}`);
      passed++;
    }
  });
  console.groupEnd();

  console.log(`\n📊 Test results`);
  console.log(`📝 Total: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    throw new Error(`⚠️ ${failed} test(s) failed!`);
  }
}

function testNumberGeneration() {
  const tests = [
    {
      desc: "Single number range (1 to 1) with kanji",
      config: {
        minNumber: 1,
        maxNumber: 1,
        numeralSystem: "kanji",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: "一",
        hasCounter: true,
      },
    },
    {
      desc: "Single number range (2002 to 2002) with kanji",
      config: {
        minNumber: 2002,
        maxNumber: 2002,
        numeralSystem: "kanji",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: "二千二",
        hasCounter: true,
      },
    },
    {
      desc: "Single number in arabic (1001 to 1001)",
      config: {
        minNumber: 1001,
        maxNumber: 1001,
        numeralSystem: "arabic",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: "1001",
        hasCounter: true,
      },
    },
    {
      desc: "Single high number (1000000 to 1000000)",
      config: {
        minNumber: 1000000,
        maxNumber: 1000000,
        numeralSystem: "kanji",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: "百万",
        hasCounter: true,
      },
    },
    {
      desc: "Normal range (1 to 2) with kanji",
      config: {
        minNumber: 1,
        maxNumber: 2,
        numeralSystem: "kanji",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: /^[一二]$/, // Should be exactly 一 or 二
        hasCounter: true,
      },
    },
    {
      desc: "Both numeral systems enabled (1 to 1)",
      config: {
        minNumber: 1,
        maxNumber: 1,
        numeralSystem: "both",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: /^(1|一)$/, // Should be either 1 or 一
        hasCounter: true,
      },
    },
    {
      desc: "Multiple counters enabled",
      config: {
        minNumber: 1,
        maxNumber: 1,
        numeralSystem: "kanji",
        enabledCounters: ["個", "人", "匹"],
      },
      expectedFormat: {
        number: "一",
        hasAnyCounter: true,
        validCounters: ["個", "人", "匹"],
      },
    },
    {
      desc: "No counters enabled",
      config: {
        minNumber: 1,
        maxNumber: 1,
        numeralSystem: "kanji",
        enabledCounters: [],
      },
      expectedFormat: {
        number: "一",
        hasCounter: false,
      },
    },
    {
      desc: "Zero range (0 to 0) with kanji",
      config: {
        minNumber: 0,
        maxNumber: 0,
        numeralSystem: "kanji",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: "零",
        hasCounter: true,
      },
    },
    {
      desc: "Larger range but still small (5 to 8)",
      config: {
        minNumber: 5,
        maxNumber: 8,
        numeralSystem: "kanji",
        enabledCounters: ["個"],
      },
      expectedFormat: {
        number: /^[五六七八]$/,
        hasCounter: true,
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  console.group("running tests…");
  tests.forEach((test) => {
    // Set up config
    Object.assign(state.config, test.config);

    // Generate number
    const result = generateNumber();

    // Find counter if present
    const counter =
      test.config.enabledCounters.find((c) => result.endsWith(c)) || "";
    const hasCounter = counter !== "";
    const numberPart = hasCounter ? result.slice(0, -counter.length) : result;

    // Check format
    const formatCorrect =
      test.expectedFormat.number instanceof RegExp
        ? test.expectedFormat.number.test(numberPart)
        : numberPart === test.expectedFormat.number;

    // Check counter
    let counterCorrect = true;
    if (test.expectedFormat.hasAnyCounter) {
      counterCorrect =
        hasCounter && test.expectedFormat.validCounters.includes(counter);
    } else {
      counterCorrect = hasCounter === test.expectedFormat.hasCounter;
    }

    if (!formatCorrect || !counterCorrect) {
      console.error(`❌ Failed: ${test.desc}`);
      console.error(`   Got: "${result}"`);
      console.error(`   Number part: "${numberPart}"`);
      console.error(`   Counter: "${counter}"`);
      console.error(`   Expected number format: ${test.expectedFormat.number}`);
      if (test.expectedFormat.hasAnyCounter) {
        console.error(
          `   Expected one of counters: ${test.expectedFormat.validCounters.join(
            ", "
          )}`
        );
      } else {
        console.error(`   Expected counter: ${test.expectedFormat.hasCounter}`);
      }
      failed++;
    } else {
      console.log(`✅ Passed: ${test.desc} → ${result}`);
      passed++;
    }
  });
  console.groupEnd();

  console.log(`\n📊 Test results:`);
  console.log(`📝 Total: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    throw new Error(`⚠️ ${failed} test(s) failed!`);
  }
}

const TEST_GROUPS = [
  {
    name: "kanji conversion tests",
    run: testKanjiConversion,
  },
  {
    name: "number generation tests",
    run: testNumberGeneration,
  },
];

function runAllTests() {
  TEST_GROUPS.forEach((group) => {
    console.group(`running ${group.name}...`);
    group.run();
    console.groupEnd();
  });
}

runAllTests();
