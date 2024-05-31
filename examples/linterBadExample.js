

//no space before comment


// semicolons required

let foo = 'foo'
let fuz = "fuz" // double quote not preferred
let foz = 'foz'

// multiline-ternary
// operator-linebreak
let fiz = foo ? foo // inconsistent line break
: fuz;

fiz = fiz ?
    fiz :
    foo ?
    foo
    : fuz; // operator before

// array-bracket-newline
let arr = [ 1,2,3 ]; // space between brackets
let azz = [ 1, 2, // // no line break before multi-line array
    3
];

// space-infix-ops
let math = 5+2+3; // no space between

// space-unary-ops
math ++ ; // space between

// key-spacing (objects)
// object-property-newline
// quote-props
let obj = {
    shorter:    'short',
    'longerName': 'long',
    'quote-prop': 'required quotes',
    123:        '123' // numbers must have quotes
};

// object-curly-newline
let inline_obj = {foo, fuz, fiz};
let inline_long_obj = { foo, fuz, fiz, foz }; // too long

// rest-spread-spacing
let spread_obj = { ... inline_obj}; // space between spread


// arrow parens
let bar = () => {};

let baz = (foo) => 'baz'; // parens not needed

// block spacing
let bab = (foo, fuz) => { return true; };

// function-call-argument-newline
bab(foo, fuz);
bab(foo, // needs newline for multi-line
    fuz
);

// function-call-spacing
if (foo) bar () ; // spaces

// brace styles 
// space-before-blocks
if (foo) 
{ // bracket in wrong location
    bar();
} 
else if (fuz) {
    bar();
}
 else { // else in wrong location
    baz();
}

class Foo {
    constructor() {
        this.foo = foo;
        this.fuz = fuz;
    }

    // computed property spacing for classes
    [ baz() ] () { // spaces in property name
        return this;
    }
}

// multiline-comment-style (currently disabled)
// new-parens
// dot-location
new Foo().baz() // inconsistent chaining
    .baz(). // dot should be before prop
    foo;
new Foo().baz().baz().baz().baz().foo; // too long

// switch-colon-spacing
switch (foo) {
case 'foo'  : break; // space after case 'foo'
case 'bar'  : break;
}

// wrap-iife
// any wrapping is actually allowed
(function() {})();
(function() {})();

// wrap regex
/foo/.test('bar'); // must wrap in parentheses
'foo'.replace(/foo/, 'bar'); // this is fine

// eol-last: new line at EOF