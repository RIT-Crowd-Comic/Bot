

// semicolons required

let foo = 'foo';
let fuz = 'fuz';
let foz = 'foz';

// multiline-ternary
// operator-linebreak
let fiz = foo ? foo : fuz;
fiz = fiz ?
    fiz :
    foo ?
        foo :
        fuz;

// array-bracket-newline
let arr = [1, 2, 3];
let azz = [
    1, 2,
    3
];

// space-infix-ops
let math = 5 + 2 + 3;

// space-unary-ops
math++;

// key-spacing (objects)
// object-property-newline
// quote-props
let obj = {
    'shorter':    'short',
    'longerName': 'long',
    'quote-prop': 'required quotes',
    '123':        '123'
};

// object-curly-newline
// object-curly-spacing
let inline_obj = { foo, fuz, fiz };
let inline_long_obj = {
    foo, fuz, fiz, foz
};

// rest-spread-spacing
let spread_obj = { ...inline_obj };


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
// space-before-blocks
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

// switch-colon-spacing
switch (foo) {
case 'foo': break;
case 'bar': break;
}

// wrap-iife
(function() {}());
(function() {})();

// wrap regex
(/foo/).test('bar');
'foo'.replace(/foo/, 'bar');

// eol-last: new line at EOF
