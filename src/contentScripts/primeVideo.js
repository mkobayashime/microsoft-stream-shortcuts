"use strict"

import togglePause from "../methods/togglePause"
import seek from "../methods/seek"
import isTyping from "../methods/isTyping"
import changePlaybackSpeed from "../methods/changePlaybackSpeed"
import createIndicator from "../methods/createIndicator"
import loadIndicatorCss from "../methods/loadIndicatorCss"

window.onload = () => {
  const body = document.getElementsByTagName("body")[0]

  const observer = new MutationObserver(() => {
    if (body.style.overflow === "hidden") {
      getVideo()
      loadIndicatorCss()
    }
  })

  observer.observe(body, {
    attributes: true,
  })
}

const getVideo = () => {
  const promise = new Promise((resolve) => {
    const interval = window.setInterval(() => {
      const media = document.getElementsByTagName("video")[0]
      if (media) {
        window.clearInterval(interval)
        resolve(media)
      }
    }, 250)
  })

  promise.then((media) => {
    setShortcuts(media)
  })
}

const setShortcuts = (media) => {
  document.onkeyup = (e) => {
    if (!isTyping(document)) {
      switch (e.key) {
        case "k":
          togglePause(media)
          callIndicatorCreator({ type: "icon", id: "togglePause", media })
          break
        case " ":
          togglePause(media)
          callIndicatorCreator({ type: "icon", id: "togglePause", media })
          break
        case "j":
          seek({
            media: media,
            direction: "backward",
            cacheRequired: true,
          })
          callIndicatorCreator({ type: "icon", id: "seekBackward" })
          break
        case "l":
          seek({
            media: media,
            direction: "forward",
            cacheRequired: true,
          })
          callIndicatorCreator({ type: "icon", id: "seekForward" })
          break
        case "m":
          if (media.volume !== 0) {
            callIndicatorCreator({
              type: "text",
              text: Math.round(media.volume * 100).toString() + "%",
            })
          } else {
            callIndicatorCreator({ type: "icon", id: "mute" })
          }
          break
        case "<": {
          const curSpeed = changePlaybackSpeed(media, "decrease")
          callIndicatorCreator({
            type: "text",
            text: curSpeed.toString() + "x",
          })
          break
        }
        case ">": {
          const curSpeed = changePlaybackSpeed(media, "increase")
          callIndicatorCreator({
            type: "text",
            text: curSpeed.toString() + "x",
          })
          break
        }
      }
    }
  }
}

const callIndicatorCreator = ({ type, id, text, media }) => {
  const wrapper = document.getElementsByClassName("overlaysContainer")[0]

  createIndicator({
    type,
    id,
    text,
    wrapper,
    media,
  })
}