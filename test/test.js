function rand(l, r) {
    return l + Math.round(Math.random() * (r - l));
}
var character_table = "0123456789abcdefghijklmnopqrstuvwxyz";
function random_string(length) {
    if (length === void 0) { length = 32; }
    return Array.apply(null, Array(length)).map(function () { return character_table[rand(0, character_table.length - 1)]; }).join('');
}
console.log(Array.apply(null, Array(32)).map(function () { return 1; }));
// console.log(character_table[rand(0, character_table.length - 1)]);
console.log(random_string());
