import { EpochDateFormatPipe } from './epoch-date-format.pipe';

describe('EpochDateFormatPipe', () => {
  let commonService;
  it('create an instance', () => {
    const pipe = new EpochDateFormatPipe(commonService);
    expect(pipe).toBeTruthy();
  });
});
