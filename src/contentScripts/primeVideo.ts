import applyDefaultPlaybackSpeed from "../methods/applyDefaultPlaybackSpeed";
import changePlaybackSpeed from "../methods/changePlaybackSpeed";
import { createIndicator } from "../methods/createIndicator";
import { getConfig } from "../methods/getConfig";
import isTyping from "../methods/isTyping";
import { decimalSeek, seek } from "../methods/seek";
import togglePause from "../methods/togglePause";
import type { StorageSync } from "../types/storage";

window.onload = () => {
  // Check if Prime Video is enabled in setting
  getConfig().then((result) => {
    if (result["sites-prime-video"]) {
      // In Prime Video, body gets style "overflow: hidden;"
      // when the video player is displayed
      const body = document.getElementsByTagName("body")[0];
      const observer = new MutationObserver(() => {
        if (body.style.overflow === "hidden") {
          getVideo(result);
        }
      });
      observer.observe(body, {
        attributes: true,
      });
    }
  });
};

const getVideo = (config: StorageSync) => {
  const promise: Promise<HTMLVideoElement> = new Promise((resolve) => {
    const interval = window.setInterval(() => {
      const media = document.querySelector<HTMLVideoElement>(
        ".webPlayerElement video",
      );
      if (media) {
        window.clearInterval(interval);
        resolve(media);
      }
    }, 250);
  });

  promise.then((media) => {
    setShortcuts(media, config);
    applyDefaultPlaybackSpeed(media, "speed-prime-video");
  });
};

const setShortcuts = (media: HTMLVideoElement, config: StorageSync) => {
  const seekSec = config["seek-sec"];

  document.onkeyup = (e) => {
    if (!isTyping()) {
      switch (e.key) {
        case "k":
          if (config["keys-k"]) {
            togglePause(media);
            if (!media.paused) {
              callIndicatorCreator({ type: "icon", id: "togglePause", media });
            }
          }
          break;
        case "j":
          if (config["keys-j"] && typeof seekSec === "number") {
            seek({
              media: media,
              direction: "backward",
              seekSec,
              cacheRequired: true,
            });
            callIndicatorCreator({ type: "icon", id: "seekBackward", media });
          }
          break;
        case "l":
          if (config["keys-l"] && typeof seekSec === "number") {
            seek({
              media: media,
              direction: "forward",
              seekSec,
              cacheRequired: true,
            });
            callIndicatorCreator({ type: "icon", id: "seekForward", media });
          }
          break;
        case "m":
          if (config["keys-m"]) {
            if (media.volume !== 0) {
              callIndicatorCreator({
                type: "text",
                text: `${Math.round(media.volume * 100).toString()}%`,
              });
            } else {
              callIndicatorCreator({ type: "icon", id: "mute", media });
            }
          }
          break;
        case "<": {
          if (config["keys-left-arrow"]) {
            const curSpeed = changePlaybackSpeed(media, "decrease");
            callIndicatorCreator({
              type: "text",
              text: `${curSpeed.toString()}x`,
            });
          }
          break;
        }
        case ">": {
          if (config["keys-right-arrow"]) {
            const curSpeed = changePlaybackSpeed(media, "increase");
            callIndicatorCreator({
              type: "text",
              text: `${curSpeed.toString()}x`,
            });
          }
          break;
        }
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          if (config["keys-decimal"]) {
            decimalSeek({
              media: media,
              numericKey: e.key,
            });
            callIndicatorCreator({
              type: "text",
              text: e.key,
            });
          }
          break;
        }
      }
    }
  };
};

// Page specific wrapper of methods/createIndicator.ts
const callIndicatorCreator = (props: createIndicator.PropsWithoutWrapper) => {
  const wrapper = document.getElementsByClassName("webPlayerUIContainer")[0] as
    | HTMLElement
    | undefined;

  if (!wrapper) return;

  createIndicator({ ...props, wrapper });
};
