let a = 0;
const unused = 'unused';
let foo = undef_var;

let obj = undefined;

let b = async () => {
    let a_ref = a;
    let thing = obj;
    if (thing) await delay(1000);
    let tmp = { a: a_ref };
    obj = tmp;
};

let reset = async () => {
    await delay(1000);
    obj = undefined;
};

b();

function delay (ms) { return new Promise(resolve => void setTimeout(resolve, ms)); }
