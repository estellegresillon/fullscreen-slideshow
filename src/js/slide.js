export class Slide {
  DOM = {
    el: null,
    chars: null,
    imgWrap: null,
    imgs: null,
    inner: null,
    content: null,
    contentImg: null,
    contentTexts: null,
  };

  constructor(el) {
    this.DOM.el = el;
    this.DOM.chars = this.DOM.el.querySelectorAll(".word > .char, .whitespace");
    this.DOM.inner = this.DOM.el.querySelector(".slide__inner");
    this.DOM.imgWrap = this.DOM.el.querySelector(".slide__img-wrap");
    this.DOM.imgs = this.DOM.el.querySelectorAll(".slide__img");
    this.DOM.content = this.DOM.el.querySelector(".slide__content");
    this.DOM.contentImg = this.DOM.content.querySelector(".slide__content-img");
    this.DOM.contentTexts = [...this.DOM.content.children].filter(
      (item) => item != this.DOM.contentImg
    );
  }
}
