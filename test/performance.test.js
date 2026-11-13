import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildLiveImagesResponse, getLiveImages, invalidateLiveImages } from '../server/utils/liveImagesCache.js';
import { withoutInlineProductVideos } from '../server/services/dbService.js';

const sampleItems = [{ brand: 'Apple', model: 'iPhone 13', image_url: 'https://cdn.example/iphone-13.jpg', custom_image: true }];
const updatedItems = [{ ...sampleItems[0], image_url: 'https://cdn.example/new.jpg' }];

describe('live images cache', () => {
  beforeEach(() => {
    invalidateLiveImages();
  });

  it('reads the database once for many requests', async () => {
    let databaseReads = 0;
    const loader = async () => {
      databaseReads += 1;
      return sampleItems;
    };

    await getLiveImages(loader);
    await getLiveImages(loader);
    await getLiveImages(loader);

    assert.equal(databaseReads, 1);
  });

  it('shares one database read between concurrent requests', async () => {
    let databaseReads = 0;
    const slowLoader = async () => {
      databaseReads += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return sampleItems;
    };

    const results = await Promise.all([getLiveImages(slowLoader), getLiveImages(slowLoader), getLiveImages(slowLoader)]);

    assert.equal(databaseReads, 1);
    assert.equal(new Set(results.map((r) => r.version)).size, 1);
  });

  it('keeps the same version while the data is unchanged', async () => {
    const first = await getLiveImages(async () => sampleItems);
    invalidateLiveImages();
    const second = await getLiveImages(async () => [...sampleItems]);

    assert.equal(first.version, second.version);
  });

  it('changes the version and reloads after an image is updated', async () => {
    const before = await getLiveImages(async () => sampleItems);
    invalidateLiveImages();
    const after = await getLiveImages(async () => updatedItems);

    assert.notEqual(before.version, after.version);
    assert.equal(after.items[0].image_url, 'https://cdn.example/new.jpg');
  });

  it('does not keep a read that started before an image was updated', async () => {
    let releaseOldRead;
    const oldRead = getLiveImages(
      () => new Promise((resolve) => {
        releaseOldRead = () => resolve(sampleItems);
      }),
    );

    // The admin saves a new image while the old read is still in flight.
    invalidateLiveImages();
    releaseOldRead();
    await oldRead;

    const next = await getLiveImages(async () => updatedItems);

    assert.equal(next.items[0].image_url, 'https://cdn.example/new.jpg');
  });

  it('does not cache a failed database read', async () => {
    await assert.rejects(getLiveImages(async () => {
      throw new Error('database unavailable');
    }));

    const recovered = await getLiveImages(async () => sampleItems);

    assert.deepEqual(recovered.items, sampleItems);
  });
});

describe('live images endpoint reply', () => {
  const snapshot = { items: sampleItems, version: 'abc123' };

  it('sends the full payload to a client with no version', () => {
    const reply = buildLiveImagesResponse(snapshot, undefined);

    assert.deepEqual(reply.data, sampleItems);
    assert.equal(reply.version, 'abc123');
    assert.equal(reply.unchanged, undefined);
  });

  it('sends only an "unchanged" marker to a client that is up to date', () => {
    const reply = buildLiveImagesResponse(snapshot, 'abc123');

    assert.equal(reply.unchanged, true);
    assert.equal(reply.data, undefined);
    assert.equal(reply.count, 1);
  });

  it('sends the full payload when the client version is stale or malformed', () => {
    for (const clientVersion of ['old-version', '', ['abc123'], { $ne: null }]) {
      const reply = buildLiveImagesResponse(snapshot, clientVersion);

      assert.deepEqual(reply.data, sampleItems, JSON.stringify(clientVersion));
    }
  });
});

describe('inline product videos in list responses', () => {
  const inlineVideo = `data:video/mp4;base64,${'A'.repeat(1000)}`;
  const products = [
    { id: 'p1', title: 'iPhone 13', seller_id: 'vendor_1', video_url: inlineVideo },
    { id: 'p2', title: 'Galaxy S24', seller_id: 'vendor_2', video_url: 'https://cdn.example/s24.mp4' },
    { id: 'p3', title: 'Pixel 9', seller_id: 'vendor_2', video_url: null },
    { id: 'p4', title: 'OnePlus 12', seller_id: 'vendor_2', video_url: inlineVideo },
  ];

  it('removes base64 videos for anonymous visitors but flags that one exists', () => {
    const result = withoutInlineProductVideos('products', null, products);

    assert.equal(result[0].video_url, null);
    assert.equal(result[0].has_video, true);
  });

  it('removes base64 videos for signed-in customers too', () => {
    const result = withoutInlineProductVideos('products', { sub: 'cust_1', role: 'customer' }, products);

    assert.equal(result[0].video_url, null);
    assert.equal(result[0].has_video, true);
  });

  it('keeps normal hosted video links', () => {
    const result = withoutInlineProductVideos('products', null, products);

    assert.equal(result[1].video_url, 'https://cdn.example/s24.mp4');
    assert.equal(result[2].video_url, null);
    assert.equal(result[2].has_video, undefined);
  });

  it('keeps the full video for admins and inventory staff so edits never drop it', () => {
    const forAdmin = withoutInlineProductVideos('products', { sub: 'admin_1', role: 'admin' }, products);
    const forStaff = withoutInlineProductVideos('products', { sub: 'staff_1', role: 'staff', permissions: ['inventory'] }, products);

    assert.equal(forAdmin[0].video_url, inlineVideo);
    assert.equal(forStaff[0].video_url, inlineVideo);
  });

  it('removes the video for staff without the inventory permission', () => {
    const result = withoutInlineProductVideos('products', { sub: 'staff_2', role: 'staff', permissions: ['orders'] }, products);

    assert.equal(result[0].video_url, null);
  });

  it('keeps the video only on a vendor\'s own products', () => {
    const result = withoutInlineProductVideos('products', { sub: 'vendor_1', role: 'vendor' }, products);

    assert.equal(result[0].video_url, inlineVideo, 'own product keeps its video');
    assert.equal(result[3].video_url, null, 'another seller\'s product does not');
  });

  it('does not touch other tables or the original documents', () => {
    const result = withoutInlineProductVideos('master_phones', null, products);

    assert.equal(result, products);
    withoutInlineProductVideos('products', null, products);
    assert.equal(products[0].video_url, inlineVideo);
  });
});
