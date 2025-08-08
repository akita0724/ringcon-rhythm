"use client";

import { useRef } from "react";
import { extractMotionDataFromBuffer } from "./motionAnalyzer";
import { MotionData } from "@/types/motion";

export const useRingCon = (setBaseValue: (prev: number) => void) => {
  const connectedDeviceRef = useRef<HIDDevice | null>(null);

  const extractStrainValueFromBuffer = (buffer: ArrayBufferLike) => {
    return new DataView(buffer, 38, 2).getInt16(0, true);
  };

  const extractMotionData = (buffer: ArrayBufferLike): MotionData => {
    return extractMotionDataFromBuffer(buffer);
  };

  const getConnectedDevice = () => connectedDeviceRef.current;

  const connectRingCon = async () => {
    const defineSendReport = ({
      subcommand,
      expected,
      timeoutMsg,
    }: {
      subcommand: number[];
      expected: Record<number, number>;
      timeoutMsg?: string;
    }) => {
      return (device: HIDDevice) =>
        new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            device.removeEventListener("inputreport", onReport);
            reject(new Error(timeoutMsg ?? "timeout"));
          }, 5000);

          const onReport = (event: HIDInputReportEvent) => {
            if (event.reportId !== 0x21) return;

            const data = new Uint8Array(event.data.buffer);

            for (const [key, value] of Object.entries(expected)) {
              if (data[Number(key) - 1] !== value) return;
            }

            device.removeEventListener("inputreport", onReport);
            clearTimeout(timeoutId);
            setTimeout(resolve, 50);
          };

          device.addEventListener("inputreport", onReport);
          device.sendReport(
            0x01,
            new Uint8Array([
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              0x00,
              ...subcommand,
            ]),
          );
        });
    };
    const set_input_report_mode_to_0x30 = defineSendReport({
      subcommand: [0x03, 0x30],
      expected: {
        14: 0x03,
      },
    });
    const enabling_MCU_data_22_1 = defineSendReport({
      subcommand: [0x22, 0x01],
      expected: {
        13: 0x80,
        14: 0x22,
      },
    });
    const enabling_MCU_data_21_21_1_1 = defineSendReport({
      subcommand: [
        0x21, 0x21, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xf3,
      ],
      expected: {
        14: 0x21,
      },
    });
    const get_ext_data_59 = defineSendReport({
      subcommand: [0x59],
      expected: {
        14: 0x59,
        16: 0x20,
      },
      timeoutMsg: "ring-con not found.",
    });
    const get_ext_dev_in_format_config_5C = defineSendReport({
      subcommand: [
        0x5c, 0x06, 0x03, 0x25, 0x06, 0x00, 0x00, 0x00, 0x00, 0x1c, 0x16, 0xed,
        0x34, 0x36, 0x00, 0x00, 0x00, 0x0a, 0x64, 0x0b, 0xe6, 0xa9, 0x22, 0x00,
        0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x90, 0xa8, 0xe1,
        0x34, 0x36,
      ],
      expected: {
        14: 0x5c,
      },
    });
    const start_external_polling_5A = defineSendReport({
      subcommand: [0x5a, 0x04, 0x01, 0x01, 0x02],
      expected: {
        14: 0x5a,
      },
    });
    const blinkLed = defineSendReport({
      subcommand: [0x30, 0x90],
      expected: {
        14: 0x30,
      },
    });

    // IMU (Inertial Measurement Unit) を有効にする
    const enable_IMU = defineSendReport({
      subcommand: [0x40, 0x01],
      expected: {
        14: 0x40,
      },
    });

    const extractStrainValueFromBuffer = (buffer: ArrayBufferLike) => {
      return new DataView(buffer, 38, 2).getInt16(0, true);
    };

    const getStrainValue = (device: HIDDevice): Promise<number> =>
      new Promise((resolve) => {
        const checkInputReport = (event: HIDInputReportEvent) => {
          if (event.reportId === 0x30) {
            const strainValue = extractStrainValueFromBuffer(event.data.buffer);
            if (strainValue !== 0x0000) {
              device.removeEventListener("inputreport", checkInputReport);
              resolve(strainValue);
            }
          }
        };

        device.addEventListener("inputreport", checkInputReport);
      });

    const [device] = await navigator.hid.requestDevice({
      filters: [
        {
          vendorId: 0x057e,
          productId: 0x2007,
        },
      ],
    });

    if (!device) throw new Error("No device found");

    if (!device.opened) await device.open();

    await set_input_report_mode_to_0x30(device);
    await enabling_MCU_data_22_1(device);
    await enabling_MCU_data_21_21_1_1(device);
    await get_ext_data_59(device);
    await get_ext_dev_in_format_config_5C(device);
    await start_external_polling_5A(device);

    // IMUを有効にする
    await enable_IMU(device);

    const NEUTRAL_STRAIN_VALUE = await getStrainValue(device);
    setBaseValue(NEUTRAL_STRAIN_VALUE);

    connectedDeviceRef.current = device;

    console.log("Ready!");

    await blinkLed(device);
  };

  return {
    connectRingCon,
    extractStrainValueFromBuffer,
    extractMotionData,
    getConnectedDevice,
  };
};
