describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should see get started', async () => {
    await expect(element(by.id('homeBG'))).toExist()
  });
})
