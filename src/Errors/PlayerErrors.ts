export class AuthorizationError extends Error {
  constructor() {
    super('Authorization Error');
  }
}

export class MultiTabConnectionError extends Error {
  constructor() {
    super('Multi-tab is not supported');
  }
}

