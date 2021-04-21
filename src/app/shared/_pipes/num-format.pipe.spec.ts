import { NumFormatPipe } from './num-format.pipe';

describe('NumFormatPipe', () => {
  let commonService;
  it('create an instance', () => {
    const pipe = new NumFormatPipe(commonService);
    expect(pipe).toBeTruthy();
  });
});
