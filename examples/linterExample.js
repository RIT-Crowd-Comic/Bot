

// semicolons required

let foo = 'foo';
let fuz = 'fuz';

// multiline-ternary
let fiz = foo ? foo : fuz;
fiz = fiz?
    fiz :
    foo ? 
        foo : 
        fuz;

// array-bracket-newline
let arr = [1, 2, 3];
let azz = [
    1,
    2, 
    3
];

// key-spacing (objects)
let obj = {
    short:      'short',
    longerName: 'long'
};


// arrow parens
let bar = () => {};

let baz = foo => 'baz';

// block spacing
let bab = (foo, fuz) => { return true; };

// function-call-argument-newline
bab(foo, fuz);
bab(
    foo,
    fuz
);

// function-call-spacing
if (foo) bar();

// brace styles 
if (foo) {
    bar();
} else if (fuz) {
    bar();
} else {
    baz();
}

class Foo {
    constructor() {
        this.foo = foo;
        this.fuz = fuz;
    }

    // computed property spacing for classes
    [baz()] () {
        return this;
    }
}

// multiline-comment-style (currently disabled)
// new-parens
// dot-location
new Foo()
    .baz()
    .baz()
    .foo;

// eol-last: new line at EOF
