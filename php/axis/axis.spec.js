const request = require('supertest');

const app = require('../../server/app');

describe('GET /api/shipments', () => {
  it('return 400 on no packages for shipments', (done) => {
    request(app)
      .post('/api/axis/success')
      .send({
          MerchantId: '13I000000000978',
        EncDataResp: 'KuSwvaaqwarEbswIHt2DhdcOLLwwoHFZzh0CSFXxZDdxPdRwszT7wfRp+tA5mOol4Q+LKimEM+mkwzHQjOsHi1A03PTyN8JpBywItIg+DnGxkM1QEhzMaJpgBxzNKnc7Zj3a9IeOd1wTUfiKka2cd6yDNPlw6DoFLSAs/4OD/vFYk0Jf9osJJx+KBmDE65feWLQKmqBCAjgn+zkWZgkuBNUX2oULTQrmMTyyfnVXuHeRWdyiFAe6iHQxAizq9dvSWMyHFugaA5JcASPtf4JkN7+KEriYAAkZV0nJ3eZGoq2G0fCfLCIGVaR416oTKBD+JYuqpJ3IUkJdhfoVwcxIGGX/fT0nsbySXwGT44j/F/MaV5V3Z4TYiENAZW26sQDxBt/+ugVqRRmOaC47P8TSun9LMzgBNzns9eHD3vknsVuYZgZIpwwF8w0HY+iFPZgmuk5BGRsPnFpuBFlt8VQpumNxi0b2blaF2O6iOvvTHSm8wqsQeUxDcWUAm3oXz/IrqBUNR0M0QoxHB85ry/9R9+j+f6i9FYmXCejvkeSgbvjE/4x7JKA7l4XgE1EkcIMknLpvH+Lx2xpRGrtn1sTmWz3QNCFKgbHGeyy/NpfdZxRpXnfol7xiDuHbkm+ZCri7eyQ0VkWDwmHJPOKjywIAQX6BQ3bbBGqdaH2HkuKfx1e+o+HKuJxcDUiiwFXFwRF+QK3ufwF5DtaudtmL1gYLeiQgsO4wnGQYosvMF7jc+KpPyRVELMD0DYNy7Yzcw46bW1RDzymdAlLXZaWYZhVYZEoL+jaeEtjhKPMsQ2k97GLX5TYRJCwrv/ghcSt7iyythQ2X+1F2jEySmP3VkoFnMlVjovWcNzcZZGHMcWHYc+Qe4XF016ROO358DTrkYdTegmnoivh5+wGYhR0d2DpzEQg4j7Qc5Lvg+x88u+HMaDhcFMUhnbMdC9geqi8Bofr+xttwcK2iQlrlGe3yJ99KKnSgT7IJbnBJdERVyujCHjW3rH5UHkAwawUUr2GkzI5fG6GVjjGfuI39XwgiIr88X9kkkHW9VXr6dg3cuooFT4t2V9BL7fD4HQK4v0UrsuZMCEXLXruZM9+uqGzBO5LysxrjWeb57fKnN8oMRPmJbRPJf5DcoKv979ZEIPRuNSzvgHTXlW0lFT54Q2QamsIi3sQpUhEy+vy5yXqYmlyjzMk=',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
