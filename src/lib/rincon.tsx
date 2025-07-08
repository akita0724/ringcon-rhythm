"use client";

import { connectedJoyCons, connectJoyCon, JoyConDataPacket, JoyConLeft, JoyConRight } from "joy-con-webhid";
import { useEffect, useState } from "react";
import { JoyConEvents, AnalogStick } from "joy-con-webhid";

// Refer to https://github.com/tomayac/joy-con-webhid/blob/main/demo/webmidi.js
// Especially, visualize function

const initialStickValue = {
  strain: 0,
  hor: 0,
  ver: 0,
  acc: { x: 0, y: 0, z: 0 },
  gyro: { x: 0, y: 0, z: 0 }
};

export async function igniteJoyCon() {
  await connectJoyCon();
}

export function useRingConValues() {
  const [rightController, setRightController] = useState(initialStickValue);
  const [leftController, setLeftController] = useState(initialStickValue);

  useEffect(() => {

    (async() => {
      await listenReport()
    })()

    async function listenReport() {
      setInterval(async () => {
        for (const joyCon of connectedJoyCons.values()) {
          if (joyCon.eventListenerAttached) {
            continue;
          }
          joyCon.eventListenerAttached = true;
          await joyCon.disableVibration();
          joyCon.addEventListener('hidinput', (e: JoyConEvents) => {
            const packet = e.hidinput.detail;
            if(!packet) return;
            const [isLeftStick, stickValue] = handleInput(joyCon, packet);
            if(isLeftStick) {
              setLeftController(stickValue);
            }else {
              setRightController(stickValue);
            }
          });
        }
      }, 2000);
    }

  }, []);
  
  return {
    rightController,
    leftController,
  }
}

function handleInput(joyCon: JoyConLeft | JoyConRight, packet: JoyConDataPacket ): [boolean, typeof initialStickValue]{
  const isLeftController = joyCon instanceof JoyConLeft;

  const { actualAccelerometer, actualGyroscope, ringCon } = packet;

  const joystick = isLeftController ? packet.analogStickLeft : packet.analogStickRight;

  const hor = joystick.horizontal;
  const ver = joystick.vertical;
  const acc = { x: actualAccelerometer.x, y: actualAccelerometer.y, z: actualAccelerometer.z };
  const gyro = { x: actualGyroscope.rps.x, y: actualGyroscope.rps.y, z: actualGyroscope.rps.z };
  const strain = ringCon.strain;

  return [isLeftController, {
    strain, hor, ver, acc, gyro,
  }];
}