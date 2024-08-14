import { expect } from 'chai';
import sinon from 'sinon';
import { createEmitterListener } from '../src/create-emitter-listener';

describe('createEmitterListener', () => {
  let emitter: ReturnType<typeof createEmitterListener>;
  let onWin: sinon.SinonSpy;
  let onSpeak: sinon.SinonSpy;

  beforeEach(() => {
    emitter = createEmitterListener<{
      win: [];
      speak: [message: string];
    }>();
    
    onWin = sinon.spy();
    onSpeak = sinon.spy();
  });

  it('should allow subscribing to an event and emitting it', () => {
    emitter.listener.on('win', onWin);
    emitter.emit('win');

    expect(onWin.calledOnce).to.be.true;
  });

  it('should pass arguments to the listener', () => {
    emitter.listener.on('speak', onSpeak);
    emitter.emit('speak', 'hello');

    expect(onSpeak.calledOnce).to.be.true;
    expect(onSpeak.calledWith('hello')).to.be.true;
  });

  it('should allow unsubscribing from an event', () => {
    emitter.listener.on('win', onWin);
    emitter.listener.off('win', onWin);
    emitter.emit('win');

    expect(onWin.called).to.be.false;
  });

  it('should not fail if off is called on an event that was not subscribed to', () => {
    expect(() => emitter.listener.off('win', onWin)).to.not.throw();
  });

  it('should allow multiple listeners on the same event', () => {
    const anotherOnWin = sinon.spy();
    emitter.listener.on('win', onWin);
    emitter.listener.on('win', anotherOnWin);

    emitter.emit('win');

    expect(onWin.calledOnce).to.be.true;
    expect(anotherOnWin.calledOnce).to.be.true;
  });

  it('should emit only to the relevant listeners', () => {
    const anotherOnWin = sinon.spy();
    emitter.listener.on('win', onWin);
    emitter.listener.on('win', anotherOnWin);
    emitter.listener.on('speak', onSpeak);

    emitter.emit('win');

    expect(onWin.calledOnce).to.be.true;
    expect(anotherOnWin.calledOnce).to.be.true;
    expect(onSpeak.called).to.be.false;
  });
});

describe('createEmitterListener with multiple instances', () => {
  let emitter1: ReturnType<typeof createEmitterListener>;
  let emitter2: ReturnType<typeof createEmitterListener>;
  let onWinEmitter1: sinon.SinonSpy;
  let onSpeakEmitter1: sinon.SinonSpy;
  let onWinEmitter2: sinon.SinonSpy;
  let onSpeakEmitter2: sinon.SinonSpy;

  beforeEach(() => {
    emitter1 = createEmitterListener<{
      win: [];
      speak: [message: string];
    }>();

    emitter2 = createEmitterListener<{
      win: [];
      speak: [message: string];
    }>();

    onWinEmitter1 = sinon.spy();
    onSpeakEmitter1 = sinon.spy();
    onWinEmitter2 = sinon.spy();
    onSpeakEmitter2 = sinon.spy();
  });

  it('should not interfere between two instances for the same event type', () => {
    emitter1.listener.on('win', onWinEmitter1);
    emitter2.listener.on('win', onWinEmitter2);

    emitter1.emit('win');

    expect(onWinEmitter1.calledOnce).to.be.true;
    expect(onWinEmitter2.called).to.be.false;

    emitter2.emit('win');

    expect(onWinEmitter2.calledOnce).to.be.true;
    expect(onWinEmitter1.calledOnce).to.be.true; // Should still be true, not incremented by emitter2
  });

  it('should not interfere between two instances for different event types', () => {
    emitter1.listener.on('win', onWinEmitter1);
    emitter2.listener.on('speak', onSpeakEmitter2);

    emitter1.emit('win');
    emitter2.emit('speak', 'hello');

    expect(onWinEmitter1.calledOnce).to.be.true;
    expect(onSpeakEmitter2.calledOnce).to.be.true;

    expect(onWinEmitter1.calledWith()).to.be.true;
    expect(onSpeakEmitter2.calledWith('hello')).to.be.true;

    expect(onSpeakEmitter1.called).to.be.false;
    expect(onWinEmitter2.called).to.be.false;
  });

  it('should allow simultaneous emission from both instances without interference', () => {
    emitter1.listener.on('speak', onSpeakEmitter1);
    emitter2.listener.on('speak', onSpeakEmitter2);

    emitter1.emit('speak', 'hello from emitter1');
    emitter2.emit('speak', 'hello from emitter2');

    expect(onSpeakEmitter1.calledOnce).to.be.true;
    expect(onSpeakEmitter2.calledOnce).to.be.true;

    expect(onSpeakEmitter1.calledWith('hello from emitter1')).to.be.true;
    expect(onSpeakEmitter2.calledWith('hello from emitter2')).to.be.true;
  });

  it('should maintain independent listener lists for each instance', () => {
    emitter1.listener.on('win', onWinEmitter1);
    emitter2.listener.on('win', onWinEmitter2);

    emitter1.listener.off('win', onWinEmitter1);
    emitter2.emit('win');

    expect(onWinEmitter1.called).to.be.false;
    expect(onWinEmitter2.calledOnce).to.be.true;
  });
});

describe('listener.on returns the kill switch', () => {
  let emitter: ReturnType<typeof createEmitterListener>;
  let onWin: sinon.SinonSpy;
  let onSpeak: sinon.SinonSpy;

  beforeEach(() => {
    emitter = createEmitterListener<{
      win: [];
      speak: [message: string];
    }>();

    onWin = sinon.spy();
    onSpeak = sinon.spy();
  });

  it('should return a function that unsubscribes the event listener', () => {
    const unsubscribeWin = emitter.listener.on('win', onWin);

    emitter.emit('win');
    expect(onWin.calledOnce).to.be.true;

    unsubscribeWin();
    emitter.emit('win');
    expect(onWin.calledOnce).to.be.true; // Should still be called only once
  });

  it('should work with multiple listeners on the same event', () => {
    const unsubscribeWin1 = emitter.listener.on('win', onWin);
    const anotherOnWin = sinon.spy();
    const unsubscribeWin2 = emitter.listener.on('win', anotherOnWin);

    emitter.emit('win');
    expect(onWin.calledOnce).to.be.true;
    expect(anotherOnWin.calledOnce).to.be.true;

    unsubscribeWin1(); // Unsubscribing the first listener
    emitter.emit('win');
    expect(onWin.calledOnce).to.be.true; // Should still be called only once
    expect(anotherOnWin.calledTwice).to.be.true; // Should be called twice now

    unsubscribeWin2(); // Unsubscribing the second listener
    emitter.emit('win');
    expect(onWin.calledOnce).to.be.true; // No change
    expect(anotherOnWin.calledTwice).to.be.true; // No change
  });

  it('should allow unsubscribing from an event that has already been emitted', () => {
    const unsubscribeSpeak = emitter.listener.on('speak', onSpeak);

    emitter.emit('speak', 'first message');
    expect(onSpeak.calledOnce).to.be.true;
    expect(onSpeak.calledWith('first message')).to.be.true;

    unsubscribeSpeak();
    emitter.emit('speak', 'second message');
    expect(onSpeak.calledOnce).to.be.true; // Should still be called only once
  });
});
