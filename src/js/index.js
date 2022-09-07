import { gsap } from "gsap";
import { Observer } from "gsap/Observer.js";
import Splitting from "splitting";
import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";

import { CursorText } from "./cursor";
import {
  navigateAnimation,
  showContentAnimation,
  toggleCursorAndBackTexts,
} from "./gsap";
import { Slide } from "./slide";
import { preloadImages } from "./utils";

gsap.registerPlugin(Observer);
Splitting();

export const DOM = {
  backCtrl: document.querySelector(".frame__back"),
  scrollOrDragText: document.querySelector(".frame__info"),
  cursor: document.querySelector(".cursor"),
  navigationItems: document.querySelectorAll(
    ".frame__nav > .frame__nav-button"
  ),
  slides: [...document.querySelectorAll(".slide")],
};

const positions = {
  x: {
    next: [-150, 0, 0, 150],
    prev: [0, 150, -150, 0],
  },
  y: {
    next: [0, -150, 150, 0],
    prev: [-150, 0, 0, 150],
  },
};

DOM.cursorLetters = DOM.cursor.querySelectorAll(".word > .char, .whitespace");
DOM.backLetters = DOM.backCtrl.querySelectorAll(".word > .char, .whitespace");
DOM.scrollOrDragLetters = DOM.scrollOrDragText.querySelectorAll(
  ".word > .char, .whitespace"
);

let slidesArr = [];
DOM.slides.forEach((slide) => {
  slidesArr.push(new Slide(slide));
});

const totalSlides = DOM.slides.length;

let current = 0; // current slide position
let isAnimating = false;
let isFullScreenOpen = false;

export const isAnimatingCb = (bool) => (isAnimating = bool);

const next = () => {
  const newPosition = current < totalSlides - 1 ? current + 1 : 0;
  navigate(newPosition);
};

const prev = () => {
  const newPosition = current > 0 ? current - 1 : totalSlides - 1;
  navigate(newPosition);
};

const getDirection = (newPosition) => {
  if (current < newPosition) {
    if (current === 0 && newPosition === totalSlides - 1) {
      // go to last from first
      return "prev";
    } else {
      return "next";
    }
  }

  if (current === totalSlides - 1 && newPosition === 0) {
    // go to first from last
    return "next";
  } else {
    return "prev";
  }
};

const navigate = (newPosition) => {
  isAnimating = true;

  DOM.navigationItems[current].classList.remove("frame__nav-button--current");
  DOM.navigationItems[newPosition].classList.add("frame__nav-button--current");

  const direction = getDirection(newPosition);

  const currentSlide = slidesArr[current];
  current =
    direction === "next"
      ? current < totalSlides - 1
        ? ++current
        : 0
      : current > 0
      ? --current
      : totalSlides - 1;
  const nextSlide = slidesArr[current];

  navigateAnimation({ currentSlide, direction, positions, nextSlide });
};

const showContent = (position) => {
  if (isAnimating) return;
  isAnimating = true;
  isFullScreenOpen = true;

  const slide = slidesArr[position];
  slide.isOpen = true;

  showContentAnimation({ slide });
};

export const hideContent = (slide, animate = false) => {
  isAnimating = true;

  const complete = () => {
    slide.isOpen = false;
    isAnimating = false;
    isFullScreenOpen = false;
  };

  if (animate) {
    gsap
      .timeline({
        defaults: {
          duration: 1.6,
          ease: "power3.inOut",
        },
        onComplete: complete,
      })
      .addLabel("start", 0)
      .to(
        slide.DOM.content,
        {
          yPercent: -100,
        },
        "start"
      )
      .to(
        slide.DOM.contentImg,
        {
          startAt: {
            transformOrigin: "50% 0%",
            scaleY: 1,
          },
          scaleY: 3.5,
        },
        "start"
      );
  } else {
    gsap.set(slide.DOM.content, {
      yPercent: -100,
    });
    gsap.set(
      slide.DOM.contentImg,
      {
        startAt: {
          transformOrigin: "50% 0%",
          scaleY: 1,
        },
        scaleY: 3.5,
      },
      "start"
    );

    complete();
  }
};

const init = () => {
  [...DOM.navigationItems].forEach((item, position) => {
    item.addEventListener("click", () => {
      if (current === position || isAnimating) return;
      navigate(position);
    });
  });

  DOM.backCtrl.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    toggleCursorAndBackTexts();
    hideContent(slidesArr[current], true);
  });

  Observer.create({
    type: "wheel,touch,pointer",
    onDown: () => !isAnimating && !isFullScreenOpen && prev(),
    onUp: () => !isAnimating && !isFullScreenOpen && next(),
    wheelSpeed: -1, // scroll up to go down
    tolerance: 10,
  });

  for (const [position, slide] of slidesArr.entries()) {
    slide.DOM.inner.addEventListener("click", () => {
      showContent(position);
    });
  }

  for (const [_, slide] of slidesArr.entries()) {
    slide.DOM.content.addEventListener("click", () => {
      toggleCursorAndBackTexts();
      hideContent(slidesArr[current], true);
    });
  }
};

new CursorText(DOM.cursor);

init();

preloadImages(".slide__img-inner").then(() => {
  document.body.classList.remove("loading");
});
