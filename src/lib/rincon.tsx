"use client";

import {
  connectedJoyCons,
  connectJoyCon,
  JoyConDataPacket,
  JoyConRight,
  RingConDataPacket,
} from "joy-con-webhid";
import { useEffect, useState } from "react";
import { AnalogStick } from "joy-con-webhid";

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
  quaternion: {alpha: "", beta: "", gamma: "", },
  rawQuaternion: { x: 0, y: 0, z: 0, w: 0 }
};

// [TODO] Check if the size of joy cons are immediately reflected.
export async function igniteJoyCon() {
  await connectJoyCon();
  return connectedJoyCons.size > 0;
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
  const { actualAccelerometer, actualGyroscope, actualOrientationQuaternion, quaternion } = packet;

  const joystick = packet.analogStickRight as AnalogStick;

  const hor = Number(joystick.horizontal);
  const ver = Number(joystick.vertical);
  
  const ringCon = packet.ringCon as RingConDataPacket;
  const strain = ringCon.strain;

  return {
    strain,
    hor,
    ver,
    acc: actualAccelerometer,
    gyro: actualGyroscope.rps,
    quaternion: actualOrientationQuaternion,
    rawQuaternion: quaternion
  };
}
