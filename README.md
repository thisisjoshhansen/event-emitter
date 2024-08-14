# EventEmitter Implementation

This repository contains an implementation of a TypeScript-based event emitter utility, including a pair of interfaces (`createEmitterListener` and `EventEmitter`) for managing events and their listeners. This utility is designed to provide a lightweight and type-safe mechanism for emitting and handling events in TypeScript projects.

## Features

- **Type-Safe Event Handling:** Both `createEmitterListener` and `EventEmitter` allow for type-safe event handling, ensuring that event listeners receive the correct parameters.
- **Event Subscription and Unsubscription:** Easily subscribe to and unsubscribe from events using the `on` and `off` methods.
- **Independent Instances:** Multiple instances can operate independently without interference, preventing event crossover.
- **Automatic Unsubscription:** The `on` method returns a function that can be called to automatically unsubscribe the event listener.

## Installation

To use this utility in your project, simply clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/event-emitter-ts.git
cd event-emitter-ts
npm install
```

## Usage

### `createEmitterListener`

The `createEmitterListener` function provides an object with `listener` and `emit` methods. Here's an example:

```typescript
const { listener, emit } = createEmitterListener<{
  win: [];
  speak: [message: string];
}>();

listener.on('win', () => {
  console.log('You win!');
});

listener.on('speak', (message) => {
  console.log(message);
});

emit('win'); // Logs: "You win!"
emit('speak', 'Hello, world!'); // Logs: "Hello, world!"
```

### `EventEmitter`

The `EventEmitter` class merges the `on`, `off`, and `emit` methods together in a single instance:

```typescript
const eventEmitter = new EventEmitter<{
  win: [];
  speak: [message: string];
}>();

eventEmitter.on('win', () => {
  console.log('You win!');
});

eventEmitter.on('speak', (message) => {
  console.log(message);
});

eventEmitter.emit('win'); // Logs: "You win!"
eventEmitter.emit('speak', 'Hello, world!'); // Logs: "Hello, world!"
```

## Running Tests

This repository includes a comprehensive test suite to ensure the functionality of the `createEmitterListener` and `EventEmitter` implementations.

To run the tests, use the following command:

```bash
npm test
```

The test suite uses [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/), and [Sinon](https://sinonjs.org/) to cover various scenarios, including multiple instances and automatic unsubscription.

## License

This project is licensed under the ISC License. See the [LICENSE](https://opensource.org/license/isc-license-txt) file for details.
