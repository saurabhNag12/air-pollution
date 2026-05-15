import handler from './api/sensors.ts';

const req = {
  method: 'GET',
  query: {}
};

const res = {
  setHeader: (key, val) => console.log(`Header: ${key} = ${val}`),
  status: (code) => {
    console.log(`Status: ${code}`);
    return res;
  },
  json: (data) => console.log("JSON:", data),
  end: () => console.log("End called")
};

async function test() {
  await handler(req as any, res as any);
}

test();
