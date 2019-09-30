import Slack from '../src';
import fetch from 'node-fetch';

jest.mock('node-fetch');

describe('Test slack plugin.', () => {
  let plugin = null;

  beforeEach(() => {
    plugin = new Slack('https://fake-webhook.com');
  });

  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  test('Sends message to defined URI.', async () => {
    fetch.mockResolvedValue(() => Promise.resolve());
    await expect(plugin.log('test', 12345678, 'Message message!')).resolves.toBeUndefined();

    expect(fetch.mock.calls[0][0]).toEqual('https://fake-webhook.com');
    const resultJson = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resultJson).toEqual({
      username: 'Yolog',
      channel: null,
      attachments: [{
        pretext: 'A log message with the tag test, was logged at 1970-01-01T03:25:45.678Z.',
        fallback: '[TEST] (1970-01-01T03:25:45.678Z): Message message!',
        color: '#CCCC00',
        fields: [
          { title: 'TEST', value: 'Message message!', short: false }
        ]
      }]
    });
  });

  test('Sends message with changed time-format.', async () => {
    fetch.mockResolvedValue(() => Promise.resolve());
    plugin.timeFormat = (t) => t;
    await expect(plugin.log('error', 12345678, 'Message message!')).resolves.toBeUndefined();

    expect(fetch.mock.calls[0][0]).toEqual('https://fake-webhook.com');
    const resultJson = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resultJson).toEqual({
      username: 'Yolog',
      channel: null,
      attachments: [{
        pretext: 'A log message with the tag error, was logged at 12345678.',
        fallback: '[ERROR] (12345678): Message message!',
        color: 'danger',
        fields: [
          { title: 'ERROR', value: 'Message message!', short: false }
        ]
      }]
    });
  });

  test('Sends message with changed informal text.', async () => {
    fetch.mockResolvedValue(() => Promise.resolve());
    plugin.informalText = 'Test test';
    await expect(plugin.log('test', 12345678, 'Message message!')).resolves.toBeUndefined();

    expect(fetch.mock.calls[0][0]).toEqual('https://fake-webhook.com');
    const resultJson = JSON.parse(fetch.mock.calls[0][1].body);
    expect(resultJson).toEqual({
      username: 'Yolog',
      channel: null,
      attachments: [{
        pretext: 'Test test',
        fallback: '[TEST] (1970-01-01T03:25:45.678Z): Message message!',
        color: '#CCCC00',
        fields: [
          { title: 'TEST', value: 'Message message!', short: false }
        ]
      }]
    });
  });

  test('Throws error on fetch error.', async () => {
    fetch.mockImplementation(async () => throw Error('Tis was an errors!'));
    return expect(plugin.log('test', 12345678, 'Message message!')).rejects.toThrow('Tis was an errors!');
  });
});
