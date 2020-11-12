import funcForMock from './funcForMock';

export default class MockGameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  static load() {
    try {
      const data = funcForMock();
      return JSON.parse(data);
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
