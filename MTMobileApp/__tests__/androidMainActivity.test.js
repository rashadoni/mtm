const { readFileSync } = require('fs');
const { resolve } = require('path');

describe('Android activity lifecycle', () => {
  it('disables screen-fragment restoration', () => {
    const mainActivity = readFileSync(
      resolve(
        __dirname,
        '../android/app/src/main/java/com/mtmobileapp/MainActivity.kt',
      ),
      'utf8',
    );

    expect(mainActivity).toContain('super.onCreate(null)');
  });
});
