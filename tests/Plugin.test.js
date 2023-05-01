import Slack from '../src';
import { MockAgent, setGlobalDispatcher } from 'undici';

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);
mockAgent.disableNetConnect();

const pool = mockAgent.get('https://fake-webhook.com');

describe('Test slack plugin.', () => {
  let plugin = null;

  beforeEach(() => {
    plugin = new Slack('https://fake-webhook.com');
  });

  afterEach(() => {
    mockAgent.assertNoPendingInterceptors();
    jest.resetModules();
    jest.resetAllMocks();
  });

  test('Sends message to defined URI.', async () => {
    let resultJson = null;
    pool.intercept({
      path: '/',
      method: 'POST'
    }).reply((r) => {
      resultJson = JSON.parse(r.body);
      return { statusCode: 200 };
    });

    await expect(plugin.log('test', 12345678, 'Message message!')).resolves.toBeUndefined();
    expect(resultJson).toEqual(
      {
        blocks: [
          {
            text: {
              text: '_*TEST!*_\n_<!date^12346^{date_num} {time_secs}|1970-01-01T03:25:45.678Z>_',
              type: 'mrkdwn'
            },
            type: 'section'
          },
          {
            type: 'divider'
          },
          {
            text: {
              text: 'Message message!',
              type: 'plain_text'
            },
            type: 'section'
          }
        ],
        channel: null,
        text: "A log message with the tag 'test' was logged!",
        username: 'Yolog'
      });
  });

  test('Sends message with changed time-format.', async () => {
    let resultJson = null;
    pool.intercept({
      path: '/',
      method: 'POST'
    }).reply((r) => {
      resultJson = JSON.parse(r.body);
      return { statusCode: 200 };
    });

    plugin.timeFormat = (t) => t;
    await expect(plugin.log('error', 12345678, 'Message message!', new Error())).resolves.toBeUndefined();

    expect(resultJson).toEqual({
      blocks: [
        {
          text: {
            text: '_*ERROR!*_\n_<!date^12346^{date_num} {time_secs}|12345678>_',
            type: 'mrkdwn'
          },
          type: 'section'
        },
        {
          type: 'divider'
        },
        {
          text: {
            text: 'Message message!',
            type: 'plain_text'
          },
          type: 'section'
        },
        {
          elements: [
            {
              text: '_*CallStack:*_',
              type: 'mrkdwn'
            },
            {
              text: expect.any(String),
              type: 'mrkdwn'
            }
          ],
          type: 'context'
        }
      ],
      channel: null,
      text: 'A log message with the tag \'error\' was logged!',
      username: 'Yolog'
    });
  });

  test('Sends message with changed notification text.', async () => {
    let resultJson = null;
    pool.intercept({
      path: '/',
      method: 'POST'
    }).reply((r) => {
      resultJson = JSON.parse(r.body);
      return { statusCode: 200 };
    });

    plugin.notificationText = 'Test test';
    await expect(plugin.log('test', 12345678, 'Message message!')).resolves.toBeUndefined();

    expect(resultJson).toEqual({
      blocks: [
        {
          text: {
            text: '_*TEST!*_\n_<!date^12346^{date_num} {time_secs}|1970-01-01T03:25:45.678Z>_',
            type: 'mrkdwn'
          },
          type: 'section'
        },
        {
          type: 'divider'
        },
        {
          text: {
            text: 'Message message!',
            type: 'plain_text'
          },
          type: 'section'
        }
      ],
      channel: null,
      text: 'Test test',
      username: 'Yolog'
    });
  });

  test('Throws error on fetch error.', async () => {
    pool.intercept({
      path: '/',
      method: 'POST'
    }).replyWithError(new Error('Tis was an errors!'));

    return expect(plugin.log('test', 12345678, 'Message message!')).rejects.toThrow('Tis was an errors!');
  });
})
;
