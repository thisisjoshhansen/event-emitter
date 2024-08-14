import { expect } from 'chai';
import sinon from 'sinon';

import { EventEmitter } from '../src/event-emitter';

describe('EventEmitter', () => {
  let eventEmitter: EventEmitter<{
    win: [];
    speak: [message: string];
  }>;
  let onWin: sinon.SinonSpy;
  let onSpeak: sinon.SinonSpy;

  beforeEach(() => {
    eventEmitter = new EventEmitter<{
      win: [];
      speak: [message: string];
    }>();

    onWin = sinon.spy();
    onSpeak = sinon.spy();
  });

  it('should allow subscribing to an event and emitting it', () => {
    eventEmitter.on('win', onWin);
    eventEmitter.emit('win');

    expect(onWin.calledOnce).to.be.true;
  });

  it('should pass arguments to the listener', () => {
    eventEmitter.on('speak', onSpeak);
    eventEmitter.emit('speak', 'hello');

    expect(onSpeak.calledOnce).to.be.true;
    expect(onSpeak.calledWith('hello')).to.be.true;
  });

  it('should allow unsubscribing from an event', () => {
    eventEmitter.on('win', onWin);
    eventEmitter.off('win', onWin);
    eventEmitter.emit('win');

    expect(onWin.called).to.be.false;
  });

  it('should not fail if off is called on an event that was not subscribed to', () => {
    expect(() => eventEmitter.off('win', onWin)).to.not.throw();
  });

  it('should allow multiple listeners on the same event', () => {
    const anotherOnWin = sinon.spy();
    eventEmitter.on('win', onWin);
    eventEmitter.on('win', anotherOnWin);

    eventEmitter.emit('win');

    expect(onWin.calledOnce).to.be.true;
    expect(anotherOnWin.calledOnce).to.be.true;
  });

  it('should emit only to the relevant listeners', () => {
    const anotherOnWin = sinon.spy();
    eventEmitter.on('win', onWin);
    eventEmitter.on('win', anotherOnWin);
    eventEmitter.on('speak', onSpeak);

    eventEmitter.emit('win');

    expect(onWin.calledOnce).to.be.true;
    expect(anotherOnWin.calledOnce).to.be.true;
    expect(onSpeak.called).to.be.false;
  });

  it('should not interfere between two instances for the same event type', () => {
    const anotherEventEmitter = new EventEmitter<{
      win: [];
      speak: [message: string];
    }>();
  
    const onWinAnother = sinon.spy();
  
    eventEmitter.on('win', onWin);
    anotherEventEmitter.on('win', onWinAnother);
  
    // console.log("Emitting 'win' from first emitter");
    eventEmitter.emit('win');
  
    expect(onWin.calledOnce).to.be.true;
    expect(onWinAnother.called).to.be.false;
  
    // console.log("Emitting 'win' from second emitter");
    anotherEventEmitter.emit('win');
  
    expect(onWinAnother.calledOnce).to.be.true;
    expect(onWin.calledOnce).to.be.true; // Should still be true, not incremented by another instance
  });

  it('should allow simultaneous emission from both instances without interference', () => {
    const anotherEventEmitter = new EventEmitter<{
      win: [];
      speak: [message: string];
    }>();

    const onSpeakAnother = sinon.spy();

    eventEmitter.on('speak', onSpeak);
    anotherEventEmitter.on('speak', onSpeakAnother);

    eventEmitter.emit('speak', 'hello from emitter');
    anotherEventEmitter.emit('speak', 'hello from another emitter');

    expect(onSpeak.calledOnce).to.be.true;
    expect(onSpeakAnother.calledOnce).to.be.true;

    expect(onSpeak.calledWith('hello from emitter')).to.be.true;
    expect(onSpeakAnother.calledWith('hello from another emitter')).to.be.true;
  });

  it('should return a function that unsubscribes the event listener', () => {
    const unsubscribeWin = eventEmitter.on('win', onWin);

    eventEmitter.emit('win');
    expect(onWin.calledOnce).to.be.true;

    unsubscribeWin();
    eventEmitter.emit('win');
    expect(onWin.calledOnce).to.be.true; // Should still be called only once
  });

  it('should work with multiple listeners on the same event', () => {
    const unsubscribeWin1 = eventEmitter.on('win', onWin);
    const anotherOnWin = sinon.spy();
    const unsubscribeWin2 = eventEmitter.on('win', anotherOnWin);

    eventEmitter.emit('win');
    expect(onWin.calledOnce).to.be.true;
    expect(anotherOnWin.calledOnce).to.be.true;

    unsubscribeWin1(); // Unsubscribing the first listener
    eventEmitter.emit('win');
    expect(onWin.calledOnce).to.be.true; // Should still be called only once
    expect(anotherOnWin.calledTwice).to.be.true; // Should be called twice now

    unsubscribeWin2(); // Unsubscribing the second listener
    eventEmitter.emit('win');
    expect(onWin.calledOnce).to.be.true; // No change
    expect(anotherOnWin.calledTwice).to.be.true; // No change
  });

  it('should allow unsubscribing from an event that has already been emitted', () => {
    const unsubscribeSpeak = eventEmitter.on('speak', onSpeak);

    eventEmitter.emit('speak', 'first message');
    expect(onSpeak.calledOnce).to.be.true;
    expect(onSpeak.calledWith('first message')).to.be.true;

    unsubscribeSpeak();
    eventEmitter.emit('speak', 'second message');
    expect(onSpeak.calledOnce).to.be.true; // Should still be called only once
  });
});
