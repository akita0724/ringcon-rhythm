"use client";

import {
  connectedJoyCons,
  connectJoyCon,
  JoyConDataPacket,
  JoyConLeft,
  JoyConRight,
  RingConDataPacket,
} from "joy-con-webhid";
import { useEffect, useState } from "react";
import { JoyConEvents, AnalogStick } from "joy-con-webhid";

// Refer to https://github.com/tomayac/joy-con-webhid/blob/main/demo/webmidi.js
// especially, visualize function.
// However, the codes may be obsolete since the developer didn't revise script by typescript.
// We have to manage to convert context from js to ts by ourselves.

const initialStickValue = {
  strain: 0,
  hor: 0,
  ver: 0,
  acc: { x: 0, y: 0, z: 0 },
  gyro: { x: 0, y: 0, z: 0 },
};

export async function igniteJoyCon() {
  await connectJoyCon();
}

export function useRingConValues() {
  const [rightController, setRightController] = useState(initialStickValue);

  useEffect(() => {
    (async () => {
      await listenReport();
    })();

    async function listenReport() {
      setInterval(async () => {
        for (const joyCon of connectedJoyCons.values()) {
          if (joyCon.eventListenerAttached) {
            continue;
          }
          joyCon.eventListenerAttached = true;
          await joyCon.enableRingCon();

          // [TODO] find correct event type.
          // event type may be incorrect.
          // please confirm the result of this code.
          joyCon.addEventListener("hidinput", (e) => {
            const packet = e.detail as JoyConDataPacket;
            if (!packet) return null;
            if (!(joyCon instanceof JoyConRight)) return null;
            const stickValue = handleInput(packet);
            setRightController(stickValue);
          });
        }
      }, 2000);
    }
  }, []);

  return rightController;
}

function handleInput(packet: JoyConDataPacket): typeof initialStickValue {
  const { actualAccelerometer, actualGyroscope } = packet;

  const joystick = packet.analogStickRight as AnalogStick;

  // [TODO] resolve incompatibility of object types.

  const hor = Number(joystick.horizontal);
  const ver = Number(joystick.vertical);
  const acc = {
    x: actualAccelerometer.x,
    y: actualAccelerometer.y,
    z: actualAccelerometer.z,
  };
  const gyro = {
    x: actualGyroscope.rps.x,
    y: actualGyroscope.rps.y,
    z: actualGyroscope.rps.z,
  };
  const ringCon = packet.ringCon as RingConDataPacket;
  const strain = ringCon.strain;

  return {
    strain,
    hor,
    ver,
    acc,
    gyro,
  };
}
