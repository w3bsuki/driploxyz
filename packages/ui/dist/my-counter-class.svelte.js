var Counter = /** @class */ (function () {
    function Counter() {
        var _this = this;
        this.count = $state(0);
        this.increment = function () {
            _this.count++;
        };
        this.decrement = function () {
            _this.count--;
        };
    }
    return Counter;
}());
export { Counter };
