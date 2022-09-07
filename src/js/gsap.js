import { gsap } from "gsap";

import { DOM, hideContent, isAnimatingCb } from ".";

const reverseDirection = (direction) => {
  return direction === "next" ? "prev" : "next";
};

export const showContentAnimation = ({ slide }) => {
  gsap
    .timeline({
      defaults: {
        duration: 1.6,
        ease: "power3.inOut",
      },
      onStart: () => {},
      onComplete: () => {
        isAnimatingCb(false);
      },
    })
    .addLabel("start", 0)
    .add(() => {
      toggleCursorAndBackTexts(true);
    }, "start")
    .to(
      slide.DOM.content,
      {
        startAt: {
          yPercent: -200,
        },
        yPercent: 100,
      },
      "start"
    )
    .to(
      slide.DOM.contentImg,
      {
        startAt: {
          scaleY: 4.5,
        },
        scaleY: 1,
      },
      "start"
    );
};

export const navigateAnimation = ({
  currentSlide,
  direction,
  positions,
  nextSlide,
}) => {
  return (
    gsap
      .timeline({
        defaults: { duration: 0.8, ease: "power4.inOut" },
        onStart: () => isAnimatingCb(true),
        onComplete: () => {
          currentSlide.DOM.el.classList.remove("slide--current");
          isAnimatingCb(false);
        },
      })
      .addLabel("start", 0)
      // Animate current title out (stagger the characters)
      .to(
        currentSlide.DOM.chars,
        {
          y: direction === "next" ? "100%" : "-100%",
          rotation: direction === "next" ? 3 : -3,
          stagger: direction === "next" ? -0.015 : 0.015,
        },
        "start"
      )
      // Animate current images out
      .to(
        currentSlide.DOM.imgs,
        {
          x: (pos) => `${positions.x[direction][pos]}%`,
          y: (pos) => `${positions.y[direction][pos]}%`,
          opacity: 0,
        },
        "start"
      )
      // .addLabel("upcoming", 0.4)
      .add(() => {
        // Set up upcoming images and text default style:
        gsap.set(nextSlide.DOM.imgs, { opacity: 0 });
        gsap.set(nextSlide.DOM.chars, {
          y: direction === "next" ? "-100%" : "100%",
          rotation: direction === "next" ? 3 : -3,
        });
        // Add "current" class
        nextSlide.DOM.el.classList.add("slide--current");
      }, "upcoming")
      // Animate upcoming title in (stagger the characters)
      .to(
        nextSlide.DOM.chars,
        {
          y: "0%",
          rotation: 0,
          ease: "power4",
          stagger: direction === "next" ? -0.015 : 0.015,
        },
        "upcoming"
      )
      // Animate upcoming images in
      .to(
        nextSlide.DOM.imgs,
        {
          startAt: {
            x: (pos) => `${positions.x[reverseDirection(direction)][pos]}%`,
            y: (pos) => `${positions.y[reverseDirection(direction)][pos]}%`,
          },
          x: "0%",
          y: "0%",
          opacity: 0.4,
          ease: "power4",
        },
        "upcoming"
      )
  );
};

export const toggleCursorAndBackTexts = (isContent) => {
  return gsap
    .timeline({
      onStart: () => {
        gsap.set(DOM.backLetters, { opacity: isContent ? 0 : 1 });

        if (isContent) {
          DOM.backCtrl.classList.add("frame__back--show");
        }
      },
      onComplete: () => {
        DOM.backCtrl.classList[isContent ? "add" : "remove"](
          "frame__back--show"
        );

        if (!isContent) {
          DOM.backCtrl.classList.remove("frame__back--show");
        }
      },
    })
    .to(DOM.cursorLetters, {
      duration: 0.1,
      ease: "expo",
      opacity: isContent ? 0 : 1,
      stagger: {
        amount: 0.5,
        grid: "auto",
        from: "random",
      },
    })
    .to(
      DOM.scrollOrDragLetters,
      {
        duration: 0.1,
        ease: "expo",
        opacity: isContent ? 0 : 1,
        stagger: {
          amount: 0.5,
          grid: "auto",
          from: "random",
        },
      },
      0
    )
    .to(
      DOM.backLetters,
      {
        duration: 0.1,
        ease: "expo",
        opacity: isContent ? 1 : 0,
        stagger: {
          amount: 0.5,
          grid: "auto",
          from: "random",
        },
      },
      0
    );
};
