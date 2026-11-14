import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createMediaUploader,
  getCloudinaryConfig,
  isInlineImage,
  offloadMediaForSave,
  offloadInlineMedia,
  publicIdFor,
  signParams,
  withDeliveryTransform,
  MAX_MEDIA_PER_SAVE,
} from '../server/services/cloudinary.js';

const photo = (seed) => `data:image/jpeg;base64,${seed.repeat(1200)}`;
const quietLog = { warn: () => {} };

/** An uploader that never touches the network. */
const fakeUploader = (behaviour = {}) => {
  const calls = [];
  return {
    calls,
    async upload(dataUrl, folder) {
      calls.push({ dataUrl, folder });
      if (behaviour.fail?.(dataUrl)) throw new Error('boom');
      return { url: `https://res.cloudinary.com/demo/image/upload/${publicIdFor(dataUrl)}.jpg`, publicId: publicIdFor(dataUrl) };
    },
  };
};

describe('getCloudinaryConfig', () => {
  it('reads CLOUDINARY_URL', () => {
    assert.deepEqual(getCloudinaryConfig({ CLOUDINARY_URL: 'cloudinary://key123:secret456@mycloud' }), {
      apiKey: 'key123',
      apiSecret: 'secret456',
      cloudName: 'mycloud',
    });
  });

  it('reads the three separate variables', () => {
    const env = { CLOUDINARY_CLOUD_NAME: 'c', CLOUDINARY_API_KEY: 'k', CLOUDINARY_API_SECRET: 's' };
    assert.deepEqual(getCloudinaryConfig(env), { cloudName: 'c', apiKey: 'k', apiSecret: 's' });
  });

  it('returns null when nothing or only part is set', () => {
    assert.equal(getCloudinaryConfig({}), null);
    assert.equal(getCloudinaryConfig({ CLOUDINARY_URL: 'cloudinary://<your_api_key>:<your_api_secret>@' }), null);
    assert.equal(getCloudinaryConfig({ CLOUDINARY_CLOUD_NAME: 'c', CLOUDINARY_API_KEY: 'k' }), null);
  });
});

describe('signParams', () => {
  it('matches the signature Cloudinary documents (sorted pairs + secret, SHA-1)', () => {
    // Example from Cloudinary's "Generating authentication signatures" guide.
    const signature = signParams(
      { eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop', public_id: 'sample_image', timestamp: 1315060510 },
      'abcd',
    );
    assert.equal(signature, 'bfd09f95f331f558cbd1320e67aa8d488770583e');
  });

  it('ignores empty values and does not depend on key order', () => {
    const a = signParams({ timestamp: 1, folder: 'f', public_id: 'p', extra: '' }, 's');
    const b = signParams({ public_id: 'p', folder: 'f', timestamp: 1 }, 's');
    assert.equal(a, b);
  });
});

describe('isInlineImage', () => {
  it('accepts large base64 images only', () => {
    assert.equal(isInlineImage(photo('A')), true);
    assert.equal(isInlineImage('data:image/png;base64,AAAA'), false);
    assert.equal(isInlineImage('https://res.cloudinary.com/demo/image/upload/a.jpg'), false);
    assert.equal(isInlineImage(`data:video/mp4;base64,${'A'.repeat(2000)}`), false);
    assert.equal(isInlineImage(null), false);
  });
});

describe('withDeliveryTransform', () => {
  it('adds automatic format and quality once', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/fundu/a.jpg';
    const optimised = withDeliveryTransform(url);

    assert.equal(optimised, 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/fundu/a.jpg');
    assert.equal(withDeliveryTransform(optimised), optimised);
  });

  it('leaves other addresses alone', () => {
    assert.equal(withDeliveryTransform('https://fdn2.gsmarena.com/a.jpg'), 'https://fdn2.gsmarena.com/a.jpg');
    assert.equal(withDeliveryTransform(undefined), undefined);
  });
});

describe('createMediaUploader', () => {
  const config = { cloudName: 'demo', apiKey: 'key', apiSecret: 'secret' };

  it('sends a signed upload to the right account and returns the delivery address', async () => {
    let request;
    const fetchImpl = async (url, init) => {
      request = { url, form: init.body };
      return { ok: true, status: 200, json: async () => ({ secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/fundu/products/x.jpg', public_id: 'fundu/products/x', bytes: 1234 }) };
    };
    const uploader = createMediaUploader({ config, fetchImpl, nowSeconds: () => 1700000000 });
    const dataUrl = photo('B');

    const result = await uploader.upload(dataUrl, 'Products');

    assert.equal(request.url, 'https://api.cloudinary.com/v1_1/demo/image/upload');
    assert.equal(request.form.get('file'), dataUrl);
    assert.equal(request.form.get('api_key'), 'key');
    assert.equal(request.form.get('folder'), 'fundu/products');
    assert.equal(request.form.get('public_id'), publicIdFor(dataUrl));
    assert.equal(request.form.get('timestamp'), '1700000000');
    assert.equal(
      request.form.get('signature'),
      signParams({ folder: 'fundu/products', public_id: publicIdFor(dataUrl), timestamp: 1700000000 }, 'secret'),
    );
    assert.equal(request.form.get('api_secret'), null, 'the secret must never be sent');
    assert.equal(result.url, 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/fundu/products/x.jpg');
  });

  it('turns an API error into a readable error', async () => {
    const fetchImpl = async () => ({ ok: false, status: 401, json: async () => ({ error: { message: 'Invalid api_key' } }) });
    const uploader = createMediaUploader({ config, fetchImpl });

    await assert.rejects(() => uploader.upload(photo('C')), /Invalid api_key/);
  });

  it('reports the status when the reply is not JSON', async () => {
    const fetchImpl = async () => ({ ok: false, status: 502, json: async () => { throw new Error('not json'); } });
    const uploader = createMediaUploader({ config, fetchImpl });

    await assert.rejects(() => uploader.upload(photo('D')), /HTTP 502/);
  });
});

describe('offloadInlineMedia', () => {
  it('replaces photos anywhere in the data and leaves the input untouched', async () => {
    const uploader = fakeUploader();
    const original = { title: 'Phone', images: [photo('A'), 'https://example.com/a.jpg', photo('B')], extra: { image_url: photo('A') } };
    const snapshot = JSON.stringify(original);

    const result = await offloadInlineMedia(original, uploader, { folder: 'products' });

    assert.equal(JSON.stringify(original), snapshot);
    assert.equal(result.uploaded, 2, 'the same photo used twice is uploaded once');
    assert.equal(result.failed, 0);
    assert.match(result.value.images[0], /^https:\/\/res\.cloudinary\.com\//);
    assert.equal(result.value.images[1], 'https://example.com/a.jpg');
    assert.equal(result.value.extra.image_url, result.value.images[0]);
    assert.equal(uploader.calls.every((call) => call.folder === 'products'), true);
  });

  it('keeps a photo inline when its upload fails and still replaces the others', async () => {
    const bad = photo('X');
    const uploader = fakeUploader({ fail: (dataUrl) => dataUrl === bad });
    const errors = [];

    const result = await offloadInlineMedia({ images: [bad, photo('Y')] }, uploader, { onError: (e) => errors.push(e.message) });

    assert.equal(result.value.images[0], bad);
    assert.match(result.value.images[1], /^https:\/\/res\.cloudinary\.com\//);
    assert.deepEqual({ uploaded: result.uploaded, failed: result.failed }, { uploaded: 1, failed: 1 });
    assert.deepEqual(errors, ['boom']);
  });

  it('does nothing when there are no inline photos', async () => {
    const uploader = fakeUploader();
    const value = { name: 'x', images: ['https://example.com/a.jpg'] };

    const result = await offloadInlineMedia(value, uploader);

    assert.equal(result.value, value);
    assert.equal(uploader.calls.length, 0);
  });

  it('uploads at most MAX_MEDIA_PER_SAVE photos per save', async () => {
    const uploader = fakeUploader();
    const images = Array.from({ length: MAX_MEDIA_PER_SAVE + 3 }, (_, i) => photo(String.fromCharCode(65 + (i % 26))) + i);

    const result = await offloadInlineMedia({ images }, uploader);

    assert.equal(uploader.calls.length, MAX_MEDIA_PER_SAVE);
    assert.equal(result.skipped, 3);
  });

  it('never runs more uploads at once than the limit', async () => {
    let running = 0;
    let peak = 0;
    const uploader = {
      async upload(dataUrl) {
        running += 1;
        peak = Math.max(peak, running);
        await new Promise((resolve) => setTimeout(resolve, 5));
        running -= 1;
        return { url: `https://res.cloudinary.com/demo/image/upload/${publicIdFor(dataUrl)}.jpg` };
      },
    };
    const images = Array.from({ length: 10 }, (_, i) => `data:image/png;base64,${'Z'.repeat(1200)}${i}`);

    await offloadInlineMedia({ images }, uploader, { concurrency: 3 });

    assert.equal(peak <= 3, true);
  });
});

describe('offloadMediaForSave', () => {
  it('hands the data back untouched when Cloudinary is not configured', async () => {
    const value = { images: [photo('A')] };

    assert.equal(await offloadMediaForSave(value, { uploader: null }), value);
  });

  it('never throws into a save', async () => {
    const value = { images: [photo('A')] };
    const explodingUploader = { upload: async () => { throw new Error('network down'); } };

    const result = await offloadMediaForSave(value, { uploader: explodingUploader, log: quietLog });

    assert.equal(result.images[0], value.images[0]);
  });
});

describe('listInlineMedia', () => {
  it('lists each inline photo with its position', async () => {
    const { listInlineMedia } = await import('../server/services/cloudinary.js');
    const doc = {
      title: 'x',
      images: ['https://example.com/a.jpg', photo('A')],
      device_photos: { front: photo('B'), back: '' },
      nested: [{ avatar: photo('C') }],
    };

    assert.deepEqual(
      listInlineMedia(doc).map((entry) => entry.path),
      ['images.1', 'device_photos.front', 'nested.0.avatar'],
    );
  });

  it('finds nothing in a document without inline photos', async () => {
    const { listInlineMedia } = await import('../server/services/cloudinary.js');
    assert.deepEqual(listInlineMedia({ images: ['https://example.com/a.jpg'], n: 1 }), []);
  });
});

describe('videos', () => {
  const video = (seed) => `data:video/mp4;base64,${seed.repeat(1500)}`;

  it('recognises inline videos and tells them apart from photos', async () => {
    const { isInlineVideo, isInlineMedia, mediaKind } = await import('../server/services/cloudinary.js');

    assert.equal(isInlineVideo(video('A')), true);
    assert.equal(isInlineVideo(photo('A')), false);
    assert.equal(isInlineMedia(video('A')) && isInlineMedia(photo('A')), true);
    assert.equal(isInlineMedia(`data:video/mp4;base64,AAAA`), false);
    assert.equal(mediaKind(video('A')), 'video');
    assert.equal(mediaKind(photo('A')), 'image');
  });

  it('uploads a video to the video endpoint and keeps it a plain mp4 with automatic quality', async () => {
    const { createMediaUploader } = await import('../server/services/cloudinary.js');
    let requestedUrl;
    const fetchImpl = async (url) => {
      requestedUrl = url;
      return { ok: true, status: 200, json: async () => ({ secure_url: 'https://res.cloudinary.com/demo/video/upload/v1/fundu/products/v.mp4', public_id: 'fundu/products/v', bytes: 99 }) };
    };
    const uploader = createMediaUploader({ config: { cloudName: 'demo', apiKey: 'k', apiSecret: 's' }, fetchImpl });

    const result = await uploader.upload(video('B'), 'products');

    assert.equal(requestedUrl, 'https://api.cloudinary.com/v1_1/demo/video/upload');
    assert.equal(result.url, 'https://res.cloudinary.com/demo/video/upload/q_auto/v1/fundu/products/v.mp4');
    assert.equal(result.kind, 'video');
  });

  it('adds the video transform once and never mixes it up with photos', () => {
    const url = 'https://res.cloudinary.com/demo/video/upload/v1/a.mp4';
    const once = withDeliveryTransform(url);

    assert.equal(withDeliveryTransform(once), once);
    assert.equal(withDeliveryTransform('https://res.cloudinary.com/demo/image/upload/v1/a.jpg'), 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/a.jpg');
  });

  it('moves videos and photos in one save', async () => {
    const uploader = fakeUploader();
    const result = await offloadInlineMedia({ video_url: video('C'), images: [photo('D')] }, uploader, { folder: 'products' });

    assert.equal(result.uploaded, 2);
    assert.match(result.value.video_url, /^https:\/\/res\.cloudinary\.com\//);
    assert.match(result.value.images[0], /^https:\/\/res\.cloudinary\.com\//);
  });
});
