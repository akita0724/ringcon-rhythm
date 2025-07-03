// Many codes are cited from a library.
// Refer to https://github.com/tomayac/joy-con-webhid/blob/main/src/parse.js

function baseSum<T>(array: T[], iteratee: (value: T) => number) {
  let result;

  for (const value of array) {
    const current = iteratee(value);
    if (current !== undefined) {
      result = result === undefined ? current : result + current;
    }
  }
  // tentative value
  return result ?? 0;
}

function mean(array: number[]) {
  return baseMean(array, (value) => value);
}

function baseMean<T>(array: T[], iteratee: (value: T) => number) {
  const length = array == null ? 0 : array.length;
  return length ? baseSum(array, iteratee) / length : NaN;
}


function toAcceleration(value: Uint8Array): number {
  const view = new DataView(value.buffer);
  return parseFloat((0.000244 * view.getInt16(0, true)).toFixed(6));
}

function toDegreesPerSecond(value: Uint8Array) {
  const view = new DataView(value.buffer);
  return parseFloat((0.06103 * view.getInt16(0, true)).toFixed(6));
}

function toRevolutionsPerSecond(value: Uint8Array) {
  const view = new DataView(value.buffer);
  return parseFloat((0.0001694 * view.getInt16(0, true)).toFixed(6));
}

export function parseAccelerometers(rawData: Uint8Array, data: string) {
  const accelerometers = [
    {
      x: {
        _raw: rawData.slice(13, 15), // index 13,14
        _hex: data.slice(13, 15),
        acc: toAcceleration(rawData.slice(13, 15)),
      },
      y: {
        _raw: rawData.slice(15, 17), // index 15,16
        _hex: data.slice(15, 17),
        acc: toAcceleration(rawData.slice(15, 17)),
      },
      z: {
        _raw: rawData.slice(17, 19), // index 17,18
        _hex: data.slice(17, 19),
        acc: toAcceleration(rawData.slice(17, 19)),
      },
    },
    {
      x: {
        _raw: rawData.slice(25, 27), // index 25,26
        _hex: data.slice(25, 27),
        acc: toAcceleration(rawData.slice(25, 27)),
      },
      y: {
        _raw: rawData.slice(27, 29), // index 27,28
        _hex: data.slice(27, 29),
        acc: toAcceleration(rawData.slice(27, 29)),
      },
      z: {
        _raw: rawData.slice(29, 31), // index 29,30
        _hex: data.slice(29, 31),
        acc: toAcceleration(rawData.slice(29, 31)),
      },
    },
    {
      x: {
        _raw: rawData.slice(37, 39), // index 37,38
        _hex: data.slice(37, 39),
        acc: toAcceleration(rawData.slice(37, 39)),
      },
      y: {
        _raw: rawData.slice(39, 41), // index 39,40
        _hex: data.slice(39, 41),
        acc: toAcceleration(rawData.slice(39, 41)),
      },
      z: {
        _raw: rawData.slice(41, 43), // index 41,42
        _hex: data.slice(41, 43),
        acc: toAcceleration(rawData.slice(41, 43)),
      },
    },
  ];

  return accelerometers;
}

export function parseGyroscopes(rawData: Uint8Array, data: string) {
  const gyroscopes = [
    [
      {
        _raw: rawData.slice(19, 21), // index 19,20
        _hex: data.slice(19, 21),
        dps: toDegreesPerSecond(rawData.slice(19, 21)),
        rps: toRevolutionsPerSecond(rawData.slice(19, 21)),
      },
      {
        _raw: rawData.slice(21, 23), // index 21,22
        _hex: data.slice(21, 23),
        dps: toDegreesPerSecond(rawData.slice(21, 23)),
        rps: toRevolutionsPerSecond(rawData.slice(21, 23)),
      },
      {
        _raw: rawData.slice(23, 25), // index 23,24
        _hex: data.slice(23, 25),
        dps: toDegreesPerSecond(rawData.slice(23, 25)),
        rps: toRevolutionsPerSecond(rawData.slice(23, 25)),
      },
    ],
    [
      {
        _raw: rawData.slice(31, 33), // index 31,32
        _hex: data.slice(31, 33),
        dps: toDegreesPerSecond(rawData.slice(31, 33)),
        rps: toRevolutionsPerSecond(rawData.slice(31, 33)),
      },
      {
        _raw: rawData.slice(33, 35), // index 33,34
        _hex: data.slice(33, 35),
        dps: toDegreesPerSecond(rawData.slice(33, 35)),
        rps: toRevolutionsPerSecond(rawData.slice(33, 35)),
      },
      {
        _raw: rawData.slice(35, 37), // index 35,36
        _hex: data.slice(35, 37),
        dps: toDegreesPerSecond(rawData.slice(35, 37)),
        rps: toRevolutionsPerSecond(rawData.slice(35, 37)),
      },
    ],
    [
      {
        _raw: rawData.slice(43, 45), // index 43,44
        _hex: data.slice(43, 45),
        dps: toDegreesPerSecond(rawData.slice(43, 45)),
        rps: toRevolutionsPerSecond(rawData.slice(43, 45)),
      },
      {
        _raw: rawData.slice(45, 47), // index 45,46
        _hex: data.slice(45, 47),
        dps: toDegreesPerSecond(rawData.slice(45, 47)),
        rps: toRevolutionsPerSecond(rawData.slice(45, 47)),
      },
      {
        _raw: rawData.slice(47, 49), // index 47,48
        _hex: data.slice(47, 49),
        dps: toDegreesPerSecond(rawData.slice(47, 49)),
        rps: toRevolutionsPerSecond(rawData.slice(47, 49)),
      },
    ],
  ];

  return gyroscopes;
}

export function calculateActualAccelerometer(accelerometers: [number, number, number][] ) {
  const elapsedTime = 0.005 * accelerometers.length; // Spent 5ms to collect each data.

  const actualAccelerometer = {
    x: parseFloat(
      (mean(accelerometers.map((g) => g[0])) * elapsedTime).toFixed(6)
    ),
    y: parseFloat(
      (mean(accelerometers.map((g) => g[1])) * elapsedTime).toFixed(6)
    ),
    z: parseFloat(
      (mean(accelerometers.map((g) => g[2])) * elapsedTime).toFixed(6)
    ),
  };

  return actualAccelerometer;
}

export function calculateActualGyroscope(gyroscopes: [number, number, number][]) {
  const elapsedTime = 0.005 * gyroscopes.length; // Spent 5ms to collect each data.

  const actualGyroscopes = [
    mean(gyroscopes.map((g) => g[0])),
    mean(gyroscopes.map((g) => g[1])),
    mean(gyroscopes.map((g) => g[2])),
  ].map((v) => parseFloat((v * elapsedTime).toFixed(6)));

  return {
    x: actualGyroscopes[0],
    y: actualGyroscopes[1],
    z: actualGyroscopes[2],
  };
}