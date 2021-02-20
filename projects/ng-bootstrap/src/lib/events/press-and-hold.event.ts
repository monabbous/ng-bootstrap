export class PressAndHoldEvent extends Event {
  constructor() {
    super('pressandhold');
  }
}

export function pressAndHoldEventInit(element: HTMLElement, delay = 500) {

  const ev = new PressAndHoldEvent();
  let frame;
  const pressDown = () => {
    element.dispatchEvent(ev);
    const time = performance.now();
    const pressHold = () => {
      if (time + delay <= performance.now()) {
        element.dispatchEvent(ev);
      }
      frame = requestAnimationFrame(pressHold);
    };
    frame = requestAnimationFrame(pressHold);
  };

  const pressUp = () => {
    cancelAnimationFrame(frame);
  };

  element.addEventListener('touchstart', pressDown, false);
  element.addEventListener('touchend', pressUp, false);
  element.addEventListener('touchcancel', pressUp, false);

  element.addEventListener('mousedown', pressDown, false);
  element.addEventListener('mouseup', pressUp, false);
  element.addEventListener('mouseleave', pressUp, false);
}

